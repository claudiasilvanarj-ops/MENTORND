import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppLayout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Activity, History, Waves } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/dashboard")({
  component: () => <AuthGate><AppLayout><Dashboard /></AppLayout></AuthGate>,
});

function Dashboard() {
  const [stats, setStats] = useState({ patients: 0, sessions: 0, avgDelta: 0 });
  const [series, setSeries] = useState<Array<{ t: string; schumann: number; paciente: number }>>([]);

  useEffect(() => {
    (async () => {
      const [{ count: pc }, { data: ss }] = await Promise.all([
        supabase.from("patients").select("*", { count: "exact", head: true }),
        supabase.from("sessions")
          .select("created_at, aura_before, aura_after, delta_m, frequencia_hz")
          .order("created_at", { ascending: false })
          .limit(30),
      ]);
      const rows = (ss ?? []).slice().reverse();
      const deltas = rows.map(s => Number(s.delta_m) || 0);
      const avg = deltas.length ? deltas.reduce((a,b)=>a+b,0)/deltas.length : 0;
      setStats({ patients: pc ?? 0, sessions: rows.length, avgDelta: avg });

      // Mapeia aura média (0-100) e ΔM para faixa próxima a 7,83 Hz (Schumann).
      const mapped = rows.map((s) => {
        const aura = ((Number(s.aura_before) || 0) + (Number(s.aura_after) || 0)) / 2;
        const dm = Number(s.delta_m) || 0;
        const paciente = 7.83 + ((aura - 50) / 10) * 0.15 + (dm / 100) * 0.3;
        return {
          t: new Date(s.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
          schumann: 7.83,
          paciente: Number(paciente.toFixed(3)),
        };
      });
      setSeries(mapped);
    })();
  }, []);

  const sync = series.length
    ? Math.max(0, 100 - (series.reduce((a, p) => a + Math.abs(p.paciente - 7.83), 0) / series.length) * 100)
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Painel Vibracional</h1>
        <p className="text-muted-foreground">Visão geral do consultório.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Pacientes" value={stats.patients} />
        <StatCard icon={Activity} label="Sessões registradas" value={stats.sessions} />
        <StatCard icon={History} label="ΔM médio" value={`${stats.avgDelta.toFixed(1)}%`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Waves className="h-5 w-5 text-primary" /> Sincronização com Schumann (7,83 Hz)</CardTitle>
            <CardDescription>
              Ressonância base planetária × frequência vibracional média por sessão · Sincronia atual: <strong>{sync.toFixed(1)}%</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {series.length === 0 ? (
              <div className="h-full grid place-items-center text-sm text-muted-foreground text-center px-4">
                Sem sessões registradas ainda — registre uma sessão para visualizar a sincronia vibracional com a ressonância de Schumann.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 295)" />
                  <XAxis dataKey="t" tick={{ fontSize: 11 }} />
                  <YAxis domain={[6.5, 9.5]} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                  <Line type="monotone" dataKey="schumann" name="Schumann (7,83 Hz)" stroke="oklch(0.7 0.14 165)" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="paciente" name="Paciente" stroke="oklch(0.55 0.2 295)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader><CardTitle>Iniciar uma sessão</CardTitle><CardDescription>Aplique um pleito e registre baseline / after.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <Link to="/patients"><Button className="w-full bg-aura-gradient">Selecionar paciente</Button></Link>
            <Link to="/history"><Button variant="outline" className="w-full">Ver histórico clínico</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <Card className="shadow-soft">
      <CardContent className="pt-6 flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-soft-gradient grid place-items-center"><Icon className="h-6 w-6 text-primary" /></div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
