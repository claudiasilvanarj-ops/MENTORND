import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppLayout } from "@/components/Layout";
import { FrequencyPlayer } from "@/components/FrequencyPlayer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const Route = createFileRoute("/frequencies")({
  component: () => <AuthGate><AppLayout><FrequenciesPage /></AppLayout></AuthGate>,
});

type Pleito = {
  id: string;
  numero: number;
  nome: string;
  frequencia_hz: number | null;
  chakra_alvo: string | null;
  descricao: string | null;
};

function FrequenciesPage() {
  const [pleitos, setPleitos] = useState<Pleito[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("pleitos")
        .select("id,numero,nome,frequencia_hz,chakra_alvo,descricao")
        .order("numero");
      setPleitos((data ?? []) as Pleito[]);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return pleitos;
    return pleitos.filter(p =>
      p.nome.toLowerCase().includes(s) ||
      String(p.numero).includes(s) ||
      (p.chakra_alvo ?? "").toLowerCase().includes(s) ||
      String(p.frequencia_hz ?? "").includes(s)
    );
  }, [pleitos, q]);

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Catálogo vibracional</p>
          <h1 className="text-3xl font-semibold tracking-tight">Frequências dos 43 Pleitos</h1>
          <p className="text-sm text-muted-foreground mt-1">Toque qualquer frequência diretamente do navegador.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, chakra ou Hz…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
      </header>

      <Card className="shadow-soft border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Frequência avulsa — 2693 Hz</CardTitle>
          <CardDescription>Tocador rápido fora do catálogo dos 43 pleitos.</CardDescription>
        </CardHeader>
        <CardContent>
          <FrequencyPlayer hz={2693} label="Frequência avulsa 2693 Hz" />
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum pleito encontrado.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id} className="shadow-soft">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">#{p.numero} {p.nome}</CardTitle>
                    <CardDescription>{p.chakra_alvo ?? "—"}</CardDescription>
                  </div>
                  <Badge variant="secondary">{p.frequencia_hz ?? "—"} Hz</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {p.descricao && <p className="text-xs text-muted-foreground">{p.descricao}</p>}
                {p.frequencia_hz ? (
                  <FrequencyPlayer hz={Number(p.frequencia_hz)} label={`Pleito #${p.numero} — ${p.chakra_alvo ?? ""}`} />
                ) : (
                  <p className="text-xs text-muted-foreground italic">Frequência não cadastrada.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
