import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, Download, Gauge } from "lucide-react";
import { useAppStore, type Episode } from "@/store/appStore";

interface EpisodePlayerProps {
  episode: Episode;
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function EpisodePlayer({ episode }: EpisodePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const setCurrentTime = useAppStore((s) => s.setCurrentTime);
  const currentTime = useAppStore((s) => s.currentTime);

  // Fallback duration: derived from chapters when there is no audio file.
  const fallbackDuration =
    episode.chapters[episode.chapters.length - 1]?.endTime ?? 0;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      setDuration(fallbackDuration);
      return;
    }

    const onTime = () => setCurrentTime(audio.currentTime);
    const onDur = () => setDuration(audio.duration || fallbackDuration);
    const onEnd = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onDur);
    audio.addEventListener("ended", onEnd);
    audio.playbackRate = speed;

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onDur);
      audio.removeEventListener("ended", onEnd);
    };
  }, [setCurrentTime, fallbackDuration, speed]);

  // Simulated playback when no audio file is attached
  useEffect(() => {
    if (audioRef.current || !playing) return;
    const id = window.setInterval(() => {
      const next = useAppStore.getState().currentTime + 0.5 * speed;
      if (next >= fallbackDuration) {
        setPlaying(false);
        setCurrentTime(fallbackDuration);
      } else {
        setCurrentTime(next);
      }
    }, 500);
    return () => window.clearInterval(id);
  }, [playing, speed, fallbackDuration, setCurrentTime]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (playing) audioRef.current.pause();
      else audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const t = pct * duration;
    if (audioRef.current) audioRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const skip = (delta: number) => {
    const t = Math.max(0, Math.min(duration, currentTime + delta));
    if (audioRef.current) audioRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const cycleSpeed = () => {
    const idx = SPEEDS.indexOf(speed);
    const next = SPEEDS[(idx + 1) % SPEEDS.length];
    setSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      {episode.audioUrl && <audio ref={audioRef} src={episode.audioUrl} preload="metadata" />}

      <div className="mb-4 cursor-pointer" onClick={seek}>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-muted-foreground">{formatTime(currentTime)}</span>
          <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => skip(-15)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <SkipBack className="w-5 h-5" />
          </button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center glow-primary"
          >
            {playing ? (
              <Pause className="w-5 h-5 text-primary-foreground" />
            ) : (
              <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
            )}
          </motion.button>
          <button onClick={() => skip(15)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <SkipForward className="w-5 h-5" />
          </button>
          <Volume2 className="w-4 h-4 text-muted-foreground ml-2" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={cycleSpeed}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-foreground hover:bg-secondary/60 transition-colors"
            title="Playback speed"
          >
            <Gauge className="w-3.5 h-3.5" />
            {speed}x
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground transition-colors">
            <Download className="w-3.5 h-3.5" />
            MP3
          </button>
        </div>
      </div>
    </motion.div>
  );
}
