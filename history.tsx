import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppLayout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFrequencyMeaning } from "@/lib/frequencyMeaning";

export const Route = createFileRoute("/history")({
  component: () => <AuthGate><AppLayout><HistoryPage /></AppLayout></AuthGate>,
});

type Row = {
  id: string; created_at: string; paciente_id: string;
  aura_before: number | null; aura_after: number | null;
  delta_m: number | null; frequencia_hz: number | null; chakra_alvo: string | null;
  patients: { name: string } | null;
  pleitos: { numero: number; nome: string } | null;
};

function HistoryPage() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("sessions")
        .select("*, patients(name), pleitos(numero,nome)")
        .order("created_at", { ascending: false })
        .limit(100);
      setRows((data ?? []) as unknown as Row[]);
    })();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-5xl">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Histórico Clínico Vibracional</h1>
        <p className="text-muted-foreground">Todas as sessões registradas.</p>
      </header>

      {rows.length === 0 ? (
        <Card className="shadow-soft"><CardContent className="py-12 text-center text-muted-foreground">Nenhuma sessão registrada ainda.</CardContent></Card>
      ) : rows.map(r => (
        <Card key={r.id} className="shadow-soft">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-lg">{r.patients?.name ?? "—"}</CardTitle>
              <Link to="/patient/$patientId" params={{ patientId: r.paciente_id }} className="print:hidden">
                <Button variant="ghost" size="sm">Abrir paciente</Button>
              </Link>
            </div>
            <CardDescription>{new Date(r.created_at).toLocaleString("pt-BR")} · {r.pleitos ? `#${r.pleitos.numero} ${r.pleitos.nome}` : "Pleito —"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{r.frequencia_hz}Hz</Badge>
              <Badge>{r.chakra_alvo}</Badge>
              <Badge variant="secondary">Aura {r.aura_before} → {r.aura_after}</Badge>
              <Badge variant="secondary">ΔM {Number(r.delta_m ?? 0).toFixed(1)}%</Badge>
            </div>
            {(() => {
              const m = getFrequencyMeaning(r.frequencia_hz);
              return m ? (
                <p className="text-xs text-muted-foreground">
                  <strong>{m.hz} Hz · {m.nome}</strong> — {m.significado}
                </p>
              ) : null;
            })()}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
