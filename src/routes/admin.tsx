import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppLayout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: () => <AuthGate><AppLayout><AdminPage /></AppLayout></AuthGate>,
});

type Therapist = { id: string; display_name: string | null; email: string | null; phone: string | null; created_at: string };

function AdminPage() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");
      const admin = (roles?.length ?? 0) > 0;
      setIsAdmin(admin);
      if (admin) {
        const { data } = await supabase
          .from("profiles")
          .select("id, display_name, email, phone, created_at")
          .order("created_at", { ascending: false });
        setRows((data ?? []) as Therapist[]);
      }
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="p-6 text-muted-foreground">Carregando…</div>;

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-destructive" /> Acesso restrito</CardTitle>
            <CardDescription>
              Esta área é exclusiva para administradores. Seu UUID de terapeuta:
              <code className="block mt-2 p-2 bg-muted rounded text-xs break-all">{user?.id}</code>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Painel Admin</h1>
        <p className="text-muted-foreground">{rows.length} terapeuta(s) cadastrado(s).</p>
      </div>
      <Card className="shadow-soft">
        <CardHeader><CardTitle>Terapeutas</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>UUID (terapeuta_id)</TableHead>
                <TableHead>Cadastro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.display_name ?? "—"}</TableCell>
                  <TableCell>{r.email ?? "—"}</TableCell>
                  <TableCell>{r.phone ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{r.id}</TableCell>
                  <TableCell>{new Date(r.created_at).toLocaleString("pt-BR")}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum terapeuta cadastrado.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
