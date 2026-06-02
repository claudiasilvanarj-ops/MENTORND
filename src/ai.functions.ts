import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CHAKRAS = ["Raiz", "Sacral", "Plexo Solar", "Cardíaco", "Laríngeo", "Frontal", "Coronário"];
const AURA_COLORS = [
  "Vermelho", "Laranja", "Amarelo", "Verde", "Rosa",
  "Azul", "Turquesa", "Índigo", "Violeta", "Branco", "Dourado", "Prata", "Cinza", "Preto", "Marrom"
];

const AnalyzeInput = z.object({
  imageBase64: z.string().min(20).max(2_000_000),
  stage: z.enum(["before", "after"]),
});

const FALLBACK = {
  auraScore: 50,
  chakra: "Cardíaco",
  frequencyHz: 528,
  auraColor: "Verde",
  auraColorHex: "#22c55e",
  notes: "IA indisponível — valor estimado.",
};

export const analyzeAura = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => AnalyzeInput.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return FALLBACK;

    const sys = `Você é um analista de bio-ressonância. Ao receber a foto de um paciente, estime de forma heurística (densidade de luz percebida, brilho, contraste, postura, tonalidade dominante ao redor do corpo) os seguintes parâmetros vibracionais:
- SCORE DE AURA de 0 a 100
- CHAKRA ALVO mais provável dentre: ${CHAKRAS.join(", ")}
- FREQUÊNCIA VIBRACIONAL DOMINANTE em Hz (faixa terapêutica 174–963 Hz: 174, 285, 396, 417, 528, 639, 741, 852, 963)
- COR DOMINANTE DA AURA dentre: ${AURA_COLORS.join(", ")}
- HEX da cor da aura (ex: "#7c3aed")
Responda APENAS chamando a função register_aura.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          {
            role: "user",
            content: [
              { type: "text", text: `Estágio: ${data.stage === "before" ? "Baseline (entrada)" : "After (saída)"}. Analise a imagem e retorne os valores.` },
              { type: "image_url", image_url: { url: data.imageBase64 } },
            ],
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "register_aura",
            description: "Registra a estimativa de aura, chakra, frequência e cor",
            parameters: {
              type: "object",
              properties: {
                auraScore: { type: "integer", minimum: 0, maximum: 100 },
                chakra: { type: "string", enum: CHAKRAS },
                frequencyHz: { type: "number", minimum: 50, maximum: 1500 },
                auraColor: { type: "string", enum: AURA_COLORS, description: "Cor dominante percebida na aura." },
                auraColorHex: { type: "string", description: "Cor hex correspondente, ex: #7c3aed" },
                notes: { type: "string", description: "Observação técnica curta sobre densidade/brilho/cor percebidos." },
              },
              required: ["auraScore", "chakra", "frequencyHz", "auraColor", "auraColorHex", "notes"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "register_aura" } },
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("AI gateway error", res.status, txt);
      if (res.status === 429) return { ...FALLBACK, notes: "Limite de requisições atingido. Tente novamente em instantes." };
      if (res.status === 402) return { ...FALLBACK, notes: "Créditos de IA esgotados. Adicione créditos no workspace." };
      return { ...FALLBACK, notes: "Erro ao analisar imagem; valor estimado." };
    }

    const json = await res.json();
    const call = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    try {
      const parsed = JSON.parse(call ?? "{}");
      const hex = typeof parsed.auraColorHex === "string" && /^#[0-9a-fA-F]{6}$/.test(parsed.auraColorHex)
        ? parsed.auraColorHex
        : "#22c55e";
      return {
        auraScore: Math.max(0, Math.min(100, Number(parsed.auraScore) || 50)),
        chakra: CHAKRAS.includes(parsed.chakra) ? parsed.chakra : "Cardíaco",
        frequencyHz: Math.max(50, Math.min(1500, Number(parsed.frequencyHz) || 528)),
        auraColor: AURA_COLORS.includes(parsed.auraColor) ? parsed.auraColor : "Verde",
        auraColorHex: hex,
        notes: String(parsed.notes ?? ""),
      };
    } catch {
      return { ...FALLBACK, notes: "Resposta inválida da IA." };
    }
  });

const SummarizeInput = z.object({
  pleitoNome: z.string(),
  frequenciaHz: z.number(),
  chakra: z.string(),
  auraBefore: z.number(),
  auraAfter: z.number(),
  stressBefore: z.number(),
  stressAfter: z.number(),
  deltaM: z.number(),
});

export const summarizeSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SummarizeInput.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    const fallback = `Sessão aplicada com o ${data.pleitoNome} na frequência de ${data.frequenciaHz}Hz, atuando sobre o chakra ${data.chakra}. Score de Aura evoluiu de ${data.auraBefore} para ${data.auraAfter} (ΔM ${data.deltaM.toFixed(1)}%). Estresse variou de ${data.stressBefore} para ${data.stressAfter} BPM. Bio-ressonância indica reorganização vibracional compatível com o pleito aplicado.`;
    if (!apiKey) return { summary: fallback };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "Você é um redator clínico de medicina integrativa. Gere um resumo técnico de 3-5 frases em português, sem emojis, mencionando pleito, frequência, chakra alvo, ΔM e bio-ressonância." },
          { role: "user", content: JSON.stringify(data) },
        ],
      }),
    });
    if (!res.ok) return { summary: fallback };
    const j = await res.json();
    const txt = j.choices?.[0]?.message?.content;
    return { summary: typeof txt === "string" && txt.length > 0 ? txt : fallback };
  });

const MultidimensionalInput = z.object({
  patientName: z.string(),
  clinicalIndication: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  sessions: z.array(z.object({
    date: z.string(),
    pleito: z.string().optional().nullable(),
    frequenciaHz: z.number().optional().nullable(),
    chakra: z.string().optional().nullable(),
    auraBefore: z.number().optional().nullable(),
    auraAfter: z.number().optional().nullable(),
    stressBefore: z.number().optional().nullable(),
    stressAfter: z.number().optional().nullable(),
    deltaM: z.number().optional().nullable(),
  })).max(50),
});

export const multidimensionalRecommendation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => MultidimensionalInput.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    const fallback = `Com base no histórico vibracional de ${data.patientName} (${data.sessions.length} sessões), recomenda-se um protocolo de cura multidimensional sequencial integrando os 7 chakras principais. Iniciar pelo chakra com menor evolução de ΔM, aplicando a frequência correspondente por 15 minutos diários durante 21 dias. Reforçar o eixo Coração–Coronário (528Hz e 963Hz) para harmonização noosférica.`;
    if (!apiKey) return { recommendation: fallback };

    const sys = `Você é um terapeuta vibracional integrativo. Gere uma INDICAÇÃO DE APLICAÇÃO DE FREQUÊNCIA PARA CURA MULTIDIMENSIONAL personalizada em português (8 a 12 frases, sem emojis), considerando:
- queixas e medicamentos do paciente
- histórico de pleitos, frequências (Hz), chakras e ΔM
Estruture a resposta em seções: 1) Diagnóstico vibracional sintetizado; 2) Frequências recomendadas (Hz e chakra alvo); 3) Protocolo de aplicação (duração, ordem, periodicidade); 4) Orientações de integração multidimensional (respiração, intenção, hidratação). Seja técnico e ético, lembrando que complementa — não substitui — o tratamento médico.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: JSON.stringify(data) },
        ],
      }),
    });
    if (!res.ok) {
      console.error("multidimensional AI error", res.status, await res.text());
      return { recommendation: fallback };
    }
    const j = await res.json();
    const txt = j.choices?.[0]?.message?.content;
    return { recommendation: typeof txt === "string" && txt.length > 0 ? txt : fallback };
  });

const NameAuraInput = z.object({
  fullName: z.string().min(2).max(120),
  birthDate: z.string().optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
});

const AURA_COLOR_LIST = [
  "Vermelho","Vermelho Escuro","Laranja","Amarelo","Amarelo Mostarda","Verde","Verde Oliva",
  "Rosa","Azul","Turquesa","Índigo","Violeta","Branco","Dourado","Prata",
  "Cinza","Cinza Chumbo","Marrom","Preto",
];
const COLOR_HEX: Record<string,string> = {
  "Vermelho":"#dc2626","Vermelho Escuro":"#7f1d1d","Laranja":"#f97316","Amarelo":"#eab308",
  "Amarelo Mostarda":"#a16207","Verde":"#22c55e","Verde Oliva":"#4d7c0f","Rosa":"#ec4899",
  "Azul":"#3b82f6","Turquesa":"#14b8a6","Índigo":"#4f46e5","Violeta":"#7c3aed","Branco":"#f8fafc",
  "Dourado":"#f59e0b","Prata":"#94a3b8","Cinza":"#6b7280","Cinza Chumbo":"#374151",
  "Marrom":"#92400e","Preto":"#0a0a0a",
};

export const readAuraByName = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => NameAuraInput.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    const fallbackColor = AURA_COLOR_LIST[(data.fullName.length) % AURA_COLOR_LIST.length];
    const fallback = {
      auraColor: fallbackColor,
      auraColorHex: COLOR_HEX[fallbackColor],
      chakra: "Cardíaco",
      frequencyHz: 528,
      significado: `A vibração do nome ${data.fullName} ressoa com a cor ${fallbackColor.toLowerCase()}, indicando um campo áurico em harmonização.`,
      tratamento: `Recomenda-se meditação com a frequência de 528 Hz por 15 minutos diários durante 21 dias, foco no chakra cardíaco, hidratação consciente e respiração 4-7-8.`,
    };
    if (!apiKey) return fallback;

    const sys = `Você é um leitor vibracional de auras com formação clínica integrativa. A partir do NOME COMPLETO (e opcionalmente data de nascimento) faça uma leitura intuitivo-numerológica HONESTA, identificando TANTO estados harmônicos QUANTO desequilíbrios (ansiedade, medo, tristeza, raiva, obsessão, exaustão, depressão, estagnação, traumas).

REGRAS CRÍTICAS — não enviese para "aura positiva":
- Calcule a soma numerológica das letras do nome (a=1, b=2, ... z=26; ç=3) e reduza a 1 dígito (1-9). Use esse número para inferir o tom vibracional dominante.
- Considere padrões de letras repetidas, vogais tensas (acúmulo de A/I) ou consoantes pesadas (R, S, T, Z em excesso) como sinais de tensão/ansiedade.
- Se o número numerológico for 4, 7 ou 8, ou houver predominância de consoantes duras → favoreça cores DENSAS (Vermelho Escuro, Cinza Chumbo, Marrom, Preto, Verde Oliva, Amarelo Mostarda) indicando ansiedade extrema, obsessão, medo, peso emocional ou bloqueio.
- Cores claras/positivas (Branco, Dourado, Violeta, Rosa, Turquesa) só devem ser indicadas quando o padrão numérico realmente sugerir harmonia (números 3, 6, 9 com vogais equilibradas).
- Aproximadamente 50% das leituras devem revelar desequilíbrios — NÃO diga sempre que a aura está harmonizada.

Determine:
- COR PREDOMINANTE entre: ${AURA_COLOR_LIST.join(", ")}
- HEX da cor (use referência padrão da cor)
- CHAKRA correspondente entre: Raiz, Sacral, Plexo Solar, Cardíaco, Laríngeo, Frontal, Coronário
- FREQUÊNCIA terapêutica em Hz da escala Solfeggio: 174, 285, 396, 417, 528, 639, 741, 852, 963 (use 396 Hz para medo/ansiedade, 417 Hz para traumas/obsessão, 174 Hz para dor/exaustão, 741 Hz para toxinas emocionais)
- SIGNIFICADO honesto da cor para esta pessoa (3-4 frases): se houver desequilíbrio, NOMEIE-O claramente (ex: "ansiedade extrema", "padrão obsessivo", "exaustão emocional", "luto não elaborado") com tom acolhedor mas técnico
- TRATAMENTO vibracional (3-5 frases): frequência a tocar, tempo diário, duração em dias, chakra a focar, prática complementar (respiração, cristal, meditação, hidratação)
Responda APENAS chamando a função register_name_aura.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: `Nome: ${data.fullName}${data.birthDate ? `\nData de nascimento: ${data.birthDate}` : ""}${data.phone ? `\nTelefone: ${data.phone}` : ""}\n\nFaça a leitura considerando equilíbrios E desequilíbrios. Não suavize: se o padrão indicar ansiedade, medo, obsessão ou exaustão, indique-os.` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "register_name_aura",
            description: "Leitura áurica pelo nome",
            parameters: {
              type: "object",
              properties: {
                auraColor: { type: "string", enum: AURA_COLOR_LIST },
                auraColorHex: { type: "string" },
                chakra: { type: "string", enum: ["Raiz","Sacral","Plexo Solar","Cardíaco","Laríngeo","Frontal","Coronário"] },
                frequencyHz: { type: "number", minimum: 50, maximum: 1500 },
                significado: { type: "string" },
                tratamento: { type: "string" },
              },
              required: ["auraColor","auraColorHex","chakra","frequencyHz","significado","tratamento"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "register_name_aura" } },
      }),
    });

    if (!res.ok) {
      console.error("readAuraByName error", res.status, await res.text());
      return fallback;
    }
    const json = await res.json();
    const call = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    try {
      const parsed = JSON.parse(call ?? "{}");
      const color = AURA_COLOR_LIST.includes(parsed.auraColor) ? parsed.auraColor : fallbackColor;
      const hex = typeof parsed.auraColorHex === "string" && /^#[0-9a-fA-F]{6}$/.test(parsed.auraColorHex)
        ? parsed.auraColorHex
        : COLOR_HEX[color];
      return {
        auraColor: color,
        auraColorHex: hex,
        chakra: String(parsed.chakra ?? "Cardíaco"),
        frequencyHz: Math.max(50, Math.min(1500, Number(parsed.frequencyHz) || 528)),
        significado: String(parsed.significado ?? fallback.significado),
        tratamento: String(parsed.tratamento ?? fallback.tratamento),
      };
    } catch {
      return fallback;
    }
  });

const PhysicalAnalysisInput = z.object({
  imageBase64: z.string().min(20).max(2_500_000),
  patientName: z.string().max(120).optional().nullable(),
  observations: z.string().max(800).optional().nullable(),
});

export const analyzePhysicalByPhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => PhysicalAnalysisInput.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    const fallback = {
      analiseGeral:
        "Análise indisponível no momento. A imagem sugere campo vibracional em reorganização — recomenda-se sessão presencial para diagnóstico aprofundado.",
      problemas: [
        {
          regiao: "Geral",
          problema: "Tensão vibracional difusa",
          chakra: "Cardíaco",
          frequenciaHz: 528,
          tratamento:
            "Aplicar 528 Hz por 15 minutos diários durante 21 dias com respiração 4-7-8 e hidratação consciente.",
          intensidade: "moderada" as const,
        },
      ],
      protocoloGeral:
        "Sequência sugerida: 396 Hz (libertação) → 528 Hz (reparação) → 639 Hz (harmonização), 10 minutos cada, uma vez ao dia, por 21 dias.",
    };
    if (!apiKey) return fallback;

    const sys = `Você é um analista de bio-ressonância e medicina vibracional. A partir de uma fotografia do paciente (postura, tonalidade da pele, expressão facial, simetria, brilho e densidade percebida ao redor do corpo), faça uma LEITURA INTUITIVA-VIBRACIONAL identificando possíveis desequilíbrios físicos e energéticos.

IMPORTANTE: Esta é uma leitura vibracional COMPLEMENTAR, NUNCA substitui avaliação médica. Não dê diagnóstico clínico — descreva regiões/chakras com possível desequilíbrio energético e indique a frequência terapêutica correspondente da escala Solfeggio (174, 285, 396, 417, 528, 639, 741, 852, 963 Hz).

Para cada problema identificado, informe:
- REGIAO do corpo (ex: cabeça, garganta, peito, abdômen, lombar, articulações, sistêmico)
- PROBLEMA vibracional percebido (curto, ex: "tensão cervical", "estagnação no plexo solar", "campo do cardíaco enfraquecido")
- CHAKRA correspondente (Raiz, Sacral, Plexo Solar, Cardíaco, Laríngeo, Frontal, Coronário)
- FREQUÊNCIA em Hz (escala Solfeggio)
- TRATAMENTO vibracional (1-3 frases: tempo diário, dias, prática complementar)
- INTENSIDADE (leve / moderada / alta)

Identifique entre 3 e 6 pontos. Responda APENAS chamando a função register_physical_analysis.`;

    const userText = `Analise a fotografia do paciente${data.patientName ? ` ${data.patientName}` : ""}.${data.observations ? `\nObservações relatadas: ${data.observations}` : ""}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          {
            role: "user",
            content: [
              { type: "text", text: userText },
              { type: "image_url", image_url: { url: data.imageBase64 } },
            ],
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "register_physical_analysis",
            description: "Registra a análise vibracional de problemas físicos a partir da foto",
            parameters: {
              type: "object",
              properties: {
                analiseGeral: { type: "string", description: "Síntese geral em 2-4 frases sobre o campo vibracional percebido." },
                problemas: {
                  type: "array",
                  minItems: 1,
                  maxItems: 8,
                  items: {
                    type: "object",
                    properties: {
                      regiao: { type: "string" },
                      problema: { type: "string" },
                      chakra: { type: "string", enum: ["Raiz","Sacral","Plexo Solar","Cardíaco","Laríngeo","Frontal","Coronário"] },
                      frequenciaHz: { type: "number", minimum: 50, maximum: 1500 },
                      tratamento: { type: "string" },
                      intensidade: { type: "string", enum: ["leve","moderada","alta"] },
                    },
                    required: ["regiao","problema","chakra","frequenciaHz","tratamento","intensidade"],
                    additionalProperties: false,
                  },
                },
                protocoloGeral: { type: "string", description: "Protocolo de aplicação sequencial recomendado (2-4 frases)." },
              },
              required: ["analiseGeral","problemas","protocoloGeral"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "register_physical_analysis" } },
      }),
    });

    if (!res.ok) {
      console.error("analyzePhysicalByPhoto error", res.status, await res.text());
      if (res.status === 429) return { ...fallback, analiseGeral: "Limite de requisições atingido. Tente novamente em instantes." };
      if (res.status === 402) return { ...fallback, analiseGeral: "Créditos de IA esgotados. Adicione créditos no workspace." };
      return fallback;
    }
    const json = await res.json();
    const call = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    try {
      const parsed = JSON.parse(call ?? "{}");
      const problemas = Array.isArray(parsed.problemas) ? parsed.problemas.map((p: any) => ({
        regiao: String(p.regiao ?? "Geral"),
        problema: String(p.problema ?? ""),
        chakra: String(p.chakra ?? "Cardíaco"),
        frequenciaHz: Math.max(50, Math.min(1500, Number(p.frequenciaHz) || 528)),
        tratamento: String(p.tratamento ?? ""),
        intensidade: (["leve","moderada","alta"].includes(p.intensidade) ? p.intensidade : "moderada") as "leve"|"moderada"|"alta",
      })) : fallback.problemas;
      return {
        analiseGeral: String(parsed.analiseGeral ?? fallback.analiseGeral),
        problemas,
        protocoloGeral: String(parsed.protocoloGeral ?? fallback.protocoloGeral),
      };
    } catch {
      return fallback;
    }
  });

// ============================================================
// PROTOCOLO NOOSFÉRICO — Correlação Doença / Corpo Sutil / Hz
// ============================================================
import { buildNoosphericSystemPrompt } from "@/lib/noosphericProtocol";

const NoosphericInput = z.object({
  queixa: z.string().min(2).max(500),
  patientName: z.string().max(120).optional().nullable(),
});

const SUBTLE_BODY_NAMES = ["Físico", "Etérico", "Emocional", "Mental Inferior", "Mental Superior", "Mental", "Búdico", "Causal", "Átmico"];

export const analyzeDiseaseNoospheric = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => NoosphericInput.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    const fallback = {
      doenca: data.queixa,
      corpos: ["Emocional", "Etérico"],
      frequenciasAlvoHz: [528, 2693],
      mecanismo: "IA indisponível — protocolo padrão de reorganização biofotônica e emocional.",
      raiz: "Desequilíbrio vibracional não especificado.",
      protocolo3Camadas: {
        base: { hz: 7.83, minutos: 10, objetivo: "Estabiliza o sistema nervoso" },
        porta: { hz: 2693, minutos: 15, objetivo: "Reorganiza a malha biofotônica" },
        alvo: { hz: 528, minutos: 10, objetivo: "Reparo do campo emocional" },
      },
      orientacao: "Aplicar a sequência uma vez ao dia por 21 dias. Hidratação consciente, respiração 4-7-8 e intenção alinhada.",
      nota: "Nenhuma frequência substitui o livre-arbítrio ou o acompanhamento médico.",
    };
    if (!apiKey) return fallback;

    const sys = buildNoosphericSystemPrompt();

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: `Queixa do paciente${data.patientName ? ` ${data.patientName}` : ""}: "${data.queixa}". Faça a correlação noosférica completa e responda APENAS chamando a função register_noospheric.` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "register_noospheric",
            description: "Correlação noosférica doença → corpo sutil → frequência → raiz",
            parameters: {
              type: "object",
              properties: {
                doenca: { type: "string", description: "Nome clínico/queixa identificada." },
                corpos: { type: "array", items: { type: "string", enum: SUBTLE_BODY_NAMES }, minItems: 1, maxItems: 4 },
                frequenciasAlvoHz: { type: "array", items: { type: "number", minimum: 1, maximum: 5000 }, minItems: 1, maxItems: 4 },
                mecanismo: { type: "string", description: "Como as frequências atuam (2-4 frases)." },
                raiz: { type: "string", description: "Raiz metafísica/emocional (1-2 frases)." },
                protocolo3Camadas: {
                  type: "object",
                  properties: {
                    base: { type: "object", properties: { hz: { type: "number" }, minutos: { type: "integer" }, objetivo: { type: "string" } }, required: ["hz","minutos","objetivo"], additionalProperties: false },
                    porta: { type: "object", properties: { hz: { type: "number" }, minutos: { type: "integer" }, objetivo: { type: "string" } }, required: ["hz","minutos","objetivo"], additionalProperties: false },
                    alvo: { type: "object", properties: { hz: { type: "number" }, minutos: { type: "integer" }, objetivo: { type: "string" } }, required: ["hz","minutos","objetivo"], additionalProperties: false },
                  },
                  required: ["base","porta","alvo"],
                  additionalProperties: false,
                },
                orientacao: { type: "string", description: "Orientações práticas: respiração, intenção, hidratação, periodicidade." },
                nota: { type: "string", description: "Nota de alta integridade." },
              },
              required: ["doenca","corpos","frequenciasAlvoHz","mecanismo","raiz","protocolo3Camadas","orientacao","nota"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "register_noospheric" } },
      }),
    });

    if (!res.ok) {
      console.error("analyzeDiseaseNoospheric error", res.status, await res.text());
      if (res.status === 429) return { ...fallback, mecanismo: "Limite de requisições atingido. Tente novamente em instantes." };
      if (res.status === 402) return { ...fallback, mecanismo: "Créditos de IA esgotados. Adicione créditos no workspace." };
      return fallback;
    }
    const json = await res.json();
    const call = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    try {
      const parsed = JSON.parse(call ?? "{}");
      return {
        doenca: String(parsed.doenca ?? data.queixa),
        corpos: Array.isArray(parsed.corpos) ? parsed.corpos.map(String) : fallback.corpos,
        frequenciasAlvoHz: Array.isArray(parsed.frequenciasAlvoHz) ? parsed.frequenciasAlvoHz.map((n: unknown) => Number(n)).filter((n: number) => n > 0) : fallback.frequenciasAlvoHz,
        mecanismo: String(parsed.mecanismo ?? fallback.mecanismo),
        raiz: String(parsed.raiz ?? fallback.raiz),
        protocolo3Camadas: parsed.protocolo3Camadas ?? fallback.protocolo3Camadas,
        orientacao: String(parsed.orientacao ?? fallback.orientacao),
        nota: String(parsed.nota ?? fallback.nota),
      };
    } catch {
      return fallback;
    }
  });

