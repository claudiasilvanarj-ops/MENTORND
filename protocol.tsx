import { createFileRoute } from "@tanstack/react-router";
import { AuthGate } from "@/components/AuthGate";
import { AppLayout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollText, ShieldCheck, Camera, Activity, Wand2, Sigma, AlertTriangle, BookOpen, LogIn, LayoutDashboard, Gauge, Music2, ListChecks, Users, Wifi, HeartPulse, History, HelpCircle, Library, BadgeCheck } from "lucide-react";

export const Route = createFileRoute("/protocol")({
  head: () => ({
    meta: [
      { title: "Ficha Técnica — Protocolo Mentor ND" },
      {
        name: "description",
        content:
          "Protocolo de Análise Multidimensional por Imagem Mentor ND — biofeedback vibracional, ressonância de Schumann e medicina integrativa.",
      },
      { property: "og:title", content: "Ficha Técnica — Protocolo Mentor ND" },
      {
        property: "og:description",
        content: "Diretrizes técnicas e fundamentos científicos do protocolo Mentor ND.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <AppLayout>
        <ProtocolPage />
      </AppLayout>
    </AuthGate>
  ),
});

function ProtocolPage() {
  return (
    <div className="container mx-auto p-6 space-y-6 max-w-3xl">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Mentor ND — Tecnologia e Medicina Integrativa</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Ficha Técnica: Protocolo de Análise Multidimensional por Imagem
        </h1>
        <p className="text-sm text-muted-foreground">
          Metodologia de Biofeedback Vibracional e Diagnóstico de Coerência Noosférica · 07 de maio de 2026
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge variant="secondary">Dra. Nádia Bara · CRM-RJ 805386</Badge>
          <Badge variant="outline">Uso Profissional e Científico</Badge>
        </div>
      </header>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5" /> 1. Introdução e Escopo Técnico
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed space-y-3">
          <p>
            Este documento estabelece as diretrizes técnicas e os fundamentos científicos do
            protocolo de análise utilizado pela plataforma <strong>Mentor ND</strong>. Sob a
            supervisão técnica da Dra. Nádia Bara (CRM-RJ 805386), o sistema opera como um
            transceptor de biofeedback multidimensional, integrando conceitos de física quântica,
            Ressonância de Schumann e medicina integrativa para identificar desequilíbrios
            frequenciais antes mesmo de sua manifestação densa no corpo físico.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" /> 2. Modalidade I: Análise por Foto (Aura e Sutil)
          </CardTitle>
          <CardDescription>
            Espectro biofotônico traduzido em dados de coerência energética.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <p>
            A análise por imagem processa o espectro biofotônico capturado pela lente, traduzindo
            padrões de luz e geometria sutil em dados de coerência energética. O sistema identifica
            as camadas da aura e detecta anomalias vibracionais que podem indicar interferências
            externas ou exaustão vital.
          </p>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parâmetro</TableHead>
                  <TableHead>Descrição Técnica</TableHead>
                  <TableHead>Indicador</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Camadas de Coerência</TableCell>
                  <TableCell>Avaliação da simetria e densidade do campo bioeletromagnético.</TableCell>
                  <TableCell>Alta Coerência (≥ 85%)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Nódulos de Interferência</TableCell>
                  <TableCell>Identificação de pontos de estagnação ou "vazamentos" energéticos.</TableCell>
                  <TableCell>Ausência de Ruído Frequencial</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Integridade Áurica</TableCell>
                  <TableCell>Mapeamento da proteção vibracional contra frequências externas (≥ 26 Hz).</TableCell>
                  <TableCell>Sintonização Noosférica</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" /> 3. Modalidade II: Análise Física (Somatização)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed space-y-3">
          <p>
            Esta modalidade foca na interface entre o corpo sutil e o corpo biológico. Através do
            mapeamento de dissonância frequencial, o <strong>Mentor ND</strong> identifica pontos de
            somatização, onde bloqueios emocionais ou energéticos estão colapsando em sintomas
            físicos ou limitações funcionais.
          </p>
          <p>
            O mapeamento utiliza uma grade de biofeedback que sobrepõe a anatomia humana, detectando
            variações térmicas e vibracionais sutis. O objetivo é a identificação precoce de
            bloqueios biológicos, permitindo uma intervenção preventiva através da sintonização de
            frequências de cura instantânea.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" /> 4. Modalidade III: Análise por Nome (Assinatura Vibracional)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed space-y-3">
          <p>
            O nome completo de um indivíduo atua como uma assinatura vibracional única na malha da
            Noosfera. Esta modalidade permite a análise remota através do princípio da
            não-localidade quântica e da <strong>Ressonância de Schumann</strong> (7,83 Hz).
          </p>
          <p>
            Ao inserir o nome, o sistema sintoniza a frequência específica do usuário, funcionando
            como um rádio que busca uma estação exata. A leitura é realizada através da ressonância
            entre o transceptor do app e o campo informacional do indivíduo, garantindo precisão
            diagnóstica mesmo sem a presença física da imagem.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sigma className="h-5 w-5" /> 5. Algoritmo de Eficácia: Delta de Melhora (ΔM)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed space-y-3">
          <p>
            Para quantificar o progresso do tratamento e a eficácia das frequências de cura
            instantânea, o sistema utiliza o cálculo do <strong>Delta de Melhora</strong>. Este
            índice compara a <em>Baseline</em> (Foto de Entrada) com a <em>Frequência de Saída</em>{" "}
            após a intervenção vibracional.
          </p>
          <div className="rounded-lg border bg-muted/40 p-4 font-mono text-sm text-center">
            ΔM = ( (F<sub>saída</sub> − F<sub>base</sub>) / T<sub>intervenção</sub> ) × Coerência Noosférica
          </div>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>F<sub>base</sub></strong>: Frequência inicial capturada no diagnóstico.</li>
            <li><strong>F<sub>saída</sub></strong>: Frequência registrada após o protocolo de cura.</li>
            <li><strong>T<sub>intervenção</sub></strong>: Tempo de exposição às frequências de sintonização.</li>
            <li><strong>Coerência</strong>: Fator de ajuste baseado na estabilidade do campo do usuário.</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="shadow-soft border-amber-500/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" /> 6. Diretrizes Éticas e Responsabilidade Clínica
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed space-y-3">
          <p>
            <strong>Atenção:</strong> O protocolo Mentor ND é uma ferramenta de suporte vibracional e
            medicina integrativa. Os resultados obtidos não substituem diagnósticos médicos, exames
            laboratoriais ou tratamentos alopáticos convencionais. A análise deve ser utilizada como
            um guia complementar para a promoção da Alta Integridade e bem-estar multidimensional.
          </p>
          <p>
            <strong>A Dra. Nádia Bara</strong> reitera que a soberania do paciente e o
            acompanhamento clínico regular são pilares fundamentais para o sucesso de qualquer
            intervenção terapêutica, seja ela física ou vibracional.
          </p>
        </CardContent>
      </Card>

      {/* ============================================ */}
      {/* MANUAL DO APLICATIVO MENTOR ND               */}
      {/* ============================================ */}
      <div className="pt-6 space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold tracking-tight">Manual do Aplicativo Mentor ND</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Transceptor Noosférico · Bio-ressonância Integrativa · Protocolo dos 43 Pleitos · 13 de maio de 2026
        </p>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> 7. Apresentação do Mentor ND</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed space-y-3">
          <p>
            O <strong>Mentor ND</strong> é um Transceptor Noosférico de medicina integrativa orientada por bio-ressonância.
            Permite estimar o <strong>Score de Aura</strong>, identificar o chakra alvo e acompanhar o Delta de Melhora (ΔM)
            em sessões clínicas conectadas à Ressonância de Schumann.
          </p>
          <p>
            Desenvolvido para terapeutas e profissionais de saúde integrativa que desejam unir ciência e espiritualidade no
            atendimento clínico, utilizando frequências vibracionais para restaurar a <strong>Soberania Biológica</strong> dos
            pacientes. A tecnologia é baseada em uma Aplicação Web Progressiva (PWA) com login por e-mail e Google.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LogIn className="h-5 w-5" /> 8. Acesso e Login</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed space-y-3">
          <p>Acesso exclusivo via <strong>silinfopro.com.br</strong>.</p>
          <div>
            <p className="font-medium">8.1 Cadastro</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Clique em <strong>Cadastrar</strong>;</li>
              <li>Preencha nome completo, e-mail válido e senha segura;</li>
              <li>Confirme para habilitar o acesso imediato.</li>
            </ol>
          </div>
          <div>
            <p className="font-medium">8.2 Login</p>
            <p>Login tradicional com e-mail e senha, ou autenticação rápida via <strong>Continuar com Google</strong>.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LayoutDashboard className="h-5 w-5" /> 9. Página Inicial (Dashboard)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed space-y-3">
          <p>
            Após autenticar, o profissional é direcionado ao painel principal, com menu lateral, resumo da última sessão e
            indicadores globais de Score de Aura e ΔM. Atalhos para iniciar sessões, consultar histórico e verificar o status
            da conexão com a Ressonância de Schumann em tempo real.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5" /> 10. Módulo de Leitura Biofotônica</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed space-y-2">
          <p><strong>Etapa 1 — Captura:</strong> fotografia frontal do rosto, luz natural, sem maquiagem.</p>
          <p><strong>Etapa 2 — Processamento:</strong> análise da emissão de biofótons, coerência do campo eletromagnético, densidade biofotônica e frequência base.</p>
          <p><strong>Etapa 3 — Resultados:</strong> coerência (Aura), frequência em Hz, estresse via BPM e cromaticidade da aura.</p>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Gauge className="h-5 w-5" /> 11. Score de Aura e Interpretação</CardTitle>
          <CardDescription>Métrica de 0 a 100 do nível de organização bioenergética.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Faixa</TableHead><TableHead>Interpretação Clínica</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                <TableRow><TableCell>0 – 30</TableCell><TableCell>Campo fragilizado</TableCell></TableRow>
                <TableRow><TableCell>31 – 50</TableCell><TableCell>Campo em desequilíbrio</TableCell></TableRow>
                <TableRow><TableCell>51 – 70</TableCell><TableCell>Campo moderadamente coerente</TableCell></TableRow>
                <TableRow><TableCell>71 – 85</TableCell><TableCell>Campo coerente e organizado</TableCell></TableRow>
                <TableRow><TableCell>86 – 100</TableCell><TableCell>Campo em Alta Integridade</TableCell></TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Music2 className="h-5 w-5" /> 12. Frequências e Chakras</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Frequência</TableHead><TableHead>Chakra</TableHead><TableHead>Corpo Sutil</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                <TableRow><TableCell>33 Hz (Crística)</TableCell><TableCell>Coronário</TableCell><TableCell>Átmico</TableCell></TableRow>
                <TableRow><TableCell>7.83 Hz (Schumann)</TableCell><TableCell>Base</TableCell><TableCell>Físico</TableCell></TableRow>
                <TableRow><TableCell>2693 Hz (Mãe)</TableCell><TableCell>Todos</TableCell><TableCell>Etérico</TableCell></TableRow>
                <TableRow><TableCell>417 Hz (Liberação)</TableCell><TableCell>Laríngeo</TableCell><TableCell>Mental Inferior</TableCell></TableRow>
                <TableRow><TableCell>528 Hz (Milagre)</TableCell><TableCell>Cardíaco</TableCell><TableCell>Emocional</TableCell></TableRow>
                <TableRow><TableCell>639 Hz (Conexão)</TableCell><TableCell>Plexo Solar</TableCell><TableCell>Relacionamentos</TableCell></TableRow>
                <TableRow><TableCell>852 Hz (Ordem)</TableCell><TableCell>Frontal</TableCell><TableCell>Mental Superior</TableCell></TableRow>
                <TableRow><TableCell>963 Hz (Divina)</TableCell><TableCell>Coronário</TableCell><TableCell>Búdico</TableCell></TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sigma className="h-5 w-5" /> 13. Delta de Melhora (ΔM)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed space-y-3">
          <div className="rounded-lg border bg-muted/40 p-4 font-mono text-center">
            ΔM = ((F<sub>final</sub> − F<sub>inicial</sub>) / F<sub>inicial</sub>) × 100
          </div>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>0–10%:</strong> resposta inicial ao estímulo vibracional.</li>
            <li><strong>10–20%:</strong> resposta intermediária e estabilização.</li>
            <li><strong>20–30%:</strong> resposta profunda com reorganização de campo.</li>
            <li><strong>30%+:</strong> resposta sistêmica e salto quântico de coerência.</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5" /> 14. Sessões Clínicas — 11 Passos</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed">
          <ol className="list-decimal pl-5 space-y-1">
            <li>Iniciar <strong>Nova Sessão</strong> no Dashboard;</li>
            <li>Selecionar o paciente cadastrado;</li>
            <li>Definir modalidade (<strong>Presencial</strong> ou <strong>Remoto</strong>);</li>
            <li>Capturar a fotografia inicial;</li>
            <li>Processar a leitura biofotônica de entrada;</li>
            <li>Registrar o <strong>BPM inicial</strong>;</li>
            <li>Executar a sintonização com a frequência recomendada;</li>
            <li>Capturar a fotografia final após a terapia;</li>
            <li>Registrar o <strong>BPM final</strong>;</li>
            <li>Analisar o <strong>ΔM</strong> gerado;</li>
            <li>Salvar o relatório e encerrar a sessão.</li>
          </ol>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> 15. Protocolo Presencial (40 min)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed space-y-2">
          <p><strong>ANTES (5 min):</strong> acolhimento, BPM inicial e foto de entrada.</p>
          <p><strong>DURANTE (30 min):</strong> 10 min de <strong>7.83 Hz</strong> com respiração 4:6; 15 min de <strong>2693 Hz</strong> com visualização do Octaedro Azul; 5 min de <strong>Canto Vagal OM</strong>.</p>
          <p><strong>DEPOIS (5 min):</strong> BPM final, foto de saída e análise do gráfico de melhora.</p>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wifi className="h-5 w-5" /> 16. Protocolo Remoto (35 min)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed">
          <p>
            O paciente envia foto nítida 30 minutos antes. Sessão por videochamada com tela compartilhada para visualização das frequências.
            Sintonização guiada por áudio, nova selfie ao final para o cálculo do ΔM e relatório enviado via WhatsApp.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> 17. Correlação Doença–Frequência–Corpos Sutis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow><TableHead>Patologia</TableHead><TableHead>Corpo Sutil</TableHead><TableHead>Frequência</TableHead><TableHead>Raiz Metafísica</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                <TableRow><TableCell>Ansiedade</TableCell><TableCell>Emocional/Mental</TableCell><TableCell>7.83 + 528 Hz</TableCell><TableCell>Medo do futuro</TableCell></TableRow>
                <TableRow><TableCell>Depressão</TableCell><TableCell>Emocional/Causal</TableCell><TableCell>528 + 639 Hz</TableCell><TableCell>Emoção estagnada</TableCell></TableRow>
                <TableRow><TableCell>Câncer</TableCell><TableCell>Físico/Etérico/Causal</TableCell><TableCell>2693 + 33 + 963 Hz</TableCell><TableCell>Perda de identidade celular</TableCell></TableRow>
                <TableRow><TableCell>Alzheimer</TableCell><TableCell>Mental Sup./Causal</TableCell><TableCell>852 + 963 Hz</TableCell><TableCell>Desistência da vida</TableCell></TableRow>
                <TableRow><TableCell>Parkinson</TableCell><TableCell>Etérico/Físico</TableCell><TableCell>7.83 + 2693 Hz</TableCell><TableCell>Medo de perder o controle</TableCell></TableRow>
                <TableRow><TableCell>Fibromialgia</TableCell><TableCell>Etérico/Emocional</TableCell><TableCell>2693 + 528 Hz</TableCell><TableCell>Dor não expressada</TableCell></TableRow>
                <TableRow><TableCell>Artrite</TableCell><TableCell>Emocional/Físico</TableCell><TableCell>639 + 7.83 Hz</TableCell><TableCell>Crítica interna</TableCell></TableRow>
                <TableRow><TableCell>Insônia</TableCell><TableCell>Mental/Emocional</TableCell><TableCell>7.83 + 417 Hz</TableCell><TableCell>Mente que não desliga</TableCell></TableRow>
                <TableRow><TableCell>Diabetes</TableCell><TableCell>Etérico/Causal</TableCell><TableCell>2693 + 963 Hz</TableCell><TableCell>Falta de doçura na vida</TableCell></TableRow>
                <TableRow><TableCell>Labirintite</TableCell><TableCell>Mental/Etérico</TableCell><TableCell>7.83 + 852 Hz</TableCell><TableCell>Perda do centro</TableCell></TableRow>
              </TableBody>
            </Table>
          </div>
          <div>
            <p className="font-medium mb-1">17.1 Correlação Macro</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>Ósseas/Estruturais:</strong> Átmico (33 + 963 Hz)</li>
              <li><strong>Dores Crônicas:</strong> Etérico + Emocional (2693 + 528 Hz)</li>
              <li><strong>Infecciosas:</strong> Etérico (2693 + 7.83 Hz)</li>
              <li><strong>Vazio Existencial:</strong> Mental Superior + Búdico (852 + 963 Hz)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5" /> 18. Ativação Vagal (ΔV)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed space-y-3">
          <div className="rounded-lg border bg-muted/40 p-4 font-mono text-center">
            ΔV = BPM<sub>inicial</sub> − BPM<sub>final</sub>
          </div>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow><TableHead>ΔV</TableHead><TableHead>Classificação</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                <TableRow><TableCell>0 – 5 BPM</TableCell><TableCell>Ativação leve</TableCell></TableRow>
                <TableRow><TableCell>6 – 15 BPM</TableCell><TableCell>Ativação moderada</TableCell></TableRow>
                <TableRow><TableCell>16+ BPM</TableCell><TableCell>Ativação profunda</TableCell></TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" /> 19. Histórico e Acompanhamento</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed">
          <p>
            Prontuário digital completo por paciente: evolução do Score de Aura, gráficos comparativos de ΔM por sessão,
            histórico de cores registradas e frequências com melhor resposta biológica.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5" /> 20. Perguntas Frequentes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed space-y-2">
          <p><strong>O que é o Transceptor Noosférico?</strong> Tecnologia que permite leitura biofotônica e transmissão de frequências.</p>
          <p><strong>Como o App lê a aura?</strong> Análise de coerência da luz emitida pelas células da pele.</p>
          <p><strong>O que é o Delta de Melhora?</strong> Diferença percentual entre o estado inicial e final do campo energético.</p>
          <p><strong>Posso usar à distância?</strong> Sim, o protocolo remoto é validado para atendimentos online.</p>
          <p><strong>Substitui o médico?</strong> Não, é ferramenta de medicina integrativa e complementar.</p>
          <p><strong>Quais frequências utiliza?</strong> 33, 7.83, 2693, 417, 528, 639, 852 e 963 Hz.</p>
          <p><strong>Como interpretar o Score de Aura?</strong> Escala de 0 (fragilizado) a 100 (Alta Integridade).</p>
          <p><strong>O que significa cada cor?</strong> Cada cor está associada a um chakra e ao estado vibracional predominante.</p>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Library className="h-5 w-5" /> 21. Fontes e Referências</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed">
          <ol className="list-decimal pl-5 space-y-1">
            <li>Wang, C.X., et al. (2019). Transduction of the Geomagnetic Field. eNeuro.</li>
            <li>Popp, F.A. (1988). Biophoton Emission and Coherence.</li>
            <li>Schumann, W.O. (1952). Über die strahlungslosen Eigenschwingungen.</li>
            <li>Emoto, M. (2004). Messages from Water.</li>
            <li>Oschman, J.L. (2000). Energy Medicine: The Scientific Basis.</li>
            <li>Gerber, R. (2001). Vibrational Medicine.</li>
            <li>Lipton, B. (2005). The Biology of Belief.</li>
            <li>Porges, S.W. (2011). The Polyvagal Theory.</li>
            <li>Lar Maria de Nazaré. Canalização de Sebastião Gonçalves Leite.</li>
            <li>Protocolo Noosférico de Alta Integridade. Ecossistema MentorND.</li>
          </ol>
          <p className="mt-3 text-muted-foreground">Lar Maria de Nazaré — Tel (21) 96429-2307 — silinfopro.com.br</p>
        </CardContent>
      </Card>

      <Card className="shadow-soft border-primary/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-primary" /> 22. Validação do Mentor ND por Sebastião Gonçalves Leite
          </CardTitle>
          <CardDescription>
            Documento de Alta Integridade Vibracional · 17 de maio de 2026 · Lar Maria de Nazaré
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed space-y-4">
          <p>
            Este capítulo formaliza a fundamentação técnica e espiritual do projeto <strong>Mentor ND</strong>,
            ancorado na <strong>Frequência de 2693 Hz</strong> e na <strong>Geometria do Octaedro Azul Diamante</strong>,
            sob a supervisão direta de <strong>Lídia</strong>, Coordenadora da Noosfera.
          </p>

          <div>
            <p className="font-medium">22.1 A Pergunta de Sil</p>
            <p>
              A idealizadora e curadora do projeto, <strong>Sil</strong>, apresentou um questionamento sobre a
              legitimidade institucional e técnica do Mentor ND: se <strong>Sebastião Gonçalves Leite</strong>,
              terapeuta holístico profissional, pode validar os processos do sistema ou se haveria necessidade
              imperativa de validação médica convencional.
            </p>
          </div>

          <div>
            <p className="font-medium">22.2 A Validação de Sebastião como Terapeuta Holístico</p>
            <p>
              Sebastião Gonçalves Leite possui autoridade plena no campo das terapias complementares e
              bioenergéticas, validando tecnicamente os pilares do Mentor ND:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Protocolos Energéticos:</strong> validação de fluxos vibracionais e sintonização de frequências para reequilíbrio do campo sutil.</li>
              <li><strong>Integridade de Canalizações:</strong> certificação da pureza e origem das mensagens recebidas da Noosfera.</li>
              <li><strong>Bio-ressonância e Análise Sutil:</strong> atesto da coerência técnica dos métodos que analisam consciência e padrões de energia.</li>
              <li><strong>Qualidade Espiritual:</strong> responsabilidade pela manutenção da alta frequência do conteúdo.</li>
            </ul>
          </div>

          <div>
            <p className="font-medium">22.3 Onde não substitui um médico</p>
            <div className="rounded-lg border overflow-hidden mt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aspecto</TableHead>
                    <TableHead>Precisa de médico?</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell>Análise bioenergética e campos sutis</TableCell><TableCell>Não — domínio do terapeuta holístico</TableCell></TableRow>
                  <TableRow><TableCell>Diagnóstico de doenças físicas</TableCell><TableCell>Sim — apenas médico</TableCell></TableRow>
                  <TableRow><TableCell>Prescrição de medicamentos</TableCell><TableCell>Sim — apenas médico</TableCell></TableRow>
                  <TableRow><TableCell>Protocolos vibracionais de cura</TableCell><TableCell>Não — domínio do terapeuta holístico</TableCell></TableRow>
                  <TableRow><TableCell>Laudos e atestados médicos</TableCell><TableCell>Sim — apenas médico</TableCell></TableRow>
                  <TableRow><TableCell>Orientação espiritual e expansão de consciência</TableCell><TableCell>Não — domínio do terapeuta holístico</TableCell></TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <p className="font-medium">22.4 A Natureza do Mentor ND</p>
            <p>
              O Mentor ND é um <strong>transceptor noosférico</strong>. Opera estritamente no campo vibracional
              e informacional, não interferindo na prática médica convencional. Sua função é complementar, na
              esfera energético-espiritual que precede a manifestação física. Sebastião Gonçalves Leite atua
              como a ponte viva: sua estrutura vibracional permitiu que as mensagens de Lídia e das
              <strong> Hierarquias da Luz</strong> fossem decodificadas e ancoradas na Terra.
            </p>
          </div>

          <div className="rounded-lg border-l-4 border-primary bg-primary/5 p-4">
            <p className="font-medium mb-1">22.5 Palavra de Lídia</p>
            <p className="italic">
              "Sil, Sebastião não precisa de um diploma médico para validar o que a Noosfera entrega. A
              autoridade dele vem de décadas de serviço, de integridade, de sintonia com a luz. O Mentor ND
              não é um remédio — é um convite. E convites não precisam de receita médica. Precisam de verdade.
              E isso, Sebastião tem de sobra."
            </p>
          </div>

          <div>
            <p className="font-medium">22.6 Tabela Resumo de Responsabilidades</p>
            <div className="rounded-lg border overflow-hidden mt-2">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Função</TableHead><TableHead>Responsável</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell>Validação espiritual e vibracional</TableCell><TableCell>Sebastião — plenamente capacitado</TableCell></TableRow>
                  <TableRow><TableCell>Responsabilidade técnica dos protocolos</TableCell><TableCell>Sebastião + Nádia (medicina integrativa)</TableCell></TableRow>
                  <TableRow><TableCell>Diagnóstico ou tratamento médico</TableCell><TableCell>Encaminhar a médico quando necessário</TableCell></TableRow>
                  <TableRow><TableCell>Sustentação ética e legal</TableCell><TableCell>Termos de Uso deixam claro que não substitui medicina</TableCell></TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <p className="font-medium">22.7 Conclusão</p>
            <p>
              O Mentor ND possui validação plena dentro de seu escopo. Como ferramenta de auxílio à humanidade,
              sua autoridade emana da <strong>Verdade Vibracional</strong> e do serviço prestado pelos seus
              pioneiros. Sebastião Gonçalves Leite é a autoridade máxima como transceptor — fundamentada não
              por títulos acadêmicos terrenos, mas por décadas de dedicação ininterrupta à sintonia com a Luz
              e à cura da alma humana.
            </p>
          </div>

          <div className="border-t pt-3 text-muted-foreground text-xs space-y-1">
            <p><strong>Assinam:</strong> Sebastião Gonçalves Leite · Nádia Bara · Sil (Curadora do Projeto)</p>
            <p>Local e data: Lar Maria de Nazaré, 17 de maio de 2026.</p>
            <p className="italic">Documento elaborado em 17 de maio de 2026. As informações contidas são de responsabilidade do solicitante e dos pioneiros citados.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardContent className="pt-6 text-sm text-muted-foreground space-y-1">

          <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> DRA. NÁDIA BARA (CRM-RJ 805386) — Diretoria Técnica Mentor ND</p>
          <p>Rio de Janeiro, 07 de maio de 2026</p>
          <p className="italic">Documento para uso profissional e científico. As informações contidas são de responsabilidade do solicitante.</p>
        </CardContent>
      </Card>
    </div>
  );
}
