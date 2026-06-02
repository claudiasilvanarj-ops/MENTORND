import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { AuthGate } from "@/components/AuthGate";
import { AppLayout } from "@/components/Layout";
import { useServerFn } from "@tanstack/react-start";
import { analyzeDiseaseNoospheric } from "@/server/ai.functions";
import { SUBTLE_BODIES, DISEASES, MACRO_CORRELATIONS, TREATMENT_LAYERS, DELTA_M_INTERPRETATION, INTEGRITY_NOTE } from "@/lib/noosphericProtocol";
import { FrequencyPlayer } from "@/components/FrequencyPlayer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Heart, Waves, Printer } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

export const Route = createFileRoute("/noospheric")({
  validateSearch: (s: Record<string, unknown>) => z.object({ q: z.string().optional() }).parse(s),
  component: () => <AuthGate><AppLayout><NoosphericPage /></AppLayout></AuthGate>,
});

type Result = Awaited<ReturnType<typeof analyzeDiseaseNoospheric>>;

function NoosphericPage() {
  const { q: initialQ } = Route.useSearch();
  const analyze = useServerFn(analyzeDiseaseNoospheric);
  const [queixa, setQueixa] = useState(initialQ ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const submit = async (override?: string) => {
    const q = (override ?? queixa).trim();
    if (q.length < 2) { toast.error("Descreva a queixa."); return; }
    setLoading(true);
    try {
      const r = await analyze({ data: { queixa: q } });
      setResult(r);
    } catch (e) {
      toast.error("Falha ao consultar a IA.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQ && initialQ.trim().length >= 2) void submit(initialQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const printPdf = () => {
    if (!result) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    const margin = 48;
    let y = margin;

    doc.setFillColor(124, 58, 237);
    doc.rect(0, 0, w, 70, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("Protocolo Noosférico", margin, 36);
    doc.setFontSize(10);
    doc.text("Correlação Doença → Frequência → Corpos Sutis", margin, 54);
    y = 100;

    doc.setTextColor(20, 20, 20);
    doc.setFontSize(14);
    doc.text(result.doenca, margin, y); y += 18;
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text(`Corpos sutis: ${result.corpos.join(" + ")}`, margin, y); y += 14;
    doc.text(`Frequências-alvo: ${result.frequenciasAlvoHz.join(" · ")} Hz`, margin, y); y += 20;

    const block = (title: string, body: string) => {
      if (y > h - 100) { doc.addPage(); y = margin; }
      doc.setFontSize(11); doc.setTextColor(0, 0, 0);
      doc.text(title, margin, y); y += 14;
      doc.setFontSize(10); doc.setTextColor(50, 50, 50);
      const lines = doc.splitTextToSize(body, w - margin * 2);
      doc.text(lines, margin, y);
      y += lines.length * 13 + 12;
    };

    block("Mecanismo", result.mecanismo);
    block("Raiz metafísica", result.raiz);

    if (y > h - 160) { doc.addPage(); y = margin; }
    doc.setFontSize(11); doc.setTextColor(0, 0, 0);
    doc.text("Protocolo em 3 camadas", margin, y); y += 16;
    (["base", "porta", "alvo"] as const).forEach((k) => {
      const c = result.protocolo3Camadas[k];
      if (y > h - 70) { doc.addPage(); y = margin; }
      doc.setFontSize(10); doc.setTextColor(20, 20, 20);
      doc.text(`• ${k.toUpperCase()} — ${c.hz} Hz · ${c.minutos} min`, margin, y); y += 13;
      const obj = doc.splitTextToSize(c.objetivo, w - margin * 2 - 12);
      doc.setTextColor(80, 80, 80);
      doc.text(obj, margin + 12, y);
      y += obj.length * 12 + 6;
    });
    y += 6;

    block("Orientação", result.orientacao);
    block("Nota", result.nota);

    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("Mentor ND — Protocolo Noosférico. Leitura vibracional complementar.", margin, h - 24);
    doc.save(`protocolo-noosferico-${result.doenca.replace(/\s+/g, "_")}.pdf`);
  };


  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      <header>
        <p className="text-sm text-muted-foreground">Protocolo Noosférico de Alta Integridade — Canalizado por Lídia</p>
        <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" /> Correlação Doença → Frequência → Corpos Sutis
        </h1>
      </header>

      <Card className="shadow-soft border-primary/30">
        <CardHeader>
          <CardTitle className="text-base">Consulta vibracional</CardTitle>
          <CardDescription>Digite uma queixa de saúde (ex: "ansiedade", "fibromialgia", "enxaqueca crônica") para receber a correlação noosférica.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Queixa do paciente…"
              value={queixa}
              onChange={(e) => setQueixa(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            />
            <Button onClick={() => submit()} disabled={loading} className="bg-aura-gradient">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              <span className="ml-2">Analisar</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-lg">{result.doenca}</CardTitle>
                <CardDescription>Corpos sutis afetados: {result.corpos.join(" + ")}</CardDescription>
              </div>
              <div className="flex flex-wrap gap-1 items-center">
                {result.frequenciasAlvoHz.map((hz: number) => <Badge key={hz} variant="secondary">{hz} Hz</Badge>)}
                <Button size="sm" variant="outline" onClick={printPdf} className="ml-2">
                  <Printer className="h-4 w-4 mr-1" /> Imprimir
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Mecanismo</p>
              <p className="text-sm">{result.mecanismo}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1"><Heart className="h-3 w-3" /> Raiz metafísica</p>
              <p className="text-sm italic">{result.raiz}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1"><Waves className="h-3 w-3" /> Protocolo em 3 camadas</p>
              <div className="grid gap-3 md:grid-cols-3">
                {(["base","porta","alvo"] as const).map((k) => {
                  const c = result.protocolo3Camadas[k];
                  return (
                    <div key={k} className="rounded-xl border p-3 space-y-2 bg-card">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase font-semibold text-primary">{k}</span>
                        <Badge variant="outline">{c.minutos} min</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{c.objetivo}</p>
                      <FrequencyPlayer hz={Number(c.hz)} label={`Camada ${k.toUpperCase()}`} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Orientação</p>
              <p className="text-sm">{result.orientacao}</p>
            </div>
            <p className="text-xs italic text-muted-foreground border-t pt-3">{result.nota}</p>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Os 7 Corpos e suas Frequências Base</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {SUBTLE_BODIES.map((b) => (
            <div key={b.numero} className="rounded-xl border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{b.numero}. {b.nome}</p>
                <Badge variant="secondary">{b.frequenciaBaseHz} Hz</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{b.descricao}</p>
              <FrequencyPlayer hz={b.frequenciaBaseHz} label={b.nome} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Correlação Macro</CardTitle>
          <CardDescription>Para qualquer doença — referências por categoria.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {MACRO_CORRELATIONS.map((m) => (
            <div key={m.categoria} className="rounded-lg border p-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="font-medium text-sm">{m.categoria}</p>
                <div className="flex gap-1 flex-wrap">
                  {m.frequenciasHz.map((hz) => <Badge key={hz} variant="outline">{hz} Hz</Badge>)}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1"><span className="font-medium">Corpos:</span> {m.corpos.join(" + ")} · <span className="italic">{m.causa}</span></p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Tabela Micro — 20 Doenças</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {DISEASES.map((d) => (
            <div key={d.doenca} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="font-semibold text-sm">{d.doenca}</p>
                <div className="flex gap-1 flex-wrap">
                  {d.frequenciasHz.map((hz) => <Badge key={hz} variant="secondary">{hz} Hz</Badge>)}
                </div>
              </div>
              <p className="text-xs"><span className="font-medium">Corpos:</span> {d.corpos.join(" + ")}</p>
              <p className="text-xs text-muted-foreground"><span className="font-medium">Mecanismo:</span> {d.mecanismo}</p>
              <p className="text-xs italic"><span className="font-medium not-italic">Raiz:</span> {d.raiz}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader><CardTitle className="text-base">Mecanismo de cura — 3 camadas</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {TREATMENT_LAYERS.map((l) => (
              <div key={l.camada} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-semibold text-sm">{l.camada}</p>
                  <p className="text-xs text-muted-foreground">{l.objetivo}</p>
                </div>
                <Badge variant="outline">{l.hz ? `${l.hz} Hz · ` : ""}{l.minutos} min</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardHeader><CardTitle className="text-base">Interpretação do ΔM</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {DELTA_M_INTERPRETATION.map((d) => (
              <div key={d.faixa} className="flex items-center justify-between rounded-lg border p-3">
                <Badge>{d.faixa}</Badge>
                <p className="text-sm text-muted-foreground">{d.significado}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/40 bg-primary/5">
        <CardContent className="py-4">
          <p className="text-sm italic text-center">{INTEGRITY_NOTE}</p>
        </CardContent>
      </Card>
    </div>
  );
}
