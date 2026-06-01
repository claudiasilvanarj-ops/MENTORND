import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square, Repeat, SkipForward, Volume2 } from "lucide-react";

export type PlaylistItem = { hz: number; label?: string };

export function SessionPlaylist({
  items,
  secondsPerItem = 60,
}: {
  items: PlaylistItem[];
  secondsPerItem?: number;
}) {
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [idx, setIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [volume, setVolume] = useState(0.25);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => () => stopAll(), []);

  useEffect(() => {
    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.linearRampToValueAtTime(volume, ctxRef.current.currentTime + 0.05);
    }
  }, [volume]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setRemaining((r) => (r > 0 ? r - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [playing, idx]);

  const stopOsc = () => {
    try {
      oscRef.current?.stop();
      oscRef.current?.disconnect();
      gainRef.current?.disconnect();
    } catch { /* noop */ }
    oscRef.current = null;
    gainRef.current = null;
  };

  const stopAll = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    stopOsc();
    setPlaying(false);
    setIdx(-1);
    setRemaining(0);
  };

  const playAt = async (i: number) => {
    if (i >= items.length) {
      if (repeat) return playAt(0);
      stopAll();
      return;
    }
    const item = items[i];
    if (!item || !item.hz) return playAt(i + 1);

    if (!ctxRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new Ctx();
    }
    const ctx = ctxRef.current!;
    if (ctx.state === "suspended") await ctx.resume();

    stopOsc();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = item.hz;
    gain.gain.value = 0;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
    oscRef.current = osc;
    gainRef.current = gain;

    setIdx(i);
    setPlaying(true);
    setRemaining(secondsPerItem);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      // soft release before next
      if (gainRef.current && ctxRef.current) {
        gainRef.current.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 0.05);
      }
      setTimeout(() => playAt(i + 1), 80);
    }, secondsPerItem * 1000);
  };

  const playAll = () => playAt(0);
  const skipNext = () => playAt(idx + 1);

  if (items.length === 0) return null;

  return (
    <div className="space-y-3 p-4 rounded-xl border bg-card">
      <div className="flex flex-wrap items-center gap-2">
        {!playing ? (
          <Button size="sm" className="bg-aura-gradient" onClick={playAll}>
            <Play className="h-4 w-4 mr-1" /> Reproduzir tudo
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={stopAll}>
            <Square className="h-4 w-4 mr-1" /> Parar
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={skipNext} disabled={!playing}>
          <SkipForward className="h-4 w-4 mr-1" /> Próxima
        </Button>
        <Button
          size="sm"
          variant={repeat ? "default" : "outline"}
          onClick={() => setRepeat((v) => !v)}
        >
          <Repeat className="h-4 w-4 mr-1" /> Repetir {repeat ? "(on)" : "(off)"}
        </Button>
        <div className="flex items-center gap-2 ml-auto min-w-[160px]">
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
      </div>
      {playing && idx >= 0 && (
        <p className="text-xs text-muted-foreground">
          Tocando {idx + 1}/{items.length} · {items[idx].hz} Hz · resta {remaining}s
        </p>
      )}
      <ol className="space-y-1 text-sm">
        {items.map((it, i) => (
          <li
            key={`${it.hz}-${i}`}
            className={`flex items-center justify-between gap-2 px-2 py-1 rounded-md ${
              i === idx ? "bg-accent text-accent-foreground font-medium" : "hover:bg-muted/60"
            }`}
          >
            <span className="truncate">
              {i + 1}. {it.label ?? `Pleito`} — <strong>{it.hz} Hz</strong>
            </span>
            <Button size="sm" variant="ghost" onClick={() => playAt(i)}>
              <Play className="h-3 w-3" />
            </Button>
          </li>
        ))}
      </ol>
    </div>
  );
}
