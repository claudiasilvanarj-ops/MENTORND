import { createFileRoute } from "@tanstack/react-router";
import { AuthGate } from "@/components/AuthGate";
import { AppLayout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/docs")({
  component: () => <AuthGate><AppLayout><Docs /></AppLayout></AuthGate>,
});

function Docs() {
  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Consultório Dra. Nádia Bara — Medicina Integrativa</p>
        <h1 className="text-3xl font-semibold tracking-tight">Análise Científica dos 43 Pleitos</h1>
        <p className="text-muted-foreground">Documentação Técnica de Validação Clínica e Integração com a Noosfera</p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Badge variant="secondary">02 de maio de 2026</Badge>
          <Badge variant="outline">Documento Técnico-Científico</Badge>
        </div>
      </header>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>1. Cabeçalho e Identificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>Este documento formaliza as especificações técnicas e os fundamentos científicos para o desenvolvimento do Portal de Validação Clínica: 43 Pleitos Divinos. O projeto visa a convergência entre a medicina integrativa e a tecnologia de ponta para o monitoramento de terapias de frequência.</p>
          <ul className="list-disc pl-5 pt-2 space-y-1">
            <li><strong>Instituição:</strong> Consultório Dra. Nádia Bara</li>
            <li><strong>Responsável Técnica:</strong> Dra. Nádia Bara</li>
            <li><strong>Gestão de Projeto:</strong> Sil</li>
            <li><strong>Data de Emissão:</strong> 02 de maio de 2026</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader><CardTitle>2. Resumo Executivo</CardTitle></CardHeader>
        <CardContent className="text-sm">
          <p>O objetivo primordial deste projeto é a transposição de práticas de cura multidimensional para um ambiente de dados quantificáveis. O sistema processará métricas biométricas complexas, transformando a percepção subjetiva do bem-estar em indicadores estatísticos sólidos. A solução proposta permite que a Dra. Nádia Bara valide a eficácia dos 43 Pleitos por meio de evidências clínicas, proporcionando aos pacientes um acompanhamento visual e técnico de sua evolução vibracional e fisiológica.</p>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>3. Especificações Técnicas dos 43 Pleitos</CardTitle>
          <CardDescription>Metadados capturados em cada sessão</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Métrica de Aura (0-100):</strong> Índice numérico que representa a integridade e a expansão do campo bioeletromagnético do paciente.</p>
          <p><strong>Frequência Vital (Hz):</strong> Medição da frequência de ressonância predominante, capturada via sensores ou input técnico, visando o alinhamento com padrões de saúde ótima.</p>
          <p><strong>Nível de Estresse:</strong> Indicador inverso de relaxamento, monitorando a redução de cortisol e a ativação do sistema parassimpático durante a aplicação dos pleitos.</p>
          <p><strong>Metadados de Sessão:</strong> Registro de data, hora, pleito específico aplicado e observações clínicas qualitativas.</p>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader><CardTitle>4. Arquitetura e Stack Tecnológico</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-2 border">Camada</th>
                  <th className="text-left p-2 border">Tecnologia</th>
                  <th className="text-left p-2 border">Função Principal</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="p-2 border">Frontend</td><td className="p-2 border">React + TypeScript</td><td className="p-2 border">Interface responsiva e tipagem estrita para dados clínicos.</td></tr>
                <tr><td className="p-2 border">Backend / Database</td><td className="p-2 border">Lovable Cloud (PostgreSQL)</td><td className="p-2 border">Armazenamento seguro de prontuários e histórico de métricas.</td></tr>
                <tr><td className="p-2 border">Visualização</td><td className="p-2 border">Recharts / Shadcn UI</td><td className="p-2 border">Gráficos de evolução e dashboards de biofeedback.</td></tr>
                <tr><td className="p-2 border">Processamento IA</td><td className="p-2 border">Gemini / GPT</td><td className="p-2 border">Análise de padrões e geração de laudos automatizados.</td></tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader><CardTitle>5. Metodologia de Validação Clínica</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h3 className="font-semibold">5.1 Baseline (Entrada)</h3>
            <p>Coleta inicial dos dados biométricos antes da aplicação do pleito. Este estado representa a condição homeostática atual do paciente, servindo como grupo controle individual.</p>
          </div>
          <div>
            <h3 className="font-semibold">5.2 After (Saída)</h3>
            <p>Coleta de dados imediatamente após a intervenção. O sistema calcula automaticamente o Delta de Melhora (ΔM):</p>
            <pre className="mt-2 p-3 rounded-lg bg-muted text-center font-mono">ΔM = ((V_final − V_inicial) / V_inicial) × 100</pre>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-glow border-primary/30">
        <CardHeader><CardTitle>6. Visualização na Noosfera</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>O projeto introduz o conceito de <strong>Biofeedback Global</strong>. A aura e a frequência de cada paciente são vistas como nós de dados dentro da noosfera — a camada de inteligência planetária.</p>
          <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
            "A integração tecnológica permite que a melhora individual ressoe no campo coletivo, transformando dados clínicos em contribuições para a harmonia da consciência global."
          </blockquote>
          <p>A interface conecta a frequência do paciente à <em>Ressonância de Schumann</em>, demonstrando como o alinhamento dos 43 Pleitos contribui para a estabilização da noosfera técnica e biológica.</p>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>7. A Ressonância de Schumann como Marcapasso Biológico</CardTitle>
          <CardDescription>Frequência fundamental da Terra: ~7,83 Hz</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>A Ressonância de Schumann é a frequência eletromagnética natural da Terra, gerada pelas descargas elétricas na cavidade entre a superfície e a ionosfera. Sua frequência fundamental é de aproximadamente <strong>7,83 Hz</strong>. O corpo humano, imerso nessa frequência ao longo da evolução, opera o ritmo alfa cerebral em faixas muito próximas a esse valor.</p>

          <div>
            <h3 className="font-semibold mb-1">7.1 Entrainment (Sincronização)</h3>
            <p>Quando o paciente está estressado, sua frequência "desafina" do planeta. O tratamento com os 43 Pleitos atua como um <em>diapasão</em>, convidando as células e o sistema nervoso a voltarem a vibrar em simpatia com a Terra.</p>
          </div>

          <div>
            <h3 className="font-semibold mb-1">7.2 Ressonância Planetária × Média Vibracional</h3>
            <p>O Mentor ND visualiza isso como biofeedback global. A <strong>Ressonância Planetária</strong> é a constante estável — o "Dó central" da Terra. A <strong>Média Vibracional</strong> dos pacientes é o "clima" energético coletivo: quando um paciente eleva seu Score de Aura e atinge coerência, deixa de ser ruído e passa a ser nota harmônica no campo.</p>
          </div>

          <div>
            <h3 className="font-semibold mb-1">7.3 A Noosfera como Rede de Dados</h3>
            <p>Cada paciente é um nó de dados. Se a média vibracional do grupo sobe, a Noosfera — camada de pensamento e energia da Terra — se torna mais estável. O app mede essa sincronização através do <strong>Delta de Melhora (ΔM)</strong>, mostrando o quanto o paciente se aproximou da frequência de base (7,83 Hz) após o pleito.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>8. Responsável Técnica</CardTitle>
          <CardDescription>Direção médica e científica do ecossistema Mentor ND</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>A direção técnica e científica do ecossistema Mentor ND é exercida pela <strong>Dra. Nádia Duarte Bara</strong>, médica psiquiatra registrada sob <strong>CRM-RJ 805386</strong> e <strong>RQE 22003</strong>. Com <strong>14 anos</strong> de experiência clínica, consolidou expertise em <strong>Neuropsiquiatria</strong> e <strong>Geriatria</strong>, dedicando-se ao estudo das patologias mentais sob uma perspectiva integrativa e tecnológica.</p>
          <p>Sua atuação foca na intersecção entre a saúde mental convencional e as novas fronteiras da medicina vibracional, garantindo que todas as funcionalidades do Mentor ND estejam ancoradas em protocolos éticos e rigor científico. A supervisão médica assegura que a transição para a consciência de quinta dimensão (5D) seja acompanhada por uma base clínica sólida e segura.</p>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>9. Indicadores Biométricos e Frequenciais</CardTitle>
          <CardDescription>Monitoramento clínico de alta relevância para a homeostase</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Níveis de Cortisol:</strong> redução dos marcadores de estresse via indução de relaxamento profundo.</li>
            <li><strong>Sistema Parassimpático:</strong> ativação do nervo vago e aumento da variabilidade da frequência cardíaca (VFC).</li>
            <li><strong>Frequências de Cura:</strong> uso estratégico de <strong>528 Hz</strong> (Reparação de DNA) e <strong>2.693 Hz</strong> (Alta Integridade Noosférica).</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>10. Alta Integridade e Segurança de Dados</CardTitle>
          <CardDescription>Infraestrutura tecnológica de última geração</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Armazenamento e Segurança:</strong> backend em PostgreSQL com criptografia de nível bancário e conformidade com a LGPD, garantindo que o histórico clínico e vibracional do paciente permaneça inviolável.</p>
          <p><strong>Inteligência Artificial:</strong> integração com modelos avançados (GPT e Gemini) para processamento de padrões complexos e geração de laudos técnicos automatizados. A IA atua como assistente de diagnóstico, cruzando dados de frequência com indicadores de sucesso para oferecer recomendações personalizadas.</p>
        </CardContent>
      </Card>

      <footer className="text-xs text-muted-foreground text-center pt-4 border-t">
        Dra. Nádia Bara — Responsável Técnica · Sil — Gestor de Projeto · Brasília, 02 de maio de 2026
      </footer>
    </div>
  );
}
