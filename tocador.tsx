import { createFileRoute } from "@tanstack/react-router";
import { AuthGate } from "@/components/AuthGate";
import { AppLayout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download } from "lucide-react";
import { FrequencyPlayer } from "@/components/FrequencyPlayer";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import lamejs from "@breezystack/lamejs";

function downloadMp3(hz: number, seconds: number) {
  const sampleRate = 44100;
  const amplitude = 0.4;
  const total = Math.floor(sampleRate * seconds);
  const fade = Math.min(sampleRate * 0.05, total / 2);
  const samples = new Int16Array(total);
  for (let i = 0; i < total; i++) {
    let env = 1;
    if (i < fade) env = i / fade;
    else if (i > total - fade) env = (total - i) / fade;
    const s = Math.sin(2 * Math.PI * hz * (i / sampleRate)) * amplitude * env;
    samples[i] = Math.max(-1, Math.min(1, s)) * 0x7fff;
  }
  const encoder = new lamejs.Mp3Encoder(1, sampleRate, 128);
  const chunks: Uint8Array[] = [];
  const blockSize = 1152;
  for (let i = 0; i < samples.length; i += blockSize) {
    const buf = encoder.encodeBuffer(samples.subarray(i, i + blockSize));
    if (buf.length > 0) chunks.push(buf);
  }
  const end = encoder.flush();
  if (end.length > 0) chunks.push(end);
  const blob = new Blob(chunks as BlobPart[], { type: "audio/mpeg" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `frequencia-${hz}hz-${seconds}s.mp3`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const Route = createFileRoute("/tocador")({
  head: () => ({
    meta: [
      { title: "Tocador de Frequências — Mentor ND" },
      { name: "description", content: "Reproduza e baixe frequências terapêuticas." },
    ],
  }),
  component: () => <AuthGate><AppLayout><TocadorPage /></AppLayout></AuthGate>,
});

const EXTERNAL = "https://curaquanticalarmaria.lovable.app";

function TocadorPage() {
  const [hz, setHz] = useState<number>(528);

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Frequência tocada</p>
          <h1 className="text-3xl font-semibold tracking-tight">Tocador Quântico</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Página externa de reprodução com opção de baixar a frequência indicada.
          </p>
        </div>
        <a href={EXTERNAL} target="_blank" rel="noopener noreferrer">
          <Button variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" /> Abrir em nova aba
          </Button>
        </a>
      </header>

      <Card className="shadow-soft border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Indicar e baixar</CardTitle>
          <CardDescription>Escolha a frequência (Hz), reproduza e baixe o MP3 de 60s.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-32">
              <Label htmlFor="hz" className="text-xs">Frequência (Hz)</Label>
              <Input
                id="hz"
                type="number"
                min={1}
                value={hz}
                onChange={(e) => setHz(Number(e.target.value) || 0)}
              />
            </div>
            <a href={`${EXTERNAL}/?hz=${hz}`} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary">
                <ExternalLink className="h-4 w-4 mr-2" /> Tocar lá
              </Button>
            </a>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Baixar como MP3:</p>
            <div className="flex flex-wrap gap-2">
              {[60, 180, 300, 600, 900].map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant="outline"
                  disabled={!hz}
                  onClick={() => downloadMp3(hz, s)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  {s < 60 ? `${s}s` : `${s / 60} min`}
                </Button>
              ))}
            </div>
          </div>

          <FrequencyPlayer hz={hz} label={`Frequência ${hz} Hz`} />
        </CardContent>
      </Card>

      <Card className="shadow-soft overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Player externo</CardTitle>
          <CardDescription>{EXTERNAL}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full" style={{ height: "70vh" }}>
            <iframe
              src={EXTERNAL}
              title="Cura Quântica - Tocador"
              className="absolute inset-0 w-full h-full border-0"
              allow="autoplay; microphone; fullscreen"
            />
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Download className="h-3 w-3" /> O botão "Baixar (60s MP3)" gera o áudio diretamente neste app.
      </p>
    </div>
  );
}
