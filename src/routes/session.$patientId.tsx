import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppLayout } from "@/components/Layout";
import { FrequencyPlayer } from "@/components/FrequencyPlayer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useServerFn } from "@tanstack/react-start";
import { analyzeAura, summarizeSession } from "@/server/ai.functions";
import { getFrequencyMeaning } from "@/lib/frequencyMeaning";
import { relaySession } from "@/lib/sessionRelay";
import { buildWhatsAppUrl, copyTextToClipboard, isValidWhatsAppPhone, normalizeWhatsAppPhone, openWhatsAppUrl } from "@/lib/whatsapp";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, Camera, Heart, Sparkles, CheckCircle2, Download, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/session/$patientId")({
  component: () => <AuthGate><AppLayout><Session /></AppLayout></AuthGate>,
});

type Pleito = { id: string; numero: number; nome: string; frequencia_hz: number | null; chakra_alvo: string | null };
type Patient = { id: string; name: string; clinical_indication: string | null; notes: string | null; phone: string | null; age: number | null; gender: string | null };

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// Downscale a data URL image to keep payload small for the AI gateway
async function downscaleDataUrl(dataUrl: string, maxSize = 768, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d");
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, w, h);
      try { resolve(c.toDataURL("image/jpeg", quality)); } catch { resolve(dataUrl); }
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// Simulated PPG: 60-90 BPM with stress correlation
function simulatedBPM(stressLevel: "calm" | "stressed") {
  return stressLevel === "calm" ? 60 + Math.round(Math.random() * 12) : 80 + Math.round(Math.random() * 18);
}

function Session() {
  const { patientId } = Route.useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const analyze = useServerFn(analyzeAura);
  const summarize = useServerFn(summarizeSession);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [pleitos, setPleitos] = useState<Pleito[]>([]);
  const [pleitoId, setPleitoId] = useState<string>("");
  const [step, setStep] = useState<"baseline" | "pleito" | "after" | "done">("baseline");

  const [baseline, setBaseline] = useState<{ aura: number; chakra: string; bpm: number; notes: string; image: string; frequencyHz: number; auraColor: string; auraColorHex: string } | null>(null);
  const [after, setAfter] = useState<{ aura: number; chakra: string; bpm: number; notes: string; image: string; frequencyHz: number; auraColor: string; auraColorHex: string } | null>(null);
  const [loadingStage, setLoadingStage] = useState<"before" | "after" | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [baselineConfirmed, setBaselineConfirmed] = useState(false);

  const baseInputId = useId();
  const afterInputId = useId();

  useEffect(() => {
    (async () => {
      const [{ data: pa }, { data: pl }] = await Promise.all([
        supabase.from("patients").select("id,name,clinical_indication,notes,phone,age,gender").eq("id", patientId).maybeSingle(),
        supabase.from("pleitos").select("id,numero,nome,frequencia_hz,chakra_alvo").order("numero"),
      ]);
      if (!pa) { toast.error("Paciente não encontrado"); nav({ to: "/patients" }); return; }
      setPatient(pa as Patient);
      setPleitos((pl ?? []) as Pleito[]);

      // Retomar sessão pendente: se existir baseline salva sem after, prefill
      const { data: openSess } = await supabase
        .from("sessions")
        .select("id, pleito_id, aura_before, stress_before, chakra_alvo, baseline_image_url, frequencia_before_hz, after_image_url")
        .eq("paciente_id", patientId)
        .is("after_image_url", null)
        .not("baseline_image_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (openSess && openSess.baseline_image_url) {
        setBaseline({
          aura: openSess.aura_before ?? 0,
          chakra: openSess.chakra_alvo ?? "—",
          bpm: openSess.stress_before ?? 0,
          notes: "",
          image: openSess.baseline_image_url,
          frequencyHz: Number(openSess.frequencia_before_hz) || 0,
          auraColor: "Verde",
          auraColorHex: "#22c55e",
        });
        if (openSess.pleito_id) setPleitoId(openSess.pleito_id);
        setSavedId(openSess.id);
        setBaselineConfirmed(true);
        setStep("after");
        toast.message("Sessão em aberto retomada — baseline já registrada");
      }
    })();
  }, [patientId, nav]);

  const analyzeCapture = async (stage: "before" | "after", imageBase64: string) => {
    setLoadingStage(stage);
    // Try progressively smaller images on failure
    const attempts: Array<{ maxSize: number; quality: number; label: string }> = [
      { maxSize: 768, quality: 0.82, label: "768px" },
      { maxSize: 512, quality: 0.75, label: "512px" },
      { maxSize: 384, quality: 0.7, label: "384px" },
    ];
    let lastError: unknown = null;
    try {
      for (let i = 0; i < attempts.length; i++) {
        const { maxSize, quality, label } = attempts[i];
        try {
          const small = await downscaleDataUrl(imageBase64, maxSize, quality).catch(() => imageBase64);
          const result = await analyze({ data: { imageBase64: small, stage } });
          const bpm = simulatedBPM(stage === "before" ? "stressed" : "calm");
          const payload = { aura: result.auraScore, chakra: result.chakra, bpm, notes: result.notes, image: small, frequencyHz: result.frequencyHz, auraColor: result.auraColor ?? "Verde", auraColorHex: result.auraColorHex ?? "#22c55e" };
          if (stage === "before") {
            setBaseline(payload);
            setStep("pleito");
            // Auto-suggest pleito matching detected chakra (com normalização de sinônimos)
            const chakraAliases: Record<string, string[]> = {
              "Raiz": ["Básico", "Raiz", "Muladhara"],
              "Básico": ["Básico", "Raiz", "Muladhara"],
              "Sacral": ["Sacral", "Svadhisthana"],
              "Plexo Solar": ["Plexo Solar", "Manipura"],
              "Cardíaco": ["Cardíaco", "Coração", "Anahata"],
              "Laríngeo": ["Laríngeo", "Garganta", "Vishuddha"],
              "Frontal": ["Terceiro Olho", "Frontal", "Ajna"],
              "Terceiro Olho": ["Terceiro Olho", "Frontal", "Ajna"],
              "Coronário": ["Coronário", "Coroa", "Sahasrara"],
            };
            const candidates = chakraAliases[result.chakra] ?? [result.chakra];
            const match =
              pleitos.find(p => p.chakra_alvo && candidates.includes(p.chakra_alvo)) ??
              pleitos.find(p => p.chakra_alvo === result.chakra);
            if (match) {
              setPleitoId(match.id);
              toast.success(`Pleito sugerido: #${match.numero} ${match.nome} (${match.frequencia_hz}Hz)`);
            }
          } else {
            setAfter(payload); setStep("done");
          }
          if (i > 0) toast.success(`Análise concluída na nova tentativa (${label})`);
          return;
        } catch (err) {
          lastError = err;
          console.error(`analyzeAura attempt ${i + 1} (${label}) failed`, err);
          if (i < attempts.length - 1) {
            toast.message("Reanalisando com imagem reduzida…");
            await new Promise((r) => setTimeout(r, 400));
          }
        }
      }
      toast.error(lastError instanceof Error ? `Falha na análise: ${lastError.message}` : "Falha na análise da imagem após várias tentativas");
    } finally {
      setLoadingStage(null);
    }
  };

  const captureStage = async (stage: "before" | "after", file: File) => {
    const b64 = await fileToBase64(file);
    await analyzeCapture(stage, b64);
  };

  const [savingStage, setSavingStage] = useState<"baseline" | "after" | null>(null);

  const saveBaseline = async () => {
    if (!baseline || !pleitoId || savedId) return;
    const pleito = pleitos.find(p => p.id === pleitoId)!;
    setSavingStage("baseline");
    try {
      const { data: inserted, error } = await supabase.from("sessions").insert({
        therapist_id: user!.id,
        paciente_id: patientId,
        pleito_id: pleitoId,
        aura_before: baseline.aura,
        stress_before: baseline.bpm,
        frequencia_hz: pleito.frequencia_hz,
        frequencia_before_hz: baseline.frequencyHz,
        chakra_alvo: pleito.chakra_alvo ?? baseline.chakra,
        baseline_image_url: baseline.image,
      }).select("id").single();
      if (error) { toast.error(error.message); return; }
      setSavedId(inserted.id);
      // Confirma no banco antes de liberar o After
      const { data: verify, error: verifyErr } = await supabase
        .from("sessions")
        .select("id, aura_before, baseline_image_url")
        .eq("id", inserted.id)
        .maybeSingle();
      if (verifyErr || !verify || verify.aura_before == null) {
        toast.error("Entrada salva, mas não foi possível confirmar no banco. Tente novamente.");
        setBaselineConfirmed(false);
        return;
      }
      setBaselineConfirmed(true);
      toast.success("Entrada salva e confirmada");
    } finally {
      setSavingStage(null);
    }
  };

  const finalize = async () => {
    if (!baseline || !after || !pleitoId) return;
    const pleito = pleitos.find(p => p.id === pleitoId)!;
    const deltaM = baseline.aura > 0 ? ((after.aura - baseline.aura) / baseline.aura) * 100 : 0;
    setSavingStage("after");
    try {
      const sumData = await summarize({ data: {
        pleitoNome: pleito.nome,
        frequenciaHz: Number(pleito.frequencia_hz) || 0,
        chakra: pleito.chakra_alvo ?? after.chakra,
        auraBefore: baseline.aura, auraAfter: after.aura,
        stressBefore: baseline.bpm, stressAfter: after.bpm,
        deltaM,
      }});
      setSummary(sumData.summary);

      if (savedId) {
        const { error } = await supabase.from("sessions").update({
          aura_after: after.aura,
          stress_after: after.bpm,
          delta_m: deltaM,
          observacoes: sumData.summary,
          after_image_url: after.image,
          frequencia_after_hz: after.frequencyHz,
        }).eq("id", savedId);
        if (error) { toast.error(error.message); return; }
        toast.success("Saída salva");
      } else {
        const { data: inserted, error } = await supabase.from("sessions").insert({
          therapist_id: user!.id,
          paciente_id: patientId,
          pleito_id: pleitoId,
          aura_before: baseline.aura,
          aura_after: after.aura,
          stress_before: baseline.bpm,
          stress_after: after.bpm,
          delta_m: deltaM,
          frequencia_hz: pleito.frequencia_hz,
          frequencia_before_hz: baseline.frequencyHz,
          frequencia_after_hz: after.frequencyHz,
          chakra_alvo: pleito.chakra_alvo ?? after.chakra,
          observacoes: sumData.summary,
          baseline_image_url: baseline.image,
          after_image_url: after.image,
        }).select("id").single();
        if (error) { toast.error(error.message); return; }
        setSavedId(inserted.id);
        toast.success("Sessão registrada");
      }

      // Relay para Tor-ND (com fila offline em caso de falha)
      void relaySession({
        terapeuta_id: user!.id,
        terapeuta_nome: (user!.user_metadata?.display_name as string | undefined) ?? user!.email ?? null,
        paciente: patient!.name,
        data: new Date().toISOString(),
        frequencia_inicial: baseline.frequencyHz ?? null,
        frequencia_final: after.frequencyHz ?? null,
        aura_inicial: baseline.aura,
        aura_final: after.aura,
        bpm_inicial: baseline.bpm,
        bpm_final: after.bpm,
        delta_m: Number(deltaM.toFixed(2)),
        cor_aura_antes: baseline.auraColor ?? null,
        cor_aura_depois: after.auraColor ?? null,
        modalidade: "presencial",
        patologia: patient!.clinical_indication ?? null,
        frequencias_aplicadas: [Number(pleito.frequencia_hz) || 0].filter(Boolean),
      });
    } finally {
      setSavingStage(null);
    }
  };

  if (!patient) return null;

  const downloadBaselineReport = () => {
    if (!baseline) return;
    const sel = pleitos.find(p => p.id === pleitoId);
    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/><title>Relatório Baseline — ${patient.name}</title>
      <style>*{box-sizing:border-box}body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#222;padding:32px;max-width:720px;margin:auto}
      h1{margin:0 0 4px;font-size:22px}.sub{color:#666;font-size:12px;margin-bottom:24px}
      .row{display:grid;grid-template-columns:180px 1fr;gap:8px;padding:10px 0;border-bottom:1px solid #eee}
      .label{color:#666;font-size:12px;text-transform:uppercase;letter-spacing:.04em}.val{font-size:14px}
      img{max-width:280px;border-radius:8px;margin-top:8px}.foot{margin-top:32px;font-size:11px;color:#888;text-align:center}</style></head><body>
      <h1>Relatório Baseline (Entrada)</h1>
      <div class="sub">Mentor ND · Paciente: ${patient.name} · ${new Date().toLocaleString("pt-BR")}</div>
      <div class="row"><div class="label">Telefone</div><div class="val">${patient.phone || "—"}</div></div>
      <div class="row"><div class="label">Idade</div><div class="val">${patient.age ?? "—"}</div></div>
      <div class="row"><div class="label">Gênero</div><div class="val">${patient.gender || "—"}</div></div>
      <div class="row"><div class="label">Queixas inseridas no cadastro do paciente</div><div class="val" style="white-space:pre-wrap">${(patient.clinical_indication || "—").replace(/[<>&]/g,(c)=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[c]!))}</div></div>
      <div class="row"><div class="label">Medicamentos que Usa</div><div class="val" style="white-space:pre-wrap">${(patient.notes || "—").replace(/[<>&]/g,(c)=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[c]!))}</div></div>
      <div class="row"><div class="label">Score de Aura</div><div class="val">${baseline.aura}/100</div></div>
      <div class="row"><div class="label">Chakra detectado</div><div class="val">${baseline.chakra}</div></div>
      <div class="row"><div class="label">BPM (estresse)</div><div class="val">${baseline.bpm}</div></div>
      <div class="row"><div class="label">Pleito sugerido</div><div class="val">${sel ? `#${sel.numero} ${sel.nome}` : "—"}</div></div>
      <div class="row"><div class="label">Frequência</div><div class="val">${sel?.frequencia_hz ? `${sel.frequencia_hz} Hz` : "—"}</div></div>
      <div class="row"><div class="label">Chakra alvo</div><div class="val">${sel?.chakra_alvo ?? "—"}</div></div>
      <div class="row"><div class="label">Notas IA</div><div class="val" style="white-space:pre-wrap">${(baseline.notes || "—").replace(/[<>&]/g,(c)=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[c]!))}</div></div>
      <div class="row"><div class="label">Imagem</div><div class="val"><img src="${baseline.image}" alt=""/></div></div>
      <div class="row"><div class="label">Orientações</div><div class="val"><ol style="margin:0;padding-left:18px"><li>Respirar 10 vezes pelo nariz e expirar pela boca.</li><li>Relaxar durante 15 minutos ouvindo a frequência indicada.</li><li>Enviar nova foto após o tratamento.</li></ol></div></div>
      <div style="margin-top:24px;padding:16px;border:1px solid #ddd;border-radius:8px;background:#fafafa">
        <h2 style="font-size:14px;margin:0 0 8px;text-transform:uppercase;letter-spacing:.05em">Termo de Ciência e Integração Clínica</h2>
        <p style="font-size:12px;line-height:1.55;margin:0 0 8px;text-align:justify">O Mentor ND é uma plataforma tecnológica de suporte vibracional e biofeedback, desenvolvida para auxiliar na harmonização energética e na expansão da consciência. É imperativo ressaltar que o uso desta ferramenta <strong>COMPLEMENTA</strong>, mas de forma alguma <strong>SUBSTITUI</strong>, o atendimento médico convencional, as consultas presenciais, os exames diagnósticos ou os tratamentos farmacológicos e terapêuticos prescritos por profissionais de saúde devidamente habilitados.</p>
        <p style="font-size:12px;line-height:1.55;margin:0;text-align:justify">O usuário deve manter rigorosamente seu acompanhamento médico regular e seguir todas as orientações clínicas recebidas de seus assistentes de saúde. O Mentor ND atua como um transceptor auxiliar de integridade noosférica, visando a otimização do bem-estar subjetivo e a coerência biológica, não devendo ser utilizado como base única para decisões de saúde de natureza crítica ou emergencial. A utilização ética e profissional desta tecnologia pressupõe a integração harmônica entre os avanços da medicina integrativa e os protocolos da medicina alopática tradicional.</p>
      </div>
      <div class="foot">Documento confidencial — uso exclusivo do consultório</div>
      </body></html>`;
    const printHtml = html.replace("</body>", `<script>window.onload=()=>{setTimeout(()=>{window.print();},400);};window.onafterprint=()=>window.close();<\/script></body>`);
    const w = window.open("", "_blank");
    if (!w) {
      toast.error("Permita pop-ups para gerar o PDF");
      return;
    }
    w.document.open();
    w.document.write(printHtml);
    w.document.close();
    toast.success("Use 'Salvar como PDF' na janela de impressão");
  };

  const getBaselineWhatsapp = () => {
    if (!baseline) return null;
    const sel = pleitos.find(p => p.id === pleitoId);
    const num = normalizeWhatsAppPhone(patient.phone);
    const text = `*Relatório Baseline — Mentor ND*\n` +
      `Paciente: ${patient.name}\n` +
      `Data: ${new Date().toLocaleString("pt-BR")}\n\n` +
      `• Telefone: ${patient.phone ?? "—"}\n` +
      `• Idade: ${patient.age ?? "—"}\n` +
      `• Gênero: ${patient.gender ?? "—"}\n` +
      `• Queixas inseridas no cadastro do paciente: ${patient.clinical_indication ?? "—"}\n` +
      `• Medicamentos que Usa: ${patient.notes ?? "—"}\n\n` +
      `• Aura: ${baseline.aura}/100\n` +
      `• Chakra detectado: ${baseline.chakra}\n` +
      `• BPM: ${baseline.bpm}\n` +
      `• Pleito sugerido: ${sel ? `#${sel.numero} ${sel.nome}` : "—"}\n` +
      `• Frequência: ${sel?.frequencia_hz ? `${sel.frequencia_hz} Hz` : "—"}\n` +
      (baseline.notes ? `\nNotas IA: ${baseline.notes}\n` : "\n") +
      `\n*Orientações:*\n` +
      `1. Respirar 10 vezes pelo nariz e expirar pela boca.\n` +
      `2. Relaxar durante 15 minutos ouvindo a frequência indicada.\n` +
      `3. Enviar nova foto após o tratamento.\n\n` +
      `*TERMO DE CIÊNCIA E INTEGRAÇÃO CLÍNICA*\n\n` +
      `O Mentor ND é uma plataforma tecnológica de suporte vibracional e biofeedback, desenvolvida para auxiliar na harmonização energética e na expansão da consciência. É imperativo ressaltar que o uso desta ferramenta COMPLEMENTA, mas de forma alguma SUBSTITUI, o atendimento médico convencional, as consultas presenciais, os exames diagnósticos ou os tratamentos farmacológicos e terapêuticos prescritos por profissionais de saúde devidamente habilitados.\n\n` +
      `O usuário deve manter rigorosamente seu acompanhamento médico regular e seguir todas as orientações clínicas recebidas de seus assistentes de saúde. O Mentor ND atua como um transceptor auxiliar de integridade noosférica, visando a otimização do bem-estar subjetivo e a coerência biológica, não devendo ser utilizado como base única para decisões de saúde de natureza crítica ou emergencial. A utilização ética e profissional desta tecnologia pressupõe a integração harmônica entre os avanços da medicina integrativa e os protocolos da medicina alopática tradicional.`;
    const { url } = buildWhatsAppUrl(num, text);
    return { num, text, url };
  };

  const sendBaselineWhatsapp = () => {
    const payload = getBaselineWhatsapp();
    if (!payload) return;
    const { num, text, url } = payload;
    if (!num) return toast.error("Paciente sem telefone cadastrado");

    // Validação de número (E.164 sem +, 10-15 dígitos)
    if (!isValidWhatsAppPhone(num)) {
      toast.error(`Número inválido: "${num}"`);
      console.error("WhatsApp num inválido:", num);
      return;
    }

    // Log/debug
    console.log("[WhatsApp] num:", num, "len text:", text.length, "len url:", url.length);
    console.log("[WhatsApp] URL:", url);
    const opened = openWhatsAppUrl(url);
    copyTextToClipboard(text);
    toast.message(opened ? "WhatsApp aberto em nova aba" : "WhatsApp bloqueado — mensagem copiada", {
      description: `${num} · ${url.length} chars · ${url}`,
      duration: 15000,
      action: {
        label: "Copiar link",
        onClick: () => copyTextToClipboard(url),
      },
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-5xl">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Sessão clínica</p>
          <h1 className="text-3xl font-semibold tracking-tight">{patient.name}</h1>
        </div>
        {patient.clinical_indication && (
          <a
            href={`/noospheric?q=${encodeURIComponent(patient.clinical_indication)}`}
            className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs hover:bg-primary/10"
          >
            <Sparkles className="h-3 w-3" /> Sugerir frequências (Protocolo Noosférico) para "{patient.clinical_indication.slice(0, 40)}{patient.clinical_indication.length > 40 ? "…" : ""}"
          </a>
        )}
      </header>

      <div className="grid md:grid-cols-4 gap-3">
        <StepBadge active={!baseline} done={!!baseline} label="1. Capturar baseline" />
        <StepBadge active={!!baseline && !baselineConfirmed} done={baselineConfirmed} label="2. Salvar entrada" />
        <StepBadge active={baselineConfirmed && !after} done={!!after} label="3. Capturar saída" />
        <StepBadge active={!!after && !summary} done={!!summary} label="4. Finalizar sessão" />
      </div>
      <div className="rounded-lg border bg-muted/40 p-3 text-sm">
        {!baseline && <p>👉 Capture a <strong>foto de entrada</strong> (baseline) para começar.</p>}
        {baseline && !baselineConfirmed && <p>✅ Baseline pronto. Selecione um pleito e clique em <strong>Salvar entrada</strong> para liberar a foto de saída.</p>}
        {baselineConfirmed && !after && <p>✅ Entrada confirmada no banco. Agora capture a <strong>foto de saída</strong> (after).</p>}
        {after && !summary && <p>✅ Saída capturada. Clique em <strong>Salvar saída e gerar prontuário</strong> para concluir.</p>}
        {summary && <p>🎉 Sessão concluída e registrada no histórico.</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <CaptureCard
          title="Baseline (Entrada)"
          description="Capture uma foto do paciente antes da aplicação."
          stage="before"
          state={baseline}
          loading={loadingStage === "before"}
          inputId={baseInputId}
          onFile={(file) => captureStage("before", file)}
          onImage={(imageBase64) => analyzeCapture("before", imageBase64)}
        />

        <CaptureCard
          title="After (Saída)"
          description="Capture ou envie a foto de saída do paciente."
          stage="after"
          state={after}
          loading={loadingStage === "after"}
          inputId={afterInputId}
          onFile={(file) => captureStage("after", file)}
          onImage={(imageBase64) => analyzeCapture("after", imageBase64)}
        />
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Pleito a aplicar</CardTitle>
          <CardDescription>Selecione um dos 43 pleitos catalogados.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Pleito</Label>
            <Select value={pleitoId} onValueChange={setPleitoId}>
              <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
              <SelectContent className="max-h-72">
                {pleitos.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    #{p.numero} {p.nome} · {p.frequencia_hz}Hz · {p.chakra_alvo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {baseline && (() => {
        const sel = pleitos.find(p => p.id === pleitoId);
        const whatsapp = getBaselineWhatsapp();
        const canOpenWhatsapp = !!whatsapp?.num && isValidWhatsAppPhone(whatsapp.num);
        return (
          <Card className="shadow-glow border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Análise & Recomendação</CardTitle>
              <CardDescription>Baseado na leitura áurica da entrada.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(patient.clinical_indication || patient.notes) && (
                <div className="p-3 rounded-xl border bg-muted/40 text-sm space-y-1">
                  <p><span className="font-medium">Queixas inseridas no cadastro do paciente:</span> {patient.clinical_indication || "—"}</p>
                  <p><span className="font-medium">Medicamentos que usa:</span> {patient.notes || "—"}</p>
                </div>
              )}
              <div className="grid sm:grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-soft-gradient">
                  <p className="text-xs text-muted-foreground">Aura inicial</p>
                  <p className="text-xl font-semibold">{baseline.aura}/100</p>
                </div>
                <div className="p-3 rounded-xl bg-soft-gradient">
                  <p className="text-xs text-muted-foreground">Chakra detectado</p>
                  <p className="text-xl font-semibold">{baseline.chakra}</p>
                </div>
                <div className="p-3 rounded-xl bg-aura-gradient text-primary-foreground">
                  <p className="text-xs opacity-80">Frequência sugerida</p>
                  <p className="text-xl font-semibold">{sel ? `${sel.frequencia_hz} Hz` : "—"}</p>
                  {(() => {
                    const m = getFrequencyMeaning(sel?.frequencia_hz ?? null);
                    return m ? <p className="text-[11px] opacity-90 mt-1 leading-tight">{m.nome}</p> : null;
                  })()}
                </div>
              </div>
              {sel ? (
                <div className="p-3 rounded-xl border bg-card space-y-1">
                  <p className="text-xs text-muted-foreground">Pleito recomendado</p>
                  <p className="text-base font-medium">#{sel.numero} · {sel.nome}</p>
                  <p className="text-xs text-muted-foreground">Chakra alvo: {sel.chakra_alvo} · {sel.frequencia_hz} Hz</p>
                  {(() => {
                    const m = getFrequencyMeaning(sel.frequencia_hz);
                    return m ? (
                      <p className="text-xs mt-1"><strong>{m.nome}</strong> — {m.significado}</p>
                    ) : null;
                  })()}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Selecione manualmente um pleito abaixo.</p>
              )}
              {sel?.frequencia_hz ? (
                <>
                  <FrequencyPlayer hz={Number(sel.frequencia_hz)} label={`Pleito #${sel.numero} — ${sel.chakra_alvo}`} />
                  {(() => {
                    const m = getFrequencyMeaning(Number(sel.frequencia_hz));
                    return m ? (
                      <div className="rounded-md border bg-muted/40 p-3 text-xs space-y-1">
                        <p className="font-semibold text-sm">Significado · {m.hz} Hz — {m.nome}</p>
                        <p className="text-muted-foreground">Chakra: {m.chakra}</p>
                        <p>{m.significado}</p>
                      </div>
                    ) : null;
                  })()}
                </>
              ) : null}
              {baseline.notes && <p className="text-xs italic text-muted-foreground">{baseline.notes}</p>}
              {!savedId && (
                <Button
                  className="w-full"
                  variant="secondary"
                  disabled={!pleitoId || savingStage === "baseline"}
                  onClick={saveBaseline}
                >
                  {savingStage === "baseline" ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando…</> : "Salvar entrada"}
                </Button>
              )}
              {savedId && !after && (
                <p className="text-xs text-secondary flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Entrada salva</p>
              )}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={downloadBaselineReport}>
                  <Download className="h-4 w-4 mr-2" /> Baixar baseline
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-emerald-600 hover:text-emerald-700"
                  onClick={sendBaselineWhatsapp}
                >
                  <MessageCircle className="h-4 w-4 mr-2" /> Enviar por WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {after && (
        <Card className="shadow-glow border-secondary/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-secondary" /> Análise pós-tratamento</CardTitle>
            <CardDescription>Leitura áurica e vibracional da foto de saída.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid sm:grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-soft-gradient">
                <p className="text-xs text-muted-foreground">Aura final</p>
                <p className="text-xl font-semibold">{after.aura}/100</p>
              </div>
              <div className="p-3 rounded-xl bg-soft-gradient">
                <p className="text-xs text-muted-foreground">Chakra detectado</p>
                <p className="text-xl font-semibold">{after.chakra}</p>
              </div>
              <div className="p-3 rounded-xl bg-aura-gradient text-primary-foreground">
                <p className="text-xs opacity-80">Frequência lida</p>
                <p className="text-xl font-semibold">{after.frequencyHz} Hz</p>
                {(() => {
                  const m = getFrequencyMeaning(after.frequencyHz);
                  return m ? <p className="text-[11px] opacity-90 mt-1 leading-tight">{m.nome}</p> : null;
                })()}
              </div>
            </div>
            <div className="p-3 rounded-xl border bg-card flex items-center gap-3">
              <span className="inline-block h-10 w-10 rounded-full border-2 shadow-inner" style={{ backgroundColor: after.auraColorHex }} aria-label={after.auraColor} />
              <div>
                <p className="text-xs text-muted-foreground">Cor predominante da aura após tratamento</p>
                <p className="text-base font-semibold">{after.auraColor} <span className="text-xs text-muted-foreground font-normal">({after.auraColorHex})</span></p>
              </div>
            </div>
            {(() => {
              const m = getFrequencyMeaning(after.frequencyHz);
              return m ? (
                <div className="rounded-md border bg-muted/40 p-3 text-xs space-y-1">
                  <p className="font-semibold text-sm">Significado vibracional · {m.hz} Hz — {m.nome}</p>
                  <p className="text-muted-foreground">Chakra: {m.chakra}</p>
                  <p>{m.significado}</p>
                </div>
              ) : null;
            })()}
            {after.notes && <p className="text-xs italic text-muted-foreground">{after.notes}</p>}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              disabled={loadingStage === "after" || !after.image}
              onClick={() => after.image && void analyzeCapture("after", after.image)}
            >
              {loadingStage === "after" ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Reanalisando…</> : <><Sparkles className="h-4 w-4 mr-2" />Reanalisar aura e frequência da saída</>}
            </Button>
          </CardContent>
        </Card>
      )}

      {baseline && after && (
        <Card className="shadow-glow border-primary/30">
          <CardHeader>
            <CardTitle>Resultado da sessão</CardTitle>
            <CardDescription>Delta de Melhora calculado automaticamente.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              const dm = baseline.aura > 0 ? ((after.aura - baseline.aura) / baseline.aura) * 100 : 0;
              return (
                <>
                  <div className="grid sm:grid-cols-4 gap-4 text-center">
                    <div className="p-4 rounded-xl bg-soft-gradient">
                      <p className="text-xs text-muted-foreground">Aura</p>
                      <p className="text-2xl font-semibold">{baseline.aura} → {after.aura}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-soft-gradient">
                      <p className="text-xs text-muted-foreground">Frequência lida (Hz)</p>
                      <p className="text-2xl font-semibold">{baseline.frequencyHz} → {after.frequencyHz}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-soft-gradient">
                      <p className="text-xs text-muted-foreground">BPM (estresse)</p>
                      <p className="text-2xl font-semibold">{baseline.bpm} → {after.bpm}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-aura-gradient text-primary-foreground">
                      <p className="text-xs opacity-80">ΔM</p>
                      <p className="text-2xl font-semibold">{dm.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border p-3 flex items-center gap-3">
                      <span className="inline-block h-10 w-10 rounded-full border-2 shadow-inner" style={{ backgroundColor: baseline.auraColorHex }} aria-label={baseline.auraColor} />
                      <div>
                        <p className="text-xs text-muted-foreground">Cor da aura · Antes</p>
                        <p className="text-sm font-semibold">{baseline.auraColor} <span className="text-xs text-muted-foreground font-normal">({baseline.auraColorHex})</span></p>
                      </div>
                    </div>
                    <div className="rounded-xl border p-3 flex items-center gap-3 bg-soft-gradient">
                      <span className="inline-block h-10 w-10 rounded-full border-2 shadow-inner" style={{ backgroundColor: after.auraColorHex }} aria-label={after.auraColor} />
                      <div>
                        <p className="text-xs text-muted-foreground">Cor da aura · Depois</p>
                        <p className="text-sm font-semibold">{after.auraColor} <span className="text-xs text-muted-foreground font-normal">({after.auraColorHex})</span></p>
                      </div>
                    </div>
                  </div>
                  {(() => {
                    const mb = getFrequencyMeaning(baseline.frequencyHz);
                    const ma = getFrequencyMeaning(after.frequencyHz);
                    if (!mb && !ma) return null;
                    return (
                      <div className="grid sm:grid-cols-2 gap-3">
                        {mb && (
                          <div className="rounded-lg border p-3 text-xs space-y-1">
                            <p className="font-semibold text-sm">Antes · {mb.hz} Hz — {mb.nome}</p>
                            <p className="text-muted-foreground">Chakra: {mb.chakra}</p>
                            <p>{mb.significado}</p>
                          </div>
                        )}
                        {ma && (
                          <div className="rounded-lg border p-3 text-xs space-y-1 bg-soft-gradient">
                            <p className="font-semibold text-sm">Depois · {ma.hz} Hz — {ma.nome}</p>
                            <p className="text-muted-foreground">Chakra: {ma.chakra}</p>
                            <p>{ma.significado}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  {(() => {
                    const delta = after.frequencyHz - baseline.frequencyHz;
                    const pct = baseline.frequencyHz > 0 ? (delta / baseline.frequencyHz) * 100 : 0;
                    const direcao = delta > 0 ? "elevação vibracional" : delta < 0 ? "redução vibracional" : "estabilidade vibracional";
                    const interpretacao = delta > 0
                      ? "A frequência da foto de saída aumentou, indicando expansão do campo áurico, maior abertura energética e melhor sintonia com o pleito aplicado."
                      : delta < 0
                      ? "A frequência da foto de saída diminuiu, sugerindo descarga / aterramento energético — comum quando há liberação de cargas densas após a sessão."
                      : "A frequência permaneceu estável, indicando manutenção do estado vibracional já harmonizado.";
                    return (
                      <div className="rounded-xl border-2 border-primary/30 p-4 space-y-2 bg-card">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <p className="font-semibold text-sm flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Nova análise de frequência (foto de saída)
                          </p>
                          <Badge variant={delta >= 0 ? "default" : "secondary"}>
                            {delta > 0 ? "+" : ""}{delta.toFixed(0)} Hz ({pct > 0 ? "+" : ""}{pct.toFixed(1)}%)
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Variação detectada: <strong className="text-foreground">{direcao}</strong>.</p>
                        <p className="text-sm leading-relaxed">{interpretacao}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={loadingStage === "after" || !after.image}
                          onClick={() => after.image && void analyzeCapture("after", after.image)}
                        >
                          {loadingStage === "after" ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Reanalisando…</> : <><Sparkles className="h-4 w-4 mr-2" />Reanalisar frequência da saída</>}
                        </Button>
                      </div>
                    );
                  })()}
                  {!summary ? (
                    <Button className="w-full bg-aura-gradient" disabled={!pleitoId || savingStage === "after"} onClick={finalize}>
                      {savingStage === "after" ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando…</> : "Salvar saída e gerar prontuário"}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-card border">
                        <p className="text-xs text-muted-foreground mb-1">Observações técnicas (IA)</p>
                        <p className="text-sm whitespace-pre-line">{summary}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => nav({ to: "/patient/$patientId", params: { patientId } })}>Ver histórico do paciente</Button>
                        <Button className="flex-1 bg-aura-gradient" onClick={() => nav({ to: "/dashboard" })}>Concluir</Button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StepBadge({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className={`p-3 rounded-xl border ${active ? "border-primary bg-accent" : "border-border bg-card"}`}>
      <div className="flex items-center gap-2 text-sm font-medium">
        {done ? <CheckCircle2 className="h-4 w-4 text-secondary" /> : <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />}
        {label}
      </div>
    </div>
  );
}

function CaptureCard({ title, description, state, loading, inputId, onFile, onImage, disabled }: {
  title: string; description: string; stage: "before" | "after";
  state: { aura: number; chakra: string; bpm: number; notes: string; image: string; frequencyHz: number; auraColor: string; auraColorHex: string } | null;
  loading: boolean; inputId: string; onFile: (file: File) => void | Promise<void>; onImage: (imageBase64: string) => void | Promise<void>; disabled?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [guideOpen, setGuideOpen] = useState(false);
  const isUnavailable = Boolean(disabled || loading);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      void videoRef.current.play().catch(() => undefined);
    }
  }, [cameraOpen]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOpen(false);
  };

  const requestOpenCamera = () => {
    if (isUnavailable) return;
    setCameraError("");
    setGuideOpen(true);
  };

  const openCamera = async () => {
    if (isUnavailable) return;
    setGuideOpen(false);
    try {
      const streamRequest = navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      setCameraError("");
      const stream = await streamRequest;
      streamRef.current = stream;
      setCameraOpen(true);
    } catch (error) {
      console.error(error);
      setCameraError("Permita o acesso à câmera ou use Enviar imagem.");
      toast.error("Não foi possível abrir a câmera");
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      toast.error("Câmera ainda não está pronta");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageBase64 = canvas.toDataURL("image/jpeg", 0.9);
    stopCamera();
    void onImage(imageBase64);
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={isUnavailable}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = "";
          }}
        />
        {state ? (
          <>
            <img src={state.image} alt="" className="rounded-lg w-full h-44 object-cover" />
            <div className="flex items-center justify-between text-sm">
              <span>Score de Aura</span><Badge variant="secondary">{state.aura}/100</Badge>
            </div>
            <Progress value={state.aura} />
            <div className="flex items-center justify-between text-sm">
              <span>Chakra alvo</span><Badge>{state.chakra}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Cor da aura</span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-5 w-5 rounded-full border" style={{ backgroundColor: state.auraColorHex }} aria-label={state.auraColor} />
                <Badge variant="outline">{state.auraColor}</Badge>
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" /> Frequência lida</span>
              <Badge variant="outline">{state.frequencyHz} Hz</Badge>
            </div>
            {(() => {
              const m = getFrequencyMeaning(state.frequencyHz);
              return m ? (
                <div className="rounded-md border bg-muted/40 p-2 text-xs space-y-0.5">
                  <p className="font-medium">{m.hz} Hz · {m.nome}</p>
                  <p className="text-muted-foreground">Chakra: {m.chakra}</p>
                  <p className="text-muted-foreground">{m.significado}</p>
                </div>
              ) : null;
            })()}
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> PPG (BPM)</span>
              <Badge variant="outline">{state.bpm}</Badge>
            </div>
            {state.notes && <p className="text-xs text-muted-foreground italic">{state.notes}</p>}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={requestOpenCamera} disabled={isUnavailable}>Recapturar</Button>
              <Button variant="outline" size="sm" asChild aria-disabled={isUnavailable}>
                <label htmlFor={inputId} className={isUnavailable ? "pointer-events-none" : "cursor-pointer"}>Enviar imagem</label>
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <Button className="w-full bg-aura-gradient" disabled={isUnavailable} onClick={requestOpenCamera}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analisando…</> : <><Camera className="h-4 w-4 mr-2" /> Abrir câmera</>}
            </Button>
            <Button variant="outline" className="w-full" asChild aria-disabled={isUnavailable}>
              <label htmlFor={inputId} className={isUnavailable ? "pointer-events-none" : "cursor-pointer"}>Enviar imagem</label>
            </Button>
          </div>
        )}
        {cameraOpen && (
          <div className="space-y-2 rounded-lg border bg-card p-2">
            <video ref={videoRef} className="h-56 w-full rounded-md object-cover bg-muted" autoPlay muted playsInline />
            <div className="grid grid-cols-2 gap-2">
              <Button className="bg-aura-gradient" onClick={takePhoto}>Tirar foto</Button>
              <Button variant="outline" onClick={stopCamera}>Cancelar</Button>
            </div>
          </div>
        )}
        {cameraError && <p className="text-xs text-destructive">{cameraError}</p>}
        <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>🧘 Como tirar sua foto para Análise Bio-energética</DialogTitle>
              <DialogDescription>
                Para uma leitura precisa da sua densidade áurica e chakra alvo, siga estas orientações.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <section>
                <p className="font-semibold">✅ Posição</p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-0.5">
                  <li>Fique em pé ou sentado, de frente para a câmera</li>
                  <li>Corpo inteiro visível (dos pés à cabeça)</li>
                  <li>Braços relaxados ao lado do corpo</li>
                  <li>Pés levemente afastados, firmes no chão</li>
                </ul>
              </section>
              <section>
                <p className="font-semibold">💡 Iluminação</p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-0.5">
                  <li>Prefira luz natural difusa (perto de uma janela)</li>
                  <li>Evite luz direta no rosto (flash desligado)</li>
                  <li>Fundo claro e neutro (parede branca, bege ou azul claro)</li>
                </ul>
              </section>
              <section>
                <p className="font-semibold">👕 Vestimenta</p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-0.5">
                  <li>Roupas claras e confortáveis (branco, off-white, azul claro, lilás)</li>
                  <li>Evite preto, estampas grandes, acessórios metálicos volumosos</li>
                  <li>Preferencialmente sem óculos escuros</li>
                </ul>
              </section>
              <section>
                <p className="font-semibold">📸 Enquadramento</p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-0.5">
                  <li>Câmera na altura do peito, levemente inclinada para baixo</li>
                  <li>Distância de 1,5 a 2 metros</li>
                  <li>Foto horizontal (paisagem)</li>
                </ul>
              </section>
              <section>
                <p className="font-semibold">🌿 Estado ideal</p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-0.5">
                  <li>Respire fundo 3 vezes antes de fotografar</li>
                  <li>Esteja em silêncio, com intenção de conexão</li>
                  <li>Sorria leve — nem tenso, nem exagerado</li>
                </ul>
              </section>
              <section>
                <p className="font-semibold">❌ Evite</p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-0.5">
                  <li>Fundo escuro ou bagunçado — interfere na leitura bioenergética</li>
                  <li>Contra-luz (janela atrás) — distorce a densidade áurica</li>
                  <li>Foto noturna ou com flash — prejudica a captação dos campos sutis</li>
                  <li>Roupa preta ou vermelha intensa — altera a leitura dos chakras</li>
                  <li>Apressar a captura — a leitura precisa de energia estável</li>
                </ul>
              </section>
              <p className="italic text-center text-muted-foreground border-t pt-3">
                "Sua imagem é seu campo vibracional impresso em luz. Deixe que ele fale."
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setGuideOpen(false)}>Cancelar</Button>
              <Button className="bg-aura-gradient" onClick={openCamera}>
                <Camera className="h-4 w-4 mr-2" /> Estou pronto(a), abrir câmera
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
