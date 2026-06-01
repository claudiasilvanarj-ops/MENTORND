import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppLayout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FrequencyPlayer } from "@/components/FrequencyPlayer";
import { Circle, AlertTriangle, Printer, Sparkles, CheckCircle2, RotateCw, Wind, Gauge, Sun, ShieldCheck } from "lucide-react";
import jsPDF from "jspdf";

export const Route = createFileRoute("/umbilical")({
  head: () => ({
    meta: [
      { title: "Fechamento do Chakra Umbilical · Mentor ND" },
      { name: "description", content: "Protocolo de fechamento do chakra umbilical em 4 passos com frequência complementar 1741 Hz." },
    ],
  }),
  component: () => <AuthGate><AppLayout><UmbilicalPage /></AppLayout></AuthGate>,
});

const CHAKRA_TABLE = [
  { campo: "Localização", valor: "2 a 3 dedos abaixo do umbigo" },
  { campo: "Cor", valor: "Laranja dourado (#FF8C00)" },
  { campo: "Elemento", valor: "Éter / Prana" },
  { campo: "Função", valor: "Conexão com a matriz energética, cordões de prana, vínculos sutis" },
];

const MENSAGENS = {
  abertura: "Antes de fechar, sinta. Coloque a mão sobre o umbigo e perceba se há peso, frio, formigamento ou vazio. Isso é o seu campo pedindo cuidado.",
  fechamento: "Visualize uma luz dourada formando uma espiral sobre o seu umbigo, girando suavemente em sentido horário, selando o portal.",
  integracao: "Você fechou um portal. Agora respire e sinta a sua energia retornar para o seu centro. Você é inteiro(a). Você é seu.",
};

function UmbilicalPage() {
  const [accepted, setAccepted] = useState(false);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(1);
  const [nome, setNome] = useState("");
  const [pre, setPre] = useState<string>("");
  const [pos, setPos] = useState<string>("");
  const [expandiu, setExpandiu] = useState<null | boolean>(null);

  // Breathing animation
  const [phase, setPhase] = useState<"inspira" | "segura" | "expira">("inspira");
  const [breathing, setBreathing] = useState(false);
  const [cycle, setCycle] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!breathing) return;
    const seq: Array<{ p: "inspira" | "segura" | "expira"; ms: number }> = [
      { p: "inspira", ms: 4000 },
      { p: "segura", ms: 4000 },
      { p: "expira", ms: 6000 },
    ];
    let i = 0;
    const run = () => {
      setPhase(seq[i].p);
      timerRef.current = setTimeout(() => {
        i = (i + 1) % seq.length;
        if (i === 0) setCycle((c) => c + 1);
        run();
      }, seq[i].ms);
    };
    run();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [breathing]);

  const printPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    const margin = 48;
    let y = margin;
    doc.setFillColor(255, 140, 0);
    doc.rect(0, 0, w, 70, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("Fechamento do Chakra Umbilical", margin, 36);
    doc.setFontSize(10);
    doc.text("Protocolo em 4 passos · Frequência complementar 1741 Hz", margin, 54);
    y = 100;
    doc.setTextColor(20, 20, 20); doc.setFontSize(12);
    doc.text("Conceito do Módulo", margin, y); y += 16;
    doc.setFontSize(10); doc.setTextColor(60, 60, 60);
    const concept = doc.splitTextToSize("O chakra umbilical é o portal de vínculos pránicos e cordões energéticos. Quando aberto fora de hora, drena vitalidade. Este módulo guia o fechamento consciente em 4 passos.", w - margin * 2);
    doc.text(concept, margin, y); y += concept.length * 12 + 10;

    doc.setTextColor(20,20,20); doc.setFontSize(12); doc.text("Tabela do Chakra Umbilical", margin, y); y += 16;
    doc.setFontSize(10);
    CHAKRA_TABLE.forEach((r) => {
      const line = doc.splitTextToSize(`• ${r.campo}: ${r.valor}`, w - margin * 2 - 8);
      doc.text(line, margin + 8, y); y += line.length * 12;
    });
    y += 8;
    doc.setFontSize(12); doc.text("Os 4 Passos", margin, y); y += 16;
    doc.setFontSize(10);
    [
      "1. Respiração de 3 estágios (inspira 4s · segura 4s · expira 6s × 7 ciclos)",
      "2. Mensuração da própria energia (perceber peso, frio, formigamento, vazio no umbigo)",
      "3. Comando vibracional: \"[Nome], fecha o seu chakra umbilical\" + visualização de espiral dourada",
      "4. Verificação da expansão energética (Sim ✅ / Não 🔄 — repetir se necessário)",
    ].forEach((t) => {
      const l = doc.splitTextToSize(t, w - margin * 2);
      doc.text(l, margin, y); y += l.length * 12 + 2;
    });
    y += 8;
    doc.setFontSize(12); doc.text("Frequência complementar", margin, y); y += 16;
    doc.setFontSize(10); doc.setTextColor(60,60,60);
    doc.text("1741 Hz — Purificação Áurica. Tocar após o fechamento por 5–11 minutos.", margin, y); y += 18;

    doc.setTextColor(120, 90, 30); doc.setFontSize(10);
    const mens = doc.splitTextToSize(`"${MENSAGENS.integracao}"`, w - margin * 2);
    doc.text(mens, margin, y); y += mens.length * 12 + 14;

    doc.setFontSize(9); doc.setTextColor(120,120,120);
    doc.text("Mentor ND · https://silinfopro.com.br · Não substitui acompanhamento médico ou psicológico.", margin, h - 24);
    doc.save("fechamento-chakra-umbilical.pdf");
  };

  if (!started) {
    return (
      <div className="container mx-auto p-6 max-w-3xl space-y-6">
        <header className="space-y-1">
          <p className="text-sm text-muted-foreground">Módulo Funcional · Etapa 3 do Fluxo Principal</p>
          <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
            <Circle className="h-7 w-7" style={{ color: "#FF8C00" }} />
            Fechamento do Chakra Umbilical
          </h1>
          <p className="text-sm text-muted-foreground">Protocolo em 4 passos · cor laranja dourado · 1741 Hz complementar</p>
        </header>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Conceito & Fundamento</CardTitle>
            <CardDescription>O portal pránico do umbigo.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>O <strong>chakra umbilical</strong> é o ponto de vínculos energéticos — cordões pránicos que conectam você a pessoas, lugares e situações. Quando permanece aberto fora de hora, drena vitalidade e gera sensação de cansaço sem causa.</p>
            <p className="text-muted-foreground">O fechamento consciente devolve a energia ao seu centro e sela o portal por meio de respiração, percepção, comando vibracional e verificação.</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Tabela do Chakra Umbilical</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm divide-y">
              {CHAKRA_TABLE.map((r) => (
                <li key={r.campo} className="flex justify-between py-2 gap-3">
                  <span className="text-muted-foreground">{r.campo}</span>
                  <span className="text-right font-medium">{r.valor}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-amber-400/50 bg-amber-50/50 dark:bg-amber-950/20 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5" /> Modal de Cuidados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Não substitui acompanhamento médico ou psicológico.</p>
            <p>• Realize em ambiente tranquilo, sem interrupções.</p>
            <p>• Não pratique dirigindo ou operando máquinas.</p>
            <p>• Se sentir tontura, pare e volte ao ritmo natural da respiração.</p>
            <div className="flex items-center gap-2 pt-3 border-t mt-3">
              <Checkbox id="ok" checked={accepted} onCheckedChange={(v) => setAccepted(!!v)} />
              <label htmlFor="ok" className="text-sm cursor-pointer">Li e compreendo os cuidados.</label>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button disabled={!accepted} onClick={() => setStarted(true)} style={{ background: "linear-gradient(135deg,#FF8C00,#FFB347)" }} className="text-white">
                <Sparkles className="h-4 w-4 mr-2" /> Iniciar Fechamento
              </Button>
              <Button variant="outline" onClick={printPdf}><Printer className="h-4 w-4 mr-2" /> Imprimir Protocolo</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader><CardTitle className="text-base">Integração com o Fluxo Principal</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><Badge variant="outline">Etapa 3</Badge> Após Diagnóstico (1) e Tratamento (2), o Fechamento do Chakra Umbilical sela o trabalho energético e evita reabertura de cordões.</p>
            <p className="text-muted-foreground">Recomenda-se aplicar ao final de qualquer sessão (Protocolo Noosférico, Luto, Aura, etc.).</p>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center">
          Contato: <a href="https://silinfopro.com.br" target="_blank" rel="noreferrer" className="underline">silinfopro.com.br</a>
        </p>
      </div>
    );
  }

  const ring = phase === "inspira" ? "scale-110" : phase === "segura" ? "scale-110" : "scale-90";

  return (
    <div className="container mx-auto p-6 max-w-3xl space-y-6">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm text-muted-foreground">Passo {step} de 4</p>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Circle className="h-6 w-6" style={{ color: "#FF8C00" }} />
            Fechamento do Chakra Umbilical
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={printPdf}><Printer className="h-4 w-4 mr-1" /> Imprimir</Button>
          <Button variant="ghost" size="sm" onClick={() => { setStarted(false); setStep(1); setBreathing(false); setExpandiu(null); }}>Reiniciar</Button>
        </div>
      </header>

      {step === 1 && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Wind className="h-5 w-5" style={{ color: "#FF8C00" }} /> Passo 1 — Respiração de 3 estágios</CardTitle>
            <CardDescription>Inspire 4s · segure 4s · expire 6s. Faça 7 ciclos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative grid place-items-center py-8">
              <div
                className={`rounded-full transition-transform duration-[4000ms] ease-in-out ${ring}`}
                style={{
                  width: 220, height: 220,
                  background: "radial-gradient(circle, #FFB347 0%, #FF8C00 60%, rgba(255,140,0,0) 100%)",
                  boxShadow: "0 0 80px rgba(255,140,0,0.5)",
                }}
              />
              <div className="absolute text-center">
                <p className="text-white text-2xl font-semibold uppercase tracking-wider drop-shadow">{phase}</p>
                <p className="text-white/80 text-sm mt-1">ciclo {cycle}/7</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {!breathing ? (
                <Button onClick={() => { setBreathing(true); setCycle(0); }} style={{ background: "#FF8C00" }} className="text-white">
                  <Wind className="h-4 w-4 mr-1" /> Começar respiração
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setBreathing(false)}>Pausar</Button>
              )}
              <Button variant="secondary" onClick={() => { setBreathing(false); setStep(2); }} disabled={cycle < 1 && breathing}>
                Próximo passo →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Gauge className="h-5 w-5" style={{ color: "#FF8C00" }} /> Passo 2 — Mensuração da própria energia</CardTitle>
            <CardDescription>{MENSAGENS.abertura}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">Coloque a mão sobre o umbigo. O que você percebe?</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {["Peso", "Frio", "Formigamento", "Vazio", "Calor", "Pulsação", "Nada", "Outro"].map((s) => (
                <Button
                  key={s}
                  variant={pre === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPre(s)}
                  style={pre === s ? { background: "#FF8C00" } : {}}
                  className={pre === s ? "text-white" : ""}
                >
                  {s}
                </Button>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setStep(1)}>← Voltar</Button>
              <Button onClick={() => setStep(3)} disabled={!pre} style={{ background: "#FF8C00" }} className="text-white">Próximo passo →</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Sun className="h-5 w-5" style={{ color: "#FF8C00" }} /> Passo 3 — Comando vibracional</CardTitle>
            <CardDescription>Digite o seu nome e pronuncie em voz alta o comando.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            {nome && (
              <div className="rounded-xl border p-6 text-center space-y-4 relative overflow-hidden">
                <div
                  className="absolute inset-0 -z-10 opacity-60 animate-pulse"
                  style={{ background: "radial-gradient(circle at center, rgba(255,140,0,0.45), transparent 70%)" }}
                />
                <p className="text-lg font-medium">
                  "<span style={{ color: "#FF8C00" }}>{nome}</span>, fecha o seu chakra umbilical."
                </p>
                <p className="text-sm text-muted-foreground italic">{MENSAGENS.fechamento}</p>
                <div className="grid place-items-center py-2">
                  <div
                    className="h-24 w-24 rounded-full animate-spin"
                    style={{
                      background: "conic-gradient(from 0deg, #FF8C00, #FFD580, #FF8C00)",
                      boxShadow: "0 0 60px rgba(255,140,0,0.7)",
                      animationDuration: "6s",
                    }}
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setStep(2)}>← Voltar</Button>
              <Button onClick={() => setStep(4)} disabled={!nome.trim()} style={{ background: "#FF8C00" }} className="text-white">
                Pronunciei o comando →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><ShieldCheck className="h-5 w-5" style={{ color: "#FF8C00" }} /> Passo 4 — Verificação da expansão</CardTitle>
            <CardDescription>Sinta novamente. Houve expansão / leveza no centro?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {["Leveza", "Calor", "Expansão", "Centramento", "Ainda peso", "Ainda frio", "Neutro", "Outro"].map((s) => (
                <Button key={s} variant={pos === s ? "default" : "outline"} size="sm" onClick={() => setPos(s)}
                  style={pos === s ? { background: "#FF8C00" } : {}} className={pos === s ? "text-white" : ""}>
                  {s}
                </Button>
              ))}
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <Button size="lg" onClick={() => setExpandiu(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <CheckCircle2 className="h-5 w-5 mr-2" /> Sim ✅
              </Button>
              <Button size="lg" variant="outline" onClick={() => { setExpandiu(false); setStep(1); }}>
                <RotateCw className="h-5 w-5 mr-2" /> Não 🔄 (repetir)
              </Button>
            </div>

            {expandiu === true && (
              <div className="space-y-4 pt-4 border-t">
                <div className="rounded-lg border bg-muted/30 p-4 text-sm italic text-center">
                  "{MENSAGENS.integracao}"
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Frequência complementar — 1741 Hz (Purificação Áurica)</p>
                  <FrequencyPlayer hz={1741} label="1741 Hz · Purificação Áurica" />
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Contato: <a href="https://silinfopro.com.br" target="_blank" rel="noreferrer" className="underline">silinfopro.com.br</a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
