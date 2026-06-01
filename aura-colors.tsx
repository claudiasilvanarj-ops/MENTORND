import { createFileRoute } from "@tanstack/react-router";
import { AuthGate } from "@/components/AuthGate";
import { AppLayout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/aura-colors")({
  head: () => ({
    meta: [
      { title: "Cores da Aura — Significados | Mentor ND" },
      { name: "description", content: "Catálogo das cores da aura e seu significado vibracional, emocional e espiritual." },
      { property: "og:title", content: "Cores da Aura — Significados" },
      { property: "og:description", content: "Catálogo das cores da aura e seu significado vibracional." },
    ],
  }),
  component: () => <AuthGate><AppLayout><AuraColorsPage /></AppLayout></AuthGate>,
});

type AuraColor = {
  nome: string;
  hex: string;
  chakra: string;
  qualidades: string;
  significado: string;
  desequilibrio: string;
};

const AURA_COLORS: AuraColor[] = [
  {
    nome: "Vermelho",
    hex: "#dc2626",
    chakra: "Raiz (Muladhara)",
    qualidades: "Vitalidade · Coragem · Paixão · Força física",
    significado: "Energia primária, conexão com a Terra e enraizamento. Indica pessoa de ação, instintiva e com forte presença física.",
    desequilibrio: "Quando densa: raiva, agressividade, impulsividade, estresse físico.",
  },
  {
    nome: "Laranja",
    hex: "#f97316",
    chakra: "Sacral (Svadhisthana)",
    qualidades: "Criatividade · Sensualidade · Sociabilidade · Alegria",
    significado: "Expressão criativa, vitalidade emocional e prazer de viver. Pessoa expansiva, calorosa e com boa interação social.",
    desequilibrio: "Quando turva: vícios, dependência emocional, instabilidade afetiva.",
  },
  {
    nome: "Amarelo",
    hex: "#eab308",
    chakra: "Plexo Solar (Manipura)",
    qualidades: "Intelecto · Confiança · Otimismo · Poder pessoal",
    significado: "Mente clara, autoestima elevada, capacidade analítica e liderança. Indica aprendizado ativo e brilho mental.",
    desequilibrio: "Quando opaco: ansiedade, controle excessivo, ego inflado, crítica.",
  },
  {
    nome: "Verde",
    hex: "#22c55e",
    chakra: "Cardíaco (Anahata)",
    qualidades: "Cura · Equilíbrio · Crescimento · Compaixão",
    significado: "Frequência de cura, harmonia e amor incondicional. Forte em terapeutas, curadores e pessoas em crescimento espiritual.",
    desequilibrio: "Quando pálido: ciúme, ressentimento, carência afetiva.",
  },
  {
    nome: "Rosa",
    hex: "#ec4899",
    chakra: "Cardíaco (Anahata)",
    qualidades: "Amor incondicional · Ternura · Bondade · Romance",
    significado: "Coração aberto, capacidade de amar e ser amado. Indica pureza emocional, doçura e relações afetivas saudáveis.",
    desequilibrio: "Quando esmaecido: dependência afetiva, idealização excessiva.",
  },
  {
    nome: "Azul",
    hex: "#3b82f6",
    chakra: "Laríngeo (Vishuddha)",
    qualidades: "Comunicação · Verdade · Calma · Lealdade",
    significado: "Expressão clara, verdade interior e serenidade. Comum em comunicadores, professores e pessoas pacificadoras.",
    desequilibrio: "Quando escuro: melancolia, dificuldade de expressão, isolamento.",
  },
  {
    nome: "Turquesa",
    hex: "#14b8a6",
    chakra: "Cardíaco–Laríngeo",
    qualidades: "Cura emocional · Comunicação afetiva · Empatia",
    significado: "Combina o amor do coração com a verdade da garganta. Indica curadores natos, terapeutas e mentores.",
    desequilibrio: "Quando opaco: dificuldade em colocar limites, sobrecarga emocional.",
  },
  {
    nome: "Índigo",
    hex: "#4f46e5",
    chakra: "Frontal / Terceiro Olho (Ajna)",
    qualidades: "Intuição · Sabedoria · Visão interior · Percepção",
    significado: "Forte conexão intuitiva, mediunidade e percepção espiritual. Pessoa visionária, profunda e introspectiva.",
    desequilibrio: "Quando turvo: confusão mental, sonhos pesados, dispersão.",
  },
  {
    nome: "Violeta",
    hex: "#7c3aed",
    chakra: "Coronário (Sahasrara)",
    qualidades: "Espiritualidade · Transmutação · Inspiração · Magia",
    significado: "Alta vibração espiritual, conexão com o divino e capacidade de transmutar densidades em luz.",
    desequilibrio: "Quando denso: alienação, fuga da realidade, fanatismo.",
  },
  {
    nome: "Branco",
    hex: "#f8fafc",
    chakra: "Coronário (Sahasrara)",
    qualidades: "Pureza · Verdade · Proteção · Conexão divina",
    significado: "Estado elevado de consciência, pureza vibracional e proteção espiritual. Comum em momentos de iluminação ou cura profunda.",
    desequilibrio: "Quando frio: distanciamento emocional, sensação de não pertencimento.",
  },
  {
    nome: "Dourado",
    hex: "#f59e0b",
    chakra: "Coronário · Plexo Solar",
    qualidades: "Sabedoria divina · Mestria · Abundância · Cristo interno",
    significado: "Indica integração espiritual avançada, presença do Eu Superior e missão de vida ativa. Aura de mestres e curadores.",
    desequilibrio: "Quando rara: bloqueio do propósito, escassez interior.",
  },
  {
    nome: "Prata",
    hex: "#94a3b8",
    chakra: "Frontal · Coronário",
    qualidades: "Conexão lunar · Abundância · Intuição feminina · Reflexão",
    significado: "Mente abundante, abertura para receber e forte conexão com o feminino sagrado e o inconsciente.",
    desequilibrio: "Quando opaca: indecisão, oscilação emocional, ilusão.",
  },
  {
    nome: "Cinza",
    hex: "#6b7280",
    chakra: "Geral",
    qualidades: "Neutralidade · Reserva · Proteção temporária",
    significado: "Indica fase de introspecção, recolhimento ou bloqueio energético leve. Pode sinalizar fadiga ou processo de transição.",
    desequilibrio: "Apatia, depressão leve, baixa vitalidade, estagnação.",
  },
  {
    nome: "Preto",
    hex: "#0f172a",
    chakra: "Raiz",
    qualidades: "Mistério · Proteção · Transformação profunda",
    significado: "Pode indicar campo de proteção intensa, processo profundo de transmutação ou bloqueios densos a serem trabalhados.",
    desequilibrio: "Bloqueios kármicos, traumas não processados, exaustão energética.",
  },
  {
    nome: "Vermelho Escuro (Obsessão)",
    hex: "#7f1d1d",
    chakra: "Raiz · Sacral",
    qualidades: "Fixação · Possessividade · Desejo intenso · Apego",
    significado: "Indica padrões obsessivos, fixação mental ou emocional em pessoas, ideias ou situações. Energia presa em loops de desejo, ciúme ou controle. Sinaliza necessidade de liberação vibracional (frequências 396 Hz e 417 Hz) para dissolver apegos e traumas cristalizados.",
    desequilibrio: "Pensamentos repetitivos, ciúme doentio, vícios afetivos, possessividade, dificuldade de soltar pessoas ou situações.",
  },
  {
    nome: "Marrom",
    hex: "#92400e",
    chakra: "Raiz · Sacral",
    qualidades: "Enraizamento · Praticidade · Estabilidade",
    significado: "Forte conexão com a Terra, materialização e foco prático. Indica pessoa estável e confiável.",
    desequilibrio: "Materialismo excessivo, rigidez, dificuldade em abstrair.",
  },
];

function AuraColorsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      <header>
        <p className="text-sm text-muted-foreground">Catálogo vibracional</p>
        <h1 className="text-3xl font-semibold tracking-tight">Cores da Aura</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Significado vibracional, emocional e espiritual de cada cor lida no campo áurico.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {AURA_COLORS.map((c) => (
          <Card key={c.nome} className="shadow-soft overflow-hidden">
            <div
              className="h-20 w-full"
              style={{ background: `linear-gradient(135deg, ${c.hex} 0%, ${c.hex}cc 100%)` }}
              aria-hidden
            />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span
                    className="inline-block h-5 w-5 rounded-full border"
                    style={{ backgroundColor: c.hex }}
                    aria-label={c.nome}
                  />
                  {c.nome}
                </CardTitle>
                <Badge variant="outline" className="text-[10px]">{c.hex}</Badge>
              </div>
              <CardDescription>{c.chakra}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Qualidades</p>
              <p className="text-xs">{c.qualidades}</p>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-1">Significado</p>
              <p className="text-xs leading-relaxed">{c.significado}</p>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-1">Desequilíbrio</p>
              <p className="text-xs leading-relaxed text-muted-foreground italic">{c.desequilibrio}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
