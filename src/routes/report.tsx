import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppLayout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";

export const Route = createFileRoute("/report")({
  component: () => <AuthGate><AppLayout><ReportPage /></AppLayout></AuthGate>,
});

type Row = {
  id: string; created_at: string; paciente_id: string;
  aura_before: number | null; aura_after: number | null;
  delta_m: number | null; frequencia_hz: number | null; chakra_alvo: string | null;
  patients: { name: string } | null;
  pleitos: { numero: number; nome: string } | null;
};

const COLORS = ["hsl(var(--primary))", "#a78bfa", "#f472b6", "#34d399", "#fbbf24", "#60a5fa", "#f87171", "#22d3ee"];

function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function ReportPage() {
  const [start, setStart] = useState(todayISO(-30));
  const [end, setEnd] = useState(todayISO(0));
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async (s = start, e = end) => {
    setLoading(true);
    // Use local-day boundaries to avoid TZ exclusion of edge dates
    const startDate = new Date(s + "T00:00:00");
    const endDate = new Date(e + "T00:00:00");
    endDate.setDate(endDate.getDate() + 1); // exclusive upper bound = next day 00:00
    const { data, error } = await supabase
      .from("sessions")
      .select("*, patients(name), pleitos(numero,nome)")
      .gte("created_at", startDate.toISOString())
      .lt("created_at", endDate.toISOString())
      .order("created_at", { ascending: true });
    if (error) console.error("[report] load error", error);
    setRows((data ?? []) as unknown as Row[]);
    setLoading(false);
  };

  useEffect(() => { load(start, end); /* eslint-disable-next-line */ }, [start, end]);

  const stats = useMemo(() => {
    const total = rows.length;
    const pacientes = new Set(rows.map(r => r.paciente_id)).size;
    const avgDelta = total ? rows.reduce((s, r) => s + Number(r.delta_m ?? 0), 0) / total : 0;
    const avgBefore = total ? rows.reduce((s, r) => s + Number(r.aura_before ?? 0), 0) / total : 0;
    const avgAfter = total ? rows.reduce((s, r) => s + Number(r.aura_after ?? 0), 0) / total : 0;
    return { total, pacientes, avgDelta, avgBefore, avgAfter };
  }, [rows]);

  const byDay = useMemo(() => {
    const map = new Map<string, { date: string; sessoes: number; deltaMedio: number; auraBefore: number; auraAfter: number; _count: number }>();
    rows.forEach(r => {
      const d = new Date(r.created_at).toISOString().slice(0, 10);
      const cur = map.get(d) ?? { date: d, sessoes: 0, deltaMedio: 0, auraBefore: 0, auraAfter: 0, _count: 0 };
      cur.sessoes += 1;
      cur.deltaMedio += Number(r.delta_m ?? 0);
      cur.auraBefore += Number(r.aura_before ?? 0);
      cur.auraAfter += Number(r.aura_after ?? 0);
      cur._count += 1;
      map.set(d, cur);
    });
    return Array.from(map.values()).map(v => ({
      ...v,
      deltaMedio: +(v.deltaMedio / v._count).toFixed(2),
      auraBefore: +(v.auraBefore / v._count).toFixed(2),
      auraAfter: +(v.auraAfter / v._count).toFixed(2),
    })).sort((a, b) => a.date.localeCompare(b.date));
  }, [rows]);

  const byChakra = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach(r => {
      const k = r.chakra_alvo ?? "—";
      map.set(k, (map.get(k) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [rows]);

  const byFreq = useMemo(() => {
    const map = new Map<number, number>();
    rows.forEach(r => {
      const k = Number(r.frequencia_hz ?? 0);
      if (!k) return;
      map.set(k, (map.get(k) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .map(([hz, count]) => ({ hz: `${hz} Hz`, count }))
      .sort((a, b) => b.count - a.count);
  }, [rows]);

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      <header className="flex items-start justify-between flex-wrap gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Relatório Geral Vibracional</h1>
          <p className="text-muted-foreground">Análise consolidada de todos os históricos clínicos por período.</p>
        </div>
        <Button onClick={() => window.print()} variant="outline">Imprimir / PDF</Button>
      </header>

      <Card className="shadow-soft print:hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Período de análise</CardTitle>
          <CardDescription>Defina a data de início e término.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <Label htmlFor="start">Início</Label>
            <Input id="start" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="end">Término</Label>
            <Input id="end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <Button onClick={() => load()} disabled={loading}>{loading ? "Carregando…" : "Atualizar"}</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Sessões" value={stats.total.toString()} />
        <StatCard label="Pacientes" value={stats.pacientes.toString()} />
        <StatCard label="ΔM médio" value={`${stats.avgDelta.toFixed(1)}%`} />
        <StatCard label="Aura inicial" value={stats.avgBefore.toFixed(1)} />
        <StatCard label="Aura final" value={stats.avgAfter.toFixed(1)} />
      </div>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="text-lg">Evolução diária — Aura antes vs depois</CardTitle></CardHeader>
        <CardContent style={{ height: 320 }}>
          <ResponsiveContainer>
            <LineChart data={byDay}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="auraBefore" name="Aura antes" stroke="#a78bfa" strokeWidth={2} />
              <Line type="monotone" dataKey="auraAfter" name="Aura depois" stroke="#34d399" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="text-lg">Delta de Melhora (ΔM%) por dia</CardTitle></CardHeader>
        <CardContent style={{ height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={byDay}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="deltaMedio" name="ΔM médio (%)" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-soft">
          <CardHeader><CardTitle className="text-lg">Distribuição por Chakra</CardTitle></CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byChakra} dataKey="value" nameKey="name" outerRadius={90} label>
                  {byChakra.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader><CardTitle className="text-lg">Frequências mais utilizadas</CardTitle></CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={byFreq} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="hz" width={80} />
                <Tooltip />
                <Bar dataKey="count" name="Sessões" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg">Sessões no período</CardTitle>
          <CardDescription>{start} → {end} · {rows.length} registro(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Nenhuma sessão neste período.</p>
          ) : rows.map(r => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 last:border-0">
              <div className="text-sm">
                <strong>{r.patients?.name ?? "—"}</strong>
                <span className="text-muted-foreground"> · {new Date(r.created_at).toLocaleString("pt-BR")}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {r.frequencia_hz && <Badge variant="outline">{r.frequencia_hz}Hz</Badge>}
                {r.chakra_alvo && <Badge>{r.chakra_alvo}</Badge>}
                <Badge variant="secondary">Aura {r.aura_before}→{r.aura_after}</Badge>
                <Badge variant="secondary">ΔM {Number(r.delta_m ?? 0).toFixed(1)}%</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="shadow-soft">
      <CardContent className="py-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}
