import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppLayout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { FrequencyPlayer } from "@/components/FrequencyPlayer";
import { Heart, AlertTriangle, Printer, Sparkles } from "lucide-react";
import jsPDF from "jspdf";

export const Route = createFileRoute("/grief")({
  head: () => ({
    meta: [
      { title: "Tratamento Emocional do Luto · Mentor ND" },
      { name: "description", content: "Protocolo de 34 dias em 5 camadas energéticas para processar o luto." },
    ],
  }),
  component: () => <AuthGate><AppLayout><GriefPage /></AppLayout></AuthGate>,
});

type Layer = {
  numero: number;
  nome: string;
  descricao: string;
  hz: number[];
  dias: number;
  instrucao: string[];
  progresso: string;
  acolhimento: string;
  combinar?: string;
};

const LAYERS: Layer[] = [
  {
    numero: 1,
    nome: "Choque / Entorpecimento",
    descricao: "O campo vibracional se contrai para se proteger. Sensação de irrealidade, \"não caiu a ficha\".",
    hz: [432],
    dias: 3,
    instrucao: ["Ouvir 1x ao dia por 3 dias", "Deitado, mãos no colo", "Ambiente silencioso"],
    progresso: "A pessoa começa a chorar ou nomear a perda.",
    acolhimento: "Você não precisa entender tudo agora. Apenas respire. O campo se reorganiza sozinho quando você permite o silêncio.",
  },
  {
    numero: 2,
    nome: "Raiva / Revolta",
    descricao: "O campo vibra em alta intensidade desordenada. \"Por que comigo?\". Pode se manifestar como irritabilidade.",
    hz: [7396],
    dias: 5,
    instrucao: ["Ouvir 1x ao dia por 5 dias", "Sentada, com respiração consciente", "Inspirar pelo nariz, expirar pela boca"],
    progresso: "A pessoa relata aceitação ou cansaço da raiva.",
    acolhimento: "Sua raiva é sua força mal direcionada. Não lute contra ela. Sinta, respire, deixe passar.",
  },
  {
    numero: 3,
    nome: "Vazio / Tristeza Profunda",
    descricao: "O campo colapsa — sensação de buraco no peito. Anedonia, isolamento. Atenção a sinais de depressão clínica.",
    hz: [17285],
    dias: 7,
    instrucao: ["Ouvir 1x ao dia por 7 dias", "Com fones de ouvido", "Ambiente escuro e silencioso"],
    progresso: "A pessoa volta a sentir prazer em pequenas coisas.",
    acolhimento: "O vazio que você sente tem o exato tamanho do amor que você guarda. Não é ausência. É espaço sagrado.",
  },
  {
    numero: 4,
    nome: "Culpa / \"E se...\"",
    descricao: "O campo se fecha em loop — a pessoa revisita o passado sem sair. Insônia, pensamento obsessivo.",
    hz: [2693],
    dias: 5,
    instrucao: [
      "Ouvir 1x ao dia por 5 dias",
      "Antes: 7 respirações do Perdão (inspirar pelo nariz, expirar mentalizando \"eu me perdoo\")",
      "Após: escrever uma carta de perdão a si mesmo(a) — ritual de liberação",
    ],
    combinar: "Respiração do Perdão (7 repetições antes da frequência)",
    progresso: "A pessoa relata alívio ou aceitação do passado.",
    acolhimento: "Você fez o que podia com o que sabia naquele momento. Perdoe-se. O ente que partiu já te perdoou.",
  },
  {
    numero: 5,
    nome: "Ressignificação / Reconstrução",
    descricao: "O campo começa a se reorganizar em novo padrão. A dor se transforma em saudade consciente.",
    hz: [4417, 1741],
    dias: 14,
    instrucao: [
      "Alternar as duas frequências dia sim, dia não, por 14 dias",
      "Dia 1: 4417 Hz · Dia 2: 1741 Hz · repetir",
      "Nesta fase, pode começar novas atividades",
    ],
    combinar: "1741 Hz (Purificação Áurica) alternada com 4417 Hz (Regeneração de DNA)",
    progresso: "A pessoa relata novos projetos, nova rotina, recomeço.",
    acolhimento: "Você não está superando. Você está integrando. O amor não vai embora. Ele só encontrou um novo lugar em você.",
  },
];

function GriefPage() {
  const [accepted, setAccepted] = useState(false);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState<Record<number, boolean>>({});

  const totalDias = LAYERS.reduce((s, l) => s + l.dias, 0);
  const completed = Object.values(done).filter(Boolean).length;

  const printPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    const margin = 48;
    let y = margin;

    doc.setFillColor(245, 208, 96);
    doc.rect(0, 0, w, 70, "F");
    doc.setTextColor(10, 22, 40);
    doc.setFontSize(16);
    doc.text("Tratamento Emocional do Luto", margin, 36);
    doc.setFontSize(10);
    doc.text("5 Camadas Energéticas · Protocolo de 34 dias", margin, 54);
    y = 100;

    doc.setTextColor(20, 20, 20);
    doc.setFontSize(11);
    const intro = "O luto não é uma emoção — é um conjunto de camadas energéticas que se instalam no campo vibracional. Cada camada precisa ser identificada, acolhida e transmutada por uma frequência específica.";
    const introLines = doc.splitTextToSize(intro, w - margin * 2);
    doc.text(introLines, margin, y); y += introLines.length * 13 + 10;

    LAYERS.forEach((l) => {
      if (y > h - 140) { doc.addPage(); y = margin; }
      doc.setFontSize(12); doc.setTextColor(0, 0, 0);
      doc.text(`Camada ${l.numero} — ${l.nome}`, margin, y); y += 16;
      doc.setFontSize(10); doc.setTextColor(60, 60, 60);
      const desc = doc.splitTextToSize(l.descricao, w - margin * 2);
      doc.text(desc, margin, y); y += desc.length * 12 + 4;
      doc.setTextColor(20, 20, 20);
      doc.text(`Frequência: ${l.hz.join(" + ")} Hz · ${l.dias} dias`, margin, y); y += 14;
      l.instrucao.forEach((i) => {
        const ls = doc.splitTextToSize(`• ${i}`, w - margin * 2 - 8);
        doc.setTextColor(50, 50, 50);
        doc.text(ls, margin + 8, y); y += ls.length * 12;
      });
      doc.setTextColor(90, 90, 90);
      const sig = doc.splitTextToSize(`Sinal de progresso: ${l.progresso}`, w - margin * 2);
      doc.text(sig, margin, y); y += sig.length * 12 + 4;
      const ac = doc.splitTextToSize(`"${l.acolhimento}"`, w - margin * 2);
      doc.setTextColor(120, 90, 30);
      doc.text(ac, margin, y); y += ac.length * 12 + 14;
    });

    if (y > h - 80) { doc.addPage(); y = margin; }
    doc.setFontSize(9); doc.setTextColor(120, 120, 120);
    doc.text("Mentor ND · Tratamento Emocional do Luto. Não substitui acompanhamento psicológico ou psiquiátrico.", margin, h - 24);
    doc.save("tratamento-emocional-luto.pdf");
  };

  if (!started) {
    return (
      <div className="container mx-auto p-6 max-w-3xl space-y-6">
        <header className="space-y-1">
          <p className="text-sm text-muted-foreground">Módulo Funcional</p>
          <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
            <Heart className="h-7 w-7 text-primary" /> Tratamento Emocional do Luto
          </h1>
          <p className="text-sm text-muted-foreground">5 camadas energéticas · frequências específicas · protocolo de 34 dias</p>
        </header>

        <Card className="border-amber-400/50 bg-amber-50/50 dark:bg-amber-950/20 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5" /> Atenção — Cuidados
            </CardTitle>
            <CardDescription>Leia antes de iniciar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Este tratamento <strong>NÃO</strong> substitui terapia psicológica ou psiquiátrica.</p>
            <p>• <strong>NÃO</strong> apressa o luto — ele acompanha o processo natural.</p>
            <p>• <strong>NÃO</strong> elimina a saudade — a saudade é amor preservado.</p>
            <p>• Pode ser aplicado em paralelo com a Ponte no Luto, mas <strong>não na mesma sessão</strong>.</p>
            <div className="flex items-center gap-2 pt-3 border-t mt-3">
              <Checkbox id="ok" checked={accepted} onCheckedChange={(v) => setAccepted(!!v)} />
              <label htmlFor="ok" className="text-sm cursor-pointer">Li e compreendo os cuidados.</label>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button disabled={!accepted} onClick={() => setStarted(true)} className="bg-aura-gradient">
                <Sparkles className="h-4 w-4 mr-2" /> Iniciar Tratamento
              </Button>
              <Button variant="outline" onClick={printPdf}>
                <Printer className="h-4 w-4 mr-2" /> Imprimir Protocolo
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Fluxo de Decisão</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>"Você busca conforto na conexão com o ente que partiu (<strong>Ponte no Luto</strong>) ou prefere tratar as emoções do luto em você mesma(o) (<strong>Tratamento Emocional do Luto</strong>)?"</p>
            <p className="text-muted-foreground">As duas abordagens são complementares, mas não devem ser aplicadas na mesma sessão. Sugestão: iniciar pelo Tratamento Emocional (5 camadas) e, após concluir, fazer a Ponte no Luto se desejar.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm text-muted-foreground">Módulo Funcional · {totalDias} dias</p>
          <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
            <Heart className="h-7 w-7 text-primary" /> Tratamento Emocional do Luto
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Camadas concluídas: {completed}/{LAYERS.length}</p>
        </div>
        <Button variant="outline" onClick={printPdf}><Printer className="h-4 w-4 mr-1" /> Imprimir Protocolo</Button>
      </header>

      <div className="grid gap-4">
        {LAYERS.map((l) => (
          <Card key={l.numero} className="shadow-soft">
            <CardHeader>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <CardTitle className="text-lg">Camada {l.numero} — {l.nome}</CardTitle>
                  <CardDescription className="mt-1">{l.descricao}</CardDescription>
                </div>
                <div className="flex flex-wrap gap-1 items-center">
                  {l.hz.map((h) => <Badge key={h} variant="secondary">{h} Hz</Badge>)}
                  <Badge variant="outline">{l.dias} dias</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Instruções</p>
                <ul className="text-sm space-y-1 list-disc pl-5">
                  {l.instrucao.map((i, k) => <li key={k}>{i}</li>)}
                </ul>
                {l.combinar && <p className="text-xs italic text-muted-foreground mt-2">Combinar com: {l.combinar}</p>}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {l.hz.map((h) => (
                  <FrequencyPlayer key={h} hz={h} label={`${h} Hz`} />
                ))}
              </div>

              <div className="rounded-lg border bg-muted/30 p-3 text-sm italic">
                "{l.acolhimento}"
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <p className="text-xs text-muted-foreground"><span className="font-medium not-italic">Sinal de progresso:</span> {l.progresso}</p>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`d-${l.numero}`}
                    checked={!!done[l.numero]}
                    onCheckedChange={(v) => setDone((s) => ({ ...s, [l.numero]: !!v }))}
                  />
                  <label htmlFor={`d-${l.numero}`} className="text-sm cursor-pointer">Camada concluída</label>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/40 bg-primary/5">
        <CardContent className="py-4 text-sm italic text-center">
          "A saudade é amor que não tem para onde ir — mas o amor nunca vai embora, ele só muda de forma.
          Você não precisa esquecer para se curar. Você precisa se curar para lembrar sem sangrar."
        </CardContent>
      </Card>

      <Card className="border-red-400/40 bg-red-50/50 dark:bg-red-950/20">
        <CardContent className="py-4 text-sm">
          <p className="font-medium text-red-700 dark:text-red-300 mb-1">Precisa de ajuda agora?</p>
          <p className="text-muted-foreground">CVV — Centro de Valorização da Vida: ligue <a href="tel:188" className="underline font-medium">188</a> (24h, gratuito) ou procure um psicólogo de confiança.</p>
        </CardContent>
      </Card>
    </div>
  );
}
