import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AuthGate } from "@/components/AuthGate";
import { AppLayout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Stethoscope, Camera, FileDown, Trash2, History, Image as ImageIcon, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { analyzePhysicalByPhoto } from "@/server/ai.functions";
import { FrequencyPlayer } from "@/components/FrequencyPlayer";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

export const Route = createFileRoute("/physical-photo")({
  head: () => ({
    meta: [
      { title: "Problemas Físicos | Mentor ND" },
      {
        name: "description",
        content:
          "Leitura vibracional de problemas físicos a partir de fotografia, com frequências terapêuticas indicadas para cura.",
      },
      { property: "og:title", content: "Problemas Físicos" },
      {
        property: "og:description",
        content: "Identifique pontos de desequilíbrio e frequências de cura via foto.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <AppLayout>
        <PhysicalPhotoPage />
      </AppLayout>
    </AuthGate>
  ),
});

type Problema = {
  regiao: string;
  problema: string;
  chakra: string;
  frequenciaHz: number;
  tratamento: string;
  intensidade: "leve" | "moderada" | "alta";
};

type Result = {
  analiseGeral: string;
  problemas: Problema[];
  protocoloGeral: string;
};

type SavedAnalysis = {
  id: string;
  patient_name: string | null;
  observations: string | null;
  image_url: string | null;
  analise_geral: string;
  protocolo_geral: string;
  problemas: Problema[];
  created_at: string;
};

const intensidadeColor = (i: Problema["intensidade"]) =>
  i === "alta" ? "destructive" : i === "moderada" ? "default" : "secondary";

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

async function downscaleImage(file: File, maxDim = 1280, quality = 0.82): Promise<string> {
  const dataUrl = await fileToBase64(file);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function buildPdf(a: {
  patient_name?: string | null;
  observations?: string | null;
  analise_geral: string;
  protocolo_geral: string;
  problemas: Problema[];
  created_at?: string;
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  const margin = 48;
  let y = margin;

  doc.setFillColor(124, 58, 237);
  doc.rect(0, 0, w, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("Análise Vibracional por Foto", margin, 44);
  y = 100;

  doc.setTextColor(20, 20, 20);
  doc.setFontSize(13);
  doc.text(a.patient_name || "Paciente", margin, y); y += 18;

  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  if (a.created_at) {
    doc.text(`Data: ${new Date(a.created_at).toLocaleString("pt-BR")}`, margin, y); y += 14;
  }
  if (a.observations) {
    const obs = doc.splitTextToSize(`Observações: ${a.observations}`, w - margin * 2);
    doc.text(obs, margin, y); y += obs.length * 12 + 6;
  }
  y += 6;

  const block = (title: string, body: string) => {
    if (y > h - 80) { doc.addPage(); y = margin; }
    doc.setFontSize(11); doc.setTextColor(0, 0, 0);
    doc.text(title, margin, y); y += 14;
    doc.setFontSize(10); doc.setTextColor(50, 50, 50);
    const lines = doc.splitTextToSize(body, w - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 13 + 14;
  };

  block("Análise geral", a.analise_geral);

  if (y > h - 100) { doc.addPage(); y = margin; }
  doc.setFontSize(11); doc.setTextColor(0, 0, 0);
  doc.text("Pontos identificados", margin, y); y += 16;

  a.problemas.forEach((p, i) => {
    if (y > h - 110) { doc.addPage(); y = margin; }
    doc.setFontSize(10); doc.setTextColor(20, 20, 20);
    doc.text(`${i + 1}. ${p.regiao} — ${p.problema}`, margin, y); y += 13;
    doc.setTextColor(80, 80, 80);
    doc.text(`Chakra: ${p.chakra}  •  ${p.frequenciaHz} Hz  •  intensidade ${p.intensidade}`, margin, y); y += 12;
    const tt = doc.splitTextToSize(`Tratamento: ${p.tratamento}`, w - margin * 2);
    doc.text(tt, margin, y); y += tt.length * 12 + 8;
  });

  block("Protocolo geral recomendado", a.protocolo_geral);

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("Mentor ND — Leitura vibracional complementar. Não substitui avaliação médica.", margin, h - 24);
  doc.save(`analise-fisica-${(a.patient_name || "paciente").replace(/\s+/g, "_")}.pdf`);
}

function PhysicalPhotoPage() {
  const analyze = useServerFn(analyzePhysicalByPhoto);
  const fileInput = useRef<HTMLInputElement>(null);

  const [patientName, setPatientName] = useState("");
  const [observations, setObservations] = useState("");
  const [imageData, setImageData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<(Result & { _name: string; _obs: string; _image: string | null }) | null>(null);
  const [history, setHistory] = useState<SavedAnalysis[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from("physical_photo_analyses")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Falha ao carregar histórico");
    } else {
      setHistory(((data ?? []) as any[]).map((x) => ({
        ...x,
        problemas: Array.isArray(x.problemas) ? (x.problemas as Problema[]) : [],
      })));
    }
    setLoadingHistory(false);
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const onPickFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx 15MB).");
      return;
    }
    try {
      const dataUrl = await downscaleImage(file);
      setImageData(dataUrl);
    } catch {
      toast.error("Falha ao ler a imagem.");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageData) {
      toast.error("Envie uma fotografia.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const r = await analyze({
        data: {
          imageBase64: imageData,
          patientName: patientName.trim() || null,
          observations: observations.trim() || null,
        },
      });
      const submittedName = patientName.trim();
      const submittedObs = observations.trim();
      const submittedImage = imageData;
      setResult({ ...r, _name: submittedName, _obs: submittedObs, _image: submittedImage });

      // Limpar formulário
      setPatientName("");
      setObservations("");
      setImageData(null);
      if (fileInput.current) fileInput.current.value = "";

      const { data: userData } = await supabase.auth.getUser();
      const therapistId = userData.user?.id;
      if (therapistId) {
        const { error } = await supabase.from("physical_photo_analyses").insert({
          therapist_id: therapistId,
          patient_name: submittedName || null,
          observations: submittedObs || null,
          image_url: null,
          analise_geral: r.analiseGeral,
          protocolo_geral: r.protocoloGeral,
          problemas: r.problemas as any,
        });
        if (error) {
          toast.error("Análise feita, mas não foi salva: " + error.message);
        } else {
          toast.success("Análise salva no histórico");
          loadHistory();
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha na análise");
    } finally {
      setLoading(false);
    }
  };

  const deleteAnalysis = async (id: string) => {
    if (!confirm("Excluir esta análise?")) return;
    const { error } = await supabase.from("physical_photo_analyses").delete().eq("id", id);
    if (error) {
      toast.error("Falha ao excluir");
      return;
    }
    toast.success("Análise excluída");
    setHistory((h) => h.filter((x) => x.id !== id));
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-3xl">
      <header>
        <p className="text-sm text-muted-foreground">Bio-ressonância visual</p>
        <h1 className="text-3xl font-semibold tracking-tight">Problemas Físicos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Envie uma foto do paciente para receber uma leitura vibracional dos pontos de
          desequilíbrio físico e as frequências terapêuticas indicadas para cura.
        </p>
      </header>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" /> Dados e foto
          </CardTitle>
          <CardDescription>
            Esta leitura é vibracional e complementar — não substitui avaliação médica.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pname">Nome do paciente (opcional)</Label>
              <Input
                id="pname"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Ex: João Silva"
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="obs">Observações / queixas (opcional)</Label>
              <Textarea
                id="obs"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Ex: dores na cervical, ansiedade, insônia…"
                maxLength={800}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo">Fotografia do paciente</Label>
              <Input
                id="photo"
                ref={fileInput}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onPickFile(f);
                }}
              />
              {imageData && (
                <div className="mt-2 rounded-md border overflow-hidden bg-muted/30 relative">
                  <img src={imageData} alt="Pré-visualização" className="max-h-64 mx-auto" />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImageData(null);
                      if (fileInput.current) fileInput.current.value = "";
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Retirar foto
                  </Button>
                </div>
              )}
            </div>
            <Button type="submit" className="w-full bg-aura-gradient" disabled={loading || !imageData}>
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analisando…</>
              ) : (
                <><Camera className="h-4 w-4 mr-2" />Analisar foto</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className="shadow-glow border-primary/30">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Análise vibracional
              </CardTitle>
              <Badge variant="outline">{result.problemas.length} pontos</Badge>
            </div>
            <CardDescription>
              {result._name ? <>Paciente: <strong>{result._name}</strong></> : "Leitura realizada"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {result._image && (
              <div className="rounded-md border overflow-hidden bg-muted/30">
                <img src={result._image} alt="Foto analisada" className="max-h-56 mx-auto" />
              </div>
            )}

            <section className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Síntese geral
              </p>
              <p className="text-sm leading-relaxed">{result.analiseGeral}</p>
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Pontos identificados e frequências de cura
              </p>
              <ul className="space-y-3">
                {result.problemas.map((p, i) => (
                  <li key={i} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-medium">{p.regiao} — {p.problema}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.chakra} · {p.frequenciaHz} Hz
                        </p>
                      </div>
                      <Badge variant={intensidadeColor(p.intensidade) as any}>{p.intensidade}</Badge>
                    </div>
                    <p className="text-sm leading-relaxed">{p.tratamento}</p>
                    <FrequencyPlayer hz={p.frequenciaHz} label={`${p.chakra} — ${p.regiao}`} />
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Protocolo geral recomendado
              </p>
              <p className="text-sm leading-relaxed">{result.protocoloGeral}</p>
            </section>

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() =>
                buildPdf({
                  patient_name: result._name,
                  observations: result._obs,
                  analise_geral: result.analiseGeral,
                  protocolo_geral: result.protocoloGeral,
                  problemas: result.problemas,
                  created_at: new Date().toISOString(),
                })
              }
            >
              <FileDown className="h-4 w-4 mr-2" /> Baixar PDF
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" /> Histórico de análises
          </CardTitle>
          <CardDescription>Análises anteriores salvas.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Carregando…
            </div>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma análise registrada ainda.</p>
          ) : (
            <ul className="divide-y">
              {history.map((h) => (
                <li key={h.id} className="py-3 flex items-center gap-3 flex-wrap">
                  <ImageIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{h.patient_name || "Paciente sem nome"}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {h.problemas.length} pontos · {new Date(h.created_at).toLocaleString("pt-BR")}
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
                      onClick={() => deleteAnalysis(h.id)}
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
