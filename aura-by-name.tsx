import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AuthGate } from "@/components/AuthGate";
import { AppLayout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, User, MessageCircle, FileDown, Trash2, History } from "lucide-react";
import { toast } from "sonner";
import { readAuraByName } from "@/server/ai.functions";
import { FrequencyPlayer } from "@/components/FrequencyPlayer";
import { getFrequencyMeaning } from "@/lib/frequencyMeaning";
import { buildWhatsAppUrl, copyTextToClipboard, isValidWhatsAppPhone, normalizeWhatsAppPhone, openWhatsAppUrl } from "@/lib/whatsapp";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

export const Route = createFileRoute("/aura-by-name")({
  head: () => ({
    meta: [
      { title: "Leitura de Aura pelo Nome | Mentor ND" },
      {
        name: "description",
        content:
          "Leitura intuitiva da aura a partir do nome: cor predominante, significado e tratamento vibracional recomendado.",
      },
      { property: "og:title", content: "Leitura de Aura pelo Nome" },
      {
        property: "og:description",
        content: "Cor da aura, significado e tratamento vibracional a partir do nome.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <AppLayout>
        <AuraByNamePage />
      </AppLayout>
    </AuthGate>
  ),
});

type Result = {
  auraColor: string;
  auraColorHex: string;
  chakra: string;
  frequencyHz: number;
  significado: string;
  tratamento: string;
};

type SavedReading = {
  id: string;
  name: string;
  phone: string | null;
  birth_date: string | null;
  aura_color: string;
  aura_color_hex: string;
  chakra: string;
  frequency_hz: number;
  significado: string;
  tratamento: string;
  created_at: string;
};

function buildPdf(r: {
  name: string;
  phone?: string | null;
  birth_date?: string | null;
  aura_color: string;
  aura_color_hex: string;
  chakra: string;
  frequency_hz: number;
  significado: string;
  tratamento: string;
  created_at?: string;
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = margin;

  // header band
  const hex = r.aura_color_hex.replace("#", "");
  const cr = parseInt(hex.substring(0, 2), 16);
  const cg = parseInt(hex.substring(2, 4), 16);
  const cb = parseInt(hex.substring(4, 6), 16);
  doc.setFillColor(cr, cg, cb);
  doc.rect(0, 0, w, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("Leitura de Aura pelo Nome", margin, 44);
  y = 100;

  doc.setTextColor(20, 20, 20);
  doc.setFontSize(13);
  doc.text(r.name, margin, y);
  y += 18;
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  const meta: string[] = [];
  if (r.phone) meta.push(`Tel: ${r.phone}`);
  if (r.birth_date) meta.push(`Nasc: ${r.birth_date}`);
  if (r.created_at) meta.push(`Data: ${new Date(r.created_at).toLocaleString("pt-BR")}`);
  if (meta.length) {
    doc.text(meta.join("   •   "), margin, y);
    y += 18;
  }
  y += 8;

  doc.setTextColor(20, 20, 20);
  doc.setFontSize(11);
  doc.text(`Cor predominante: ${r.aura_color}  (${r.aura_color_hex})`, margin, y); y += 16;
  doc.text(`Chakra: ${r.chakra}`, margin, y); y += 16;
  doc.text(`Frequência: ${r.frequency_hz} Hz`, margin, y); y += 24;

  const writeBlock = (title: string, body: string) => {
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(title, margin, y); y += 14;
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    const lines = doc.splitTextToSize(body, w - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 13 + 14;
  };
  writeBlock("Significado", r.significado);
  writeBlock("Tratamento vibracional recomendado", r.tratamento);

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("Mentor ND — Leitura intuitivo-numerológica. Não substitui avaliação clínica.", margin, doc.internal.pageSize.getHeight() - 24);

  doc.save(`aura-${r.name.replace(/\s+/g, "_")}.pdf`);
}

function AuraByNamePage() {
  const read = useServerFn(readAuraByName);
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<(Result & { _name: string; _phone: string; _birth: string }) | null>(null);
  const [history, setHistory] = useState<SavedReading[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from("aura_name_readings")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Falha ao carregar histórico");
    } else {
      setHistory((data ?? []) as SavedReading[]);
    }
    setLoadingHistory(false);
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Informe o nome completo");
      return;
    }
    const phoneClean = phone.trim();
    if (phoneClean && !/^[0-9+()\-.\s]{6,40}$/.test(phoneClean)) {
      toast.error("Telefone inválido");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const r = await read({
        data: { fullName: name.trim(), birthDate: birth || null, phone: phoneClean || null },
      });
      const submittedName = name.trim();
      const submittedPhone = phoneClean;
      const submittedBirth = birth;
      setResult({ ...r, _name: submittedName, _phone: submittedPhone, _birth: submittedBirth });

      // Limpar campos da tela
      setName("");
      setPhone("");
      setBirth("");

      // Save to DB
      const { data: userData } = await supabase.auth.getUser();
      const therapistId = userData.user?.id;
      if (therapistId) {
        const { error } = await supabase.from("aura_name_readings").insert({
          therapist_id: therapistId,
          name: submittedName,
          phone: submittedPhone || null,
          birth_date: submittedBirth || null,
          aura_color: r.auraColor,
          aura_color_hex: r.auraColorHex,
          chakra: r.chakra,
          frequency_hz: r.frequencyHz,
          significado: r.significado,
          tratamento: r.tratamento,
        });
        if (error) {
          toast.error("Leitura feita, mas não foi salva: " + error.message);
        } else {
          toast.success("Leitura salva no histórico");
          loadHistory();
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha na leitura");
    } finally {
      setLoading(false);
    }
  };

  const deleteReading = async (id: string) => {
    if (!confirm("Excluir esta leitura?")) return;
    const { error } = await supabase.from("aura_name_readings").delete().eq("id", id);
    if (error) {
      toast.error("Falha ao excluir");
      return;
    }
    toast.success("Leitura excluída");
    setHistory((h) => h.filter((x) => x.id !== id));
  };

  const meaning = result ? getFrequencyMeaning(result.frequencyHz) : null;

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-3xl">
      <header>
        <p className="text-sm text-muted-foreground">Leitura vibracional</p>
        <h1 className="text-3xl font-semibold tracking-tight">Aura pelo Nome</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Informe o nome completo do consulente para receber a cor predominante da aura, seu
          significado e o tratamento vibracional indicado.
        </p>
      </header>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Dados do consulente
          </CardTitle>
          <CardDescription>
            A leitura é intuitivo-numerológica e não substitui avaliação clínica.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullname">Nome completo</Label>
              <Input
                id="fullname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Maria Aparecida da Silva"
                maxLength={120}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birth">Data de nascimento (opcional)</Label>
                <Input
                  id="birth"
                  type="date"
                  value={birth}
                  onChange={(e) => setBirth(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone (opcional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  maxLength={40}
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-aura-gradient" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Lendo aura…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Realizar leitura
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className="shadow-glow border-primary/30 overflow-hidden">
          <div
            className="h-24"
            style={{
              background: `linear-gradient(135deg, ${result.auraColorHex} 0%, ${result.auraColorHex}99 100%)`,
            }}
            aria-hidden
          />
          <CardHeader>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle className="flex items-center gap-3">
                <span
                  className="inline-block h-8 w-8 rounded-full border-2 shadow-inner"
                  style={{ backgroundColor: result.auraColorHex }}
                  aria-label={result.auraColor}
                />
                Cor predominante: {result.auraColor}
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline">{result.auraColorHex}</Badge>
                <Badge>{result.chakra}</Badge>
                <Badge variant="secondary">{result.frequencyHz} Hz</Badge>
              </div>
            </div>
            <CardDescription>
              Leitura vibracional para <strong>{result._name}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <section className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Significado
              </p>
              <p className="text-sm leading-relaxed">{result.significado}</p>
            </section>

            <section className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Tratamento vibracional recomendado
              </p>
              <p className="text-sm leading-relaxed">{result.tratamento}</p>
            </section>

            {meaning && (
              <section className="rounded-md border bg-muted/40 p-3 text-xs space-y-1">
                <p className="font-semibold text-sm">
                  Frequência {meaning.hz} Hz — {meaning.nome}
                </p>
                <p className="text-muted-foreground">Chakra: {meaning.chakra}</p>
                <p>{meaning.significado}</p>
              </section>
            )}

            <FrequencyPlayer
              hz={result.frequencyHz}
              label={`Aura ${result.auraColor} — ${result.chakra}`}
            />

            <div className="grid sm:grid-cols-2 gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  buildPdf({
                    name: result._name,
                    phone: result._phone || null,
                    birth_date: result._birth || null,
                    aura_color: result.auraColor,
                    aura_color_hex: result.auraColorHex,
                    chakra: result.chakra,
                    frequency_hz: result.frequencyHz,
                    significado: result.significado,
                    tratamento: result.tratamento,
                    created_at: new Date().toISOString(),
                  })
                }
              >
                <FileDown className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>

              {(() => {
                const digits = (result._phone || "").replace(/\D/g, "");
                const text =
                  `🔮 *Leitura de Aura — ${result._name}*\n\n` +
                  `🎨 Cor predominante: *${result.auraColor}* (${result.auraColorHex})\n` +
                  `🧘 Chakra: *${result.chakra}*\n` +
                  `🎵 Frequência: *${result.frequencyHz} Hz*\n\n` +
                  `*Significado:*\n${result.significado}\n\n` +
                  `*Tratamento vibracional:*\n${result.tratamento}` +
                  (meaning
                    ? `\n\n*${meaning.hz} Hz — ${meaning.nome}* (Chakra ${meaning.chakra})\n${meaning.significado}`
                    : "");
                const phoneIntl = normalizeWhatsAppPhone(result._phone);
                const { url } = buildWhatsAppUrl(phoneIntl, text);
                const canOpenWhatsapp = !phoneIntl || isValidWhatsAppPhone(phoneIntl);
                const openWhatsApp = () => {
                  if (!canOpenWhatsapp) {
                    toast.error(`Número inválido: "${phoneIntl}"`);
                    return;
                  }
                  console.log("[WhatsApp] phone:", phoneIntl, "URL:", url);
                  const opened = openWhatsAppUrl(url);
                  copyTextToClipboard(text);
                  toast.message(opened ? "WhatsApp aberto em nova aba" : "WhatsApp bloqueado — mensagem copiada", {
                    description: `${phoneIntl || "(sem número)"} · ${url.length} chars · ${url}`,
                    duration: 15000,
                    action: {
                      label: "Copiar link",
                      onClick: () => copyTextToClipboard(url),
                    },
                  });
                };
                return (
                  <Button type="button" variant="outline" onClick={openWhatsApp}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {digits ? "Enviar pelo WhatsApp" : "Abrir WhatsApp"}
                  </Button>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" /> Histórico de leituras
          </CardTitle>
          <CardDescription>
            Nomes e telefones registrados das leituras de aura realizadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Carregando…
            </div>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma leitura registrada ainda.</p>
          ) : (
            <ul className="divide-y">
              {history.map((h) => (
                <li key={h.id} className="py-3 flex items-center gap-3 flex-wrap">
                  <span
                    className="inline-block h-6 w-6 rounded-full border shrink-0"
                    style={{ backgroundColor: h.aura_color_hex }}
                    aria-hidden
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{h.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {h.phone ? `📞 ${h.phone} · ` : ""}
                      {h.aura_color} · {h.chakra} · {h.frequency_hz} Hz ·{" "}
                      {new Date(h.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => buildPdf(h)}
                    >
                      <FileDown className="h-4 w-4" />
                      <span className="sr-only">Baixar PDF</span>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteReading(h.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
