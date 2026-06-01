import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Sparkles, Users, Activity, History, LogOut, Radio, FileText, Palette, Wand2, Stethoscope, ScrollText, BarChart3, Music, Waves, Shield, Heart, Circle } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { InstallAppButton } from "@/components/InstallAppButton";

export function AppLayout({ children }: { children?: ReactNode }) {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin")
      .then(({ data }) => setIsAdmin((data?.length ?? 0) > 0));
  }, [user]);

  const items = [
    { to: "/dashboard", label: "Painel", icon: Activity },
    { to: "/patients", label: "Pacientes", icon: Users },
    { to: "/frequencies", label: "Frequências", icon: Radio },
    { to: "/tocador", label: "Tocador Quântico", icon: Music },
    { to: "/aura-colors", label: "Cores da Aura", icon: Palette },
    { to: "/aura-by-name", label: "Aura pelo Nome", icon: Wand2 },
    { to: "/physical-photo", label: "Problemas Físicos", icon: Stethoscope },
    { to: "/noospheric", label: "Protocolo Noosférico", icon: Waves },
    { to: "/grief", label: "Luto Emocional", icon: Heart },
    { to: "/umbilical", label: "Chakra Umbilical", icon: Circle },
    { to: "/history", label: "Histórico", icon: History },
    { to: "/report", label: "Relatório Geral", icon: BarChart3 },
    { to: "/protocol", label: "Ficha Técnica", icon: ScrollText },
    { to: "/docs", label: "Documentação", icon: FileText },
    ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex flex-col w-64 border-r bg-card/60 backdrop-blur p-6 gap-2 print:hidden">
        <Link to="/dashboard" className="flex items-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-xl bg-aura-gradient grid place-items-center shadow-soft">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Mentor ND</h1>
            <p className="text-xs text-muted-foreground">Transceptor Noosférico</p>
          </div>
        </Link>
        <nav className="flex flex-col gap-1">
          {items.map(({ to, label, icon: Icon }) => {
            const active = path.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  active ? "bg-accent text-accent-foreground font-medium" : "hover:bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto pt-4 border-t space-y-2">
          <InstallAppButton className="w-full justify-start" />
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={async () => { await signOut(); nav({ to: "/login" }); }}>
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-card/80 print:hidden">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-aura-gradient grid place-items-center"><Sparkles className="h-4 w-4 text-primary-foreground" /></div>
            <span className="font-semibold">Mentor ND</span>
          </div>
          <div className="flex items-center gap-2">
            <InstallAppButton />
            <Button variant="ghost" size="sm" onClick={async () => { await signOut(); nav({ to: "/login" }); }}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="md:hidden flex gap-1 p-2 border-b overflow-x-auto bg-card/40 print:hidden">
          {items.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap hover:bg-muted">
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </div>
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
