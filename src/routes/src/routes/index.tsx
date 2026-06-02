import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Sparkles, Activity, Waves, Brain, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => { if (!loading && user) nav({ to: "/dashboard" }); }, [user, loading, nav]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card/40 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-aura-gradient grid place-items-center shadow-soft">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-semibold tracking-tight">Mentor ND</h1>
              <p className="text-xs text-muted-foreground">Transceptor Noosférico</p>
            </div>
          </Link>
          <Link to="/login"><Button variant="outline" size="sm">Entrar</Button></Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-6 py-20 md:py-28 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-8">
            <Waves className="h-3.5 w-3.5" /> Protocolo dos 43 Pleitos · Dra. Nádia Bara
          </div>

          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.1]">
            Medicina integrativa
            <br />
            <span className="bg-aura-gradient bg-clip-text text-transparent">
              orientada por bio-ressonância
            </span>
          </h2>

          <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Estime o Score de Aura, identifique o chakra alvo e acompanhe o Delta de Melhora (ΔM)
            em sessões clínicas conectadas à Ressonância de Schumann.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/login">
              <Button size="lg" className="bg-aura-gradient shadow-soft gap-2">
                Começar agora <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="container mx-auto px-6 pb-24 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Brain, t: "Análise de Imagem + IA", d: "Heurísticas visuais estimam densidade áurica e chakra alvo a partir de uma foto." },
              { icon: Activity, t: "Δ de Melhora", d: "Compara baseline e after; calcula ΔM = ((Vf − Vi) / Vi) × 100." },
              { icon: Waves, t: "Ressonância de Schumann", d: "Visualize a sincronização vibracional do paciente sessão a sessão." },
            ].map(({ icon: I, t, d }) => (
              <div key={t} className="p-6 rounded-2xl bg-card border shadow-soft flex flex-col gap-3">
                <div className="h-10 w-10 rounded-xl bg-soft-gradient grid place-items-center">
                  <I className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t bg-card/40">
        <div className="container mx-auto px-6 py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Consultório Dra. Nádia Bara · Medicina Integrativa
        </div>
      </footer>
    </div>
  );
}
