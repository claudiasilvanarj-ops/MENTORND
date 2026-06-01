import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import appCss from "../styles.css?url";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">A rota que você buscou não existe.</p>
        <Link to="/" className="inline-flex mt-6 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Início</Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Mentor ND — Transceptor Noosférico" },
      { name: "description", content: "Mentor ND: protocolo dos 43 Pleitos da Dra. Nádia Bara. Análise de aura, bio-ressonância e prontuário clínico vibracional." },
      { name: "author", content: "Mentor ND" },
      { property: "og:title", content: "Mentor ND — Transceptor Noosférico" },
      { property: "og:description", content: "Mentor ND: protocolo dos 43 Pleitos da Dra. Nádia Bara. Análise de aura, bio-ressonância e prontuário clínico vibracional." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Mentor ND — Transceptor Noosférico" },
      { name: "twitter:description", content: "Mentor ND: protocolo dos 43 Pleitos da Dra. Nádia Bara. Análise de aura, bio-ressonância e prontuário clínico vibracional." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/pW81bV63rqRWB5sIBeB9I85YHI43/social-images/social-1778525757216-Generatedimage_1778524640681.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/pW81bV63rqRWB5sIBeB9I85YHI43/social-images/social-1778525757216-Generatedimage_1778524640681.webp" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow" },
      { name: "referrer", content: "no-referrer" },
      { name: "theme-color", content: "#7c3aed" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Mentor ND" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootApp,
  notFoundComponent: NotFoundComponent,
});

function RootApp() {
  useEffect(() => {
    // Remover qualquer service worker antigo (kill-switch via /sw.js)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister())).catch(() => {});
    }
    // Reenviar fila de sessões pendentes para Tor-ND
    import("@/lib/sessionRelay").then(m => m.flushRelayQueue()).catch(() => {});
    // Bloquear Web Share API e Clipboard
    try {
      const nav: any = navigator;
      if (nav.share) nav.share = undefined;
      if (nav.canShare) nav.canShare = () => false;
      if (nav.clipboard) {
        nav.clipboard.write = async () => { throw new Error("Compartilhamento desativado"); };
        nav.clipboard.writeText = async () => { throw new Error("Compartilhamento desativado"); };
      }
    } catch {}
    // Bloquear menu de contexto (copiar/compartilhar) e atalhos comuns
    const stopCtx = (e: Event) => { e.preventDefault(); e.stopPropagation(); return false; };
    const stopCopy = (e: ClipboardEvent) => { e.preventDefault(); };
    const stopDrag = (e: DragEvent) => { e.preventDefault(); };
    const stopKeys = (e: KeyboardEvent) => {
      const k = (e.key || "").toLowerCase();
      if ((e.ctrlKey || e.metaKey) && (k === "c" || k === "x" || k === "s" || k === "p" || k === "a" || k === "u")) {
        e.preventDefault();
      }
      if (k === "printscreen") {
        e.preventDefault();
      }
    };
    const stopPrint = (e: Event) => { e.preventDefault(); };
    document.addEventListener("contextmenu", stopCtx);
    document.addEventListener("copy", stopCopy);
    document.addEventListener("cut", stopCopy);
    document.addEventListener("dragstart", stopDrag);
    document.addEventListener("keydown", stopKeys);
    window.addEventListener("beforeprint", stopPrint);
    const origPrint = window.print;
    window.print = () => {};
    return () => {
      document.removeEventListener("contextmenu", stopCtx);
      document.removeEventListener("copy", stopCopy);
      document.removeEventListener("cut", stopCopy);
      document.removeEventListener("dragstart", stopDrag);
      document.removeEventListener("keydown", stopKeys);
      window.removeEventListener("beforeprint", stopPrint);
      window.print = origPrint;
    };
  }, []);
  return (
    <AuthProvider>
      <Outlet />
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}
