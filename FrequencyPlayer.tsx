import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square, Volume2, Download } from "lucide-react";
import lamejs from "@breezystack/lamejs";
import { toast } from "sonner";

function makeMp3(hz: number, seconds: number, sampleRate = 44100, amplitude = 0.4): Blob {
  const total = Math.floor(sampleRate * seconds);
  const fade = Math.min(sampleRate * 0.05, total / 2);
  const samples = new Int16Array(total);
  const subAudible = hz < 40;
  const carrier = 200; // Hz
  let playHz = hz;
  if (!subAudible) {
    while (playHz > 8000) playHz = playHz / 2;
  }
  for (let i = 0; i < total; i++) {
    let env = 1;
    if (i < fade) env = i / fade;
    else if (i > total - fade) env = (total - i) / fade;
    const t = i / sampleRate;
    let s: number;
    if (subAudible) {
      const mod = 0.5 + 0.5 * Math.sin(2 * Math.PI * hz * t);
      s = Math.sin(2 * Math.PI * carrier * t) * mod * amplitude * env;
    } else {
      s = Math.sin(2 * Math.PI * playHz * t) * amplitude * env;
    }
    samples[i] = Math.max(-1, Math.min(1, s)) * 0x7fff;
  }
  const encoder = new lamejs.Mp3Encoder(1, sampleRate, 128);
  const chunks: Uint8Array[] = [];
  const blockSize = 1152;
  for (let i = 0; i < samples.length; i += blockSize) {
    const chunk = samples.subarray(i, i + blockSize);
    const buf = encoder.encodeBuffer(chunk);
    if (buf.length > 0) chunks.push(buf);
  }
  const end = encoder.flush();
  if (end.length > 0) chunks.push(end);
  return new Blob(chunks as BlobPart[], { type: "audio/mpeg" });
}

export function FrequencyPlayer({ hz, label }: { hz: number; label?: string }) {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ osc: OscillatorNode; carrier?: OscillatorNode; modGain?: GainNode; gain: GainNode }[]>([]);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  useEffect(() => () => stop(), []);

  const stop = () => {
    try {
      nodesRef.current.forEach(({ osc, carrier, modGain, gain }) => {
        try { osc.stop(); } catch { /* noop */ }
        try { carrier?.stop(); } catch { /* noop */ }
        osc.disconnect();
        carrier?.disconnect();
        modGain?.disconnect();
        gain.disconnect();
      });
    } catch { /* noop */ }
    nodesRef.current = [];
    setPlaying(false);
  };

  const start = async () => {
    if (!hz || hz <= 0) return;
    try {
      if (!ctxRef.current) {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!Ctx) {
          toast.error("Seu navegador não suporta áudio Web Audio.");
          return;
        }
        ctxRef.current = new Ctx();
      }
      const ctx = ctxRef.current!;
      if (ctx.state === "suspended") await ctx.resume();
      if (ctx.state !== "running") {
        toast.error("Áudio bloqueado pelo navegador. Verifique se o som do dispositivo está ligado.");
        return;
      }

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);

    if (hz < 40) {
      // Sub-audível: portadora audível (200 Hz) com amplitude modulada na frequência terapêutica
      const carrier = ctx.createOscillator();
      carrier.type = "sine";
      carrier.frequency.value = 200;
      const modGain = ctx.createGain();
      modGain.gain.value = 0.5;
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = hz;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.5;
      lfo.connect(lfoGain).connect(modGain.gain);
      carrier.connect(modGain).connect(gain);
      carrier.start();
      lfo.start();
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
      nodesRef.current.push({ osc: lfo, carrier, modGain, gain });
    } else {
      // Hiper-audível (>8 kHz): reduz por oitavas para faixa confortável (mantém assinatura harmônica)
      let playHz = hz;
      while (playHz > 8000) playHz = playHz / 2;
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = playHz;
      osc.connect(gain);
      osc.start();
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
      nodesRef.current.push({ osc, gain });
      }
      setPlaying(true);
    } catch (err) {
      console.error("[FrequencyPlayer] start failed", err);
      toast.error("Não foi possível iniciar o áudio.");
    }
  };

  // live volume update
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    nodesRef.current.forEach(({ gain }) => {
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
    });
  }, [volume]);

  return (
    <div className="space-y-2 p-3 rounded-xl border bg-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label ?? "Tocar frequência"}</p>
          <p className="text-lg font-semibold">{hz} Hz</p>
        </div>
        {playing ? (
          <Button size="sm" variant="outline" onClick={stop}>
            <Square className="h-4 w-4 mr-1" /> Parar
          </Button>
        ) : (
          <Button size="sm" className="bg-aura-gradient" onClick={start} disabled={!hz}>
            <Play className="h-4 w-4 mr-1" /> Tocar
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Volume2 className="h-4 w-4 text-muted-foreground" />
        <input
          type="range"
          min={0}
          max={0.6}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full accent-primary"
          aria-label="Volume"
        />
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="w-full justify-center"
        disabled={!hz}
        onClick={() => {
          const blob = makeMp3(hz, 60);
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `pleito-${hz}hz-60s.mp3`;
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }}
      >
        <Download className="h-4 w-4 mr-1" /> Baixar (60s MP3)
      </Button>
    </div>
  );
}
