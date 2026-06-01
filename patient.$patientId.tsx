import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppLayout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { multidimensionalRecommendation } from "@/server/ai.functions";
import { getFrequencyMeaning } from "@/lib/frequencyMeaning";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, Sparkles, Loader2, ExternalLink } from "lucide-react";
import { FrequencyPlayer } from "@/components/FrequencyPlayer";
import { SessionPlaylist } from "@/components/SessionPlaylist";
import { toast } from "sonner";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, BarChart, Bar } from "recharts";

export const Route = createFileRoute("/patient/$patientId")({
  component: () => <AuthGate><AppLayout><PatientHistory /></AppLayout></AuthGate>,
});

type Row = {
  id: string; created_at: string;
  aura_before: number | null; aura_after: number | null;
  stress_before: number | null; stress_after: number | null;
  delta_m: number | null; frequencia_hz: number | null;
  frequencia_before_hz: number | null; frequencia_after_hz: number | null;
  chakra_alvo: string | null; observacoes: string | null;
  baseline_image_url: string | null; after_image_url: string | null;
  pleitos: { numero: number; nome: string } | null;
};

function PatientHistory() {
  const { patientId } = Route.useParams();
  const recommend = useServerFn(multidimensionalRecommendation);
  const [name, setName] = useState("");
  const [clinicalIndication, setClinicalIndication] = useState<string | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [recommendation, setRecommendation] = useState<string>("");
  const [loadingRec, setLoadingRec] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: ss }] = await Promise.all([
        supabase.from("patients").select("name,clinical_indication,notes").eq("id", patientId).maybeSingle(),
        supabase.from("sessions").select("*, pleitos(numero,nome)").eq("paciente_id", patientId).order("created_at", { ascending: true }),
      ]);
      setName(p?.name ?? "");
      setClinicalIndication(p?.clinical_indication ?? null);
      setNotes(p?.notes ?? null);
      setRows((ss ?? []) as unknown as Row[]);
    })();
  }, [patientId]);

  const generateRecommendation = async () => {
    if (rows.length === 0) { toast.error("Sem sessões para análise"); return; }
    setLoadingRec(true);
    try {
      const result = await recommend({ data: {
        patientName: name,
        clinicalIndication,
        notes,
        sessions: rows.map(r => ({
          date: r.created_at,
          pleito: r.pleitos ? `#${r.pleitos.numero} ${r.pleitos.nome}` : null,
          frequenciaHz: r.frequencia_hz != null ? Number(r.frequencia_hz) : null,
          chakra: r.chakra_alvo,
          auraBefore: r.aura_before, auraAfter: r.aura_after,
          stressBefore: r.stress_before, stressAfter: r.stress_after,
          deltaM: r.delta_m != null ? Number(r.delta_m) : null,
        })),
      }});
      setRecommendation(result.recommendation);
      toast.success("Indicação gerada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao gerar indicação");
    } finally {
      setLoadingRec(false);
    }
  };

  const chart = rows.map((r, i) => ({
    n: `S${i + 1}`,
    aura: r.aura_after ?? 0,
    estresse: r.stress_after ?? 0,
  }));

  const printHistory = async () => {
    const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!));

    let recText = recommendation;
    if (!recText && rows.length > 0) {
      const t = toast.loading("Gerando indicação multidimensional para o relatório…");
      try {
        const result = await recommend({ data: {
          patientName: name,
          clinicalIndication,
          notes,
          sessions: rows.map(r => ({
            date: r.created_at,
            pleito: r.pleitos ? `#${r.pleitos.numero} ${r.pleitos.nome}` : null,
            frequenciaHz: r.frequencia_hz != null ? Number(r.frequencia_hz) : null,
            chakra: r.chakra_alvo,
            auraBefore: r.aura_before, auraAfter: r.aura_after,
            stressBefore: r.stress_before, stressAfter: r.stress_after,
            deltaM: r.delta_m != null ? Number(r.delta_m) : null,
          })),
        }});
        recText = result.recommendation;
        setRecommendation(recText);
      } catch (e) {
        console.error(e);
      } finally {
        toast.dismiss(t);
      }
    }

    const sessionRows = rows.map((r, i) => {
      const dm = Number(r.delta_m ?? 0).toFixed(1);
      const freqRead = (r.frequencia_before_hz != null || r.frequencia_after_hz != null)
        ? `${r.frequencia_before_hz ?? "—"} → ${r.frequencia_after_hz ?? "—"} Hz`
        : "—";
      const mP = getFrequencyMeaning(r.frequencia_hz);
      return `<tr>
        <td>${i + 1}</td>
        <td>${esc(new Date(r.created_at).toLocaleString("pt-BR"))}</td>
        <td>${r.pleitos ? `#${r.pleitos.numero} ${esc(r.pleitos.nome)}` : "—"}</td>
        <td>${r.frequencia_hz ?? "—"} Hz${mP ? `<br/><small>${esc(mP.nome)} — ${esc(mP.significado)}</small>` : ""}</td>
        <td>${freqRead}</td>
        <td>${esc(r.chakra_alvo ?? "—")}</td>
        <td>${r.aura_before ?? "—"} → ${r.aura_after ?? "—"}</td>
        <td>${r.stress_before ?? "—"} → ${r.stress_after ?? "—"}</td>
        <td>${dm}%</td>
        <td style="white-space:pre-wrap;max-width:280px">${esc(r.observacoes ?? "—")}</td>
      </tr>`;
    }).join("");

    const photoBlocks = rows
      .filter(r => r.baseline_image_url || r.after_image_url)
      .map((r, i) => `
        <div style="page-break-inside:avoid;margin-top:14px;padding:10px;border:1px solid #eee;border-radius:8px">
          <div style="font-size:12px;color:#444;margin-bottom:6px"><strong>Sessão ${rows.indexOf(r) + 1}</strong> · ${esc(new Date(r.created_at).toLocaleString("pt-BR"))} · ${r.pleitos ? `#${r.pleitos.numero} ${esc(r.pleitos.nome)}` : "—"}</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <div style="flex:1;min-width:220px">
              <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px">Antes</div>
              ${r.baseline_image_url ? `<img src="${r.baseline_image_url}" style="width:100%;max-width:300px;border-radius:6px"/>` : `<div style="font-size:11px;color:#aaa">Sem foto</div>`}
            </div>
            <div style="flex:1;min-width:220px">
              <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px">Depois</div>
              ${r.after_image_url ? `<img src="${r.after_image_url}" style="width:100%;max-width:300px;border-radius:6px"/>` : `<div style="font-size:11px;color:#aaa">Sem foto</div>`}
            </div>
          </div>
        </div>
      `).join("");
    const photoSection = photoBlocks ? `<h2 style="margin:24px 0 6px;font-size:16px">Registros Fotográficos (Antes / Depois)</h2>${photoBlocks}` : "";

    const recBlock = recText ? `
      <h2 style="margin:24px 0 6px;font-size:16px">Indicação de Cura Multidimensional</h2>
      <div style="font-size:12px;color:#666;margin-bottom:10px">Protocolo de frequências sugerido pela IA com base no histórico vibracional.</div>
      <div style="padding:14px;border:1px solid #ddd;border-radius:8px;background:#fafafa;white-space:pre-wrap;font-size:12px;line-height:1.55">${esc(recText)}</div>
    ` : "";

    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/><title>Histórico Clínico Vibracional — ${esc(name)}</title>
      <style>*{box-sizing:border-box}body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#222;padding:24px;margin:auto}
      h1{margin:0 0 4px;font-size:22px}.sub{color:#666;font-size:12px;margin-bottom:18px}
      table{width:100%;border-collapse:collapse;font-size:11px}
      th,td{border:1px solid #ddd;padding:6px 8px;text-align:left;vertical-align:top}
      th{background:#f3f3f7;text-transform:uppercase;font-size:10px;letter-spacing:.04em}
      tr:nth-child(even) td{background:#fafafa}
      .foot{margin-top:24px;font-size:11px;color:#888;text-align:center}
      .summary{margin:8px 0 18px;font-size:12px;color:#444}</style></head><body>
      <h1>Histórico Clínico Vibracional</h1>
      <div class="sub">Mentor ND · Paciente: ${esc(name)} · ${new Date().toLocaleString("pt-BR")}</div>
      <div class="summary">Total de sessões: <strong>${rows.length}</strong></div>
      ${rows.length === 0 ? "<p>Nenhuma sessão registrada.</p>" : `<table>
        <thead><tr><th>#</th><th>Data</th><th>Pleito</th><th>Freq. Pleito</th><th>Freq. Lida (Antes→Depois)</th><th>Chakra</th><th>Aura</th><th>BPM</th><th>ΔM</th><th>Observações IA</th></tr></thead>
        <tbody>${sessionRows}</tbody></table>`}
      ${photoSection}
      ${recBlock}
      <h2 style="margin:24px 0 6px;font-size:16px">Termo de Alta Integridade</h2>
      <div style="padding:14px;border:1px solid #ddd;border-radius:8px;background:#fafafa;font-size:12px;line-height:1.6;text-align:justify">
        Declaro que este relato é uma expressão fiel da minha experiência vibracional, autorizada para fins de estudo, documentação científica noosférica e expansão do bem maior através do Lar Maria de Nazaré. Compreendo que meus dados estão protegidos sob protocolos de soberania biológica.
        <div style="margin-top:28px;display:flex;justify-content:space-between;gap:24px">
          <div style="flex:1;border-top:1px solid #888;padding-top:4px;text-align:center;font-size:11px;color:#555">Assinatura do(a) Paciente</div>
          <div style="flex:1;border-top:1px solid #888;padding-top:4px;text-align:center;font-size:11px;color:#555">Data: ___/___/______</div>
        </div>
      </div>
      <div class="foot">Documento confidencial — uso exclusivo do consultório</div>
      </body></html>`;
    const printHtml = html.replace("</body>", `<script>window.onload=()=>{setTimeout(()=>{window.print();},400);};window.onafterprint=()=>window.close();<\/script></body>`);
    const w = window.open("", "_blank");
    if (!w) { toast.error("Permita pop-ups para gerar o PDF"); return; }
    w.document.open();
    w.document.write(printHtml);
    w.document.close();
    toast.success("Use 'Salvar como PDF' na janela de impressão");
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-5xl">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          {(() => {
            const firstPhoto =
              rows.find((r) => r.baseline_image_url)?.baseline_image_url ??
              rows.find((r) => r.after_image_url)?.after_image_url ??
              null;
            return firstPhoto ? (
              <img
                src={firstPhoto}
                alt={`Primeira foto registrada de ${name}`}
                className="w-20 h-20 rounded-full object-cover border shadow-soft"
              />
            ) : (
              <div className="w-20 h-20 rounded-full grid place-items-center bg-muted text-[10px] text-muted-foreground border">
                Sem foto
              </div>
            );
          })()}
          <div>
            <p className="text-sm text-muted-foreground">Histórico clínico vibracional</p>
            <h1 className="text-3xl font-semibold tracking-tight">{name}</h1>
            {rows[0]?.created_at && (
              <p className="text-xs text-muted-foreground mt-1">
                Primeiro registro: {new Date(rows[0].created_at).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>
        </div>
        <Button variant="outline" onClick={printHistory} disabled={rows.length === 0}>
          <Printer className="h-4 w-4 mr-2" /> Imprimir / PDF
        </Button>
      </header>

      {(() => {
        const firstBefore = rows.find(r => r.baseline_image_url)?.baseline_image_url ?? null;
        const lastAfter = [...rows].reverse().find(r => r.after_image_url)?.after_image_url ?? null;
        if (!firstBefore && !lastAfter) return null;
        return (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Comparativo Antes / Depois</CardTitle>
              <CardDescription>Primeiro registro vibracional e estado atual do paciente.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Antes</p>
                  {firstBefore
                    ? <img src={firstBefore} alt="Foto antes" className="w-full h-64 object-cover rounded-lg border" />
                    : <div className="h-64 grid place-items-center text-xs text-muted-foreground rounded-lg border bg-muted/30">Sem foto</div>}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Depois</p>
                  {lastAfter
                    ? <img src={lastAfter} alt="Foto depois" className="w-full h-64 object-cover rounded-lg border" />
                    : <div className="h-64 grid place-items-center text-xs text-muted-foreground rounded-lg border bg-muted/30">Sem foto</div>}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      <Card className="shadow-glow border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Indicação de Cura Multidimensional</CardTitle>
          <CardDescription>Protocolo de frequências sugerido pela IA com base no histórico vibracional do paciente.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={generateRecommendation} disabled={loadingRec || rows.length === 0} className="bg-aura-gradient">
            {loadingRec ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Gerando…</> : <><Sparkles className="h-4 w-4 mr-2" /> {recommendation ? "Gerar nova indicação" : "Gerar indicação multidimensional"}</>}
          </Button>
          {recommendation && (
            <div className="p-4 rounded-xl border bg-card whitespace-pre-line text-sm leading-relaxed">{recommendation}</div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Evolução do Score de Aura e Estresse</CardTitle>
          <CardDescription>Comparação entre o brilho áurico (Aura) e BPM (estresse) ao longo das sessões.</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          {chart.length === 0 ? (
            <div className="grid place-items-center h-full text-muted-foreground text-sm">Nenhuma sessão registrada.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 295)" />
                <XAxis dataKey="n" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
                <Legend />
                <Line type="monotone" name="Aura" dataKey="aura" stroke="var(--color-violet)" strokeWidth={2} />
                <Line type="monotone" name="Estresse (BPM)" dataKey="estresse" stroke="var(--color-emerald)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {(() => {
        const playlist = rows
          .filter((r) => r.frequencia_hz)
          .map((r) => ({
            hz: Number(r.frequencia_hz),
            label: r.pleitos ? `#${r.pleitos.numero} ${r.pleitos.nome}` : (r.chakra_alvo ?? "Pleito"),
          }));
        if (playlist.length === 0) return null;
        return (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Playlist da sessão</CardTitle>
              <CardDescription>
                Todas as frequências indicadas, em ordem cronológica. Reproduza tudo ou ative repetir.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SessionPlaylist items={playlist} secondsPerItem={60} />
            </CardContent>
          </Card>
        );
      })()}

      <div className="space-y-3">

        {rows.slice().reverse().map(r => {
          const compareData = [
            { name: "Aura", baseline: r.aura_before ?? 0, after: r.aura_after ?? 0 },
            { name: "Frequência (Hz)", baseline: 0, after: Number(r.frequencia_hz ?? 0) },
            { name: "Estresse (BPM)", baseline: r.stress_before ?? 0, after: r.stress_after ?? 0 },
          ];
          return (
            <Card key={r.id} className="shadow-soft">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-medium">{r.pleitos ? `#${r.pleitos.numero} ${r.pleitos.nome}` : "Pleito —"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("pt-BR")}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{r.frequencia_hz}Hz</Badge>
                    <Badge>{r.chakra_alvo}</Badge>
                    <Badge variant="secondary">ΔM {Number(r.delta_m ?? 0).toFixed(1)}%</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-soft-gradient">Aura {r.aura_before} → {r.aura_after}</div>
                  <div className="p-2 rounded-lg bg-soft-gradient">BPM {r.stress_before} → {r.stress_after}</div>
                </div>
                {(r.frequencia_before_hz != null || r.frequencia_after_hz != null) && (
                  <div className="p-2 rounded-lg bg-soft-gradient text-sm">
                    Frequência vibracional lida: <strong>{r.frequencia_before_hz ?? "—"} Hz</strong> → <strong>{r.frequencia_after_hz ?? "—"} Hz</strong>
                  </div>
                )}
                {(() => {
                  const mPleito = getFrequencyMeaning(r.frequencia_hz);
                  const mB = getFrequencyMeaning(r.frequencia_before_hz);
                  const mA = getFrequencyMeaning(r.frequencia_after_hz);
                  if (!mPleito && !mB && !mA) return null;
                  return (
                    <div className="space-y-2">
                      {mPleito && (
                        <div className="rounded-md border p-2 text-xs">
                          <p className="font-semibold">Pleito · {mPleito.hz} Hz — {mPleito.nome}</p>
                          <p className="text-muted-foreground">Chakra {mPleito.chakra}. {mPleito.significado}</p>
                        </div>
                      )}
                      <div className="grid sm:grid-cols-2 gap-2">
                        {mB && (
                          <div className="rounded-md border p-2 text-xs">
                            <p className="font-semibold">Antes · {mB.hz} Hz — {mB.nome}</p>
                            <p className="text-muted-foreground">{mB.significado}</p>
                          </div>
                        )}
                        {mA && (
                          <div className="rounded-md border p-2 text-xs bg-soft-gradient">
                            <p className="font-semibold">Depois · {mA.hz} Hz — {mA.nome}</p>
                            <p className="text-muted-foreground">{mA.significado}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
                {r.frequencia_hz ? (
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground">Frequência indicada — tocar e baixar</p>
                    <FrequencyPlayer hz={Number(r.frequencia_hz)} label={`Pleito · ${r.chakra_alvo ?? ""}`} />
                    <a
                      href={`https://curaquanticalarmaria.lovable.app/?hz=${r.frequencia_hz}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" /> Abrir player externo (Cura Quântica Lar Maria)
                    </a>
                  </div>
                ) : null}
                {(r.baseline_image_url || r.after_image_url) && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Antes</p>
                      {r.baseline_image_url
                        ? <img src={r.baseline_image_url} alt="Foto antes" className="w-full h-40 object-cover rounded-lg border" />
                        : <div className="h-40 grid place-items-center text-xs text-muted-foreground rounded-lg border bg-muted/30">Sem foto</div>}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Depois</p>
                      {r.after_image_url
                        ? <img src={r.after_image_url} alt="Foto depois" className="w-full h-40 object-cover rounded-lg border" />
                        : <div className="h-40 grid place-items-center text-xs text-muted-foreground rounded-lg border bg-muted/30">Sem foto</div>}
                    </div>
                  </div>
                )}
                <div className="h-56 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={compareData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 295)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
                      <Legend />
                      <Bar dataKey="baseline" name="Baseline" fill="var(--color-muted-foreground, #9E9E9E)" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="after" name="Pós-Tratamento" fill="var(--color-violet)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {r.observacoes && <p className="text-sm text-muted-foreground italic">{r.observacoes}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
