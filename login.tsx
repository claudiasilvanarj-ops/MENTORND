import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  useEffect(() => { if (!authLoading && user) nav({ to: "/dashboard" }); }, [user, authLoading, nav]);

  const signIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    nav({ to: "/dashboard" });
  };

  const signUp = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { display_name: name, phone } },
    });
    if (error) { setLoading(false); return toast.error(error.message); }
    if (data.session) {
      setLoading(false);
      toast.success("Conta criada!");
      nav({ to: "/dashboard" });
      return;
    }
    // Sem sessão (confirmação por email exigida) — tenta login imediato
    const { error: e2 } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (e2) return toast.success("Conta criada! Verifique seu email para confirmar.");
    nav({ to: "/dashboard" });
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/dashboard` });
    if (r.error) toast.error("Falha no login com Google");
  };

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <Card className="w-full max-w-md shadow-soft">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-aura-gradient grid place-items-center shadow-soft mb-2">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle>Mentor ND</CardTitle>
          <CardDescription>Acesse o transceptor noosférico</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
            <Button type="button" variant={mode === "signin" ? "default" : "ghost"} className={mode === "signin" ? "bg-aura-gradient" : ""} onClick={() => setMode("signin")}>Entrar</Button>
            <Button type="button" variant={mode === "signup" ? "default" : "ghost"} className={mode === "signup" ? "bg-aura-gradient" : ""} onClick={() => setMode("signup")}>Cadastrar</Button>
          </div>

          {mode === "signin" ? (
            <div className="space-y-3 mt-4">
              <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div><Label>Senha</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              <Button className="w-full bg-aura-gradient" disabled={loading} onClick={signIn}>Entrar</Button>
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              <div><Label>Nome do terapeuta</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div><Label>Telefone</Label><Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" /></div>
              <div><Label>Senha</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              <Button className="w-full bg-aura-gradient" disabled={loading} onClick={signUp}>Criar conta</Button>
            </div>
          )}
          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-border" /> ou <div className="flex-1 h-px bg-border" />
          </div>
          <Button variant="outline" className="w-full" onClick={google}>Continuar com Google</Button>
        </CardContent>
      </Card>
    </div>
  );
}
