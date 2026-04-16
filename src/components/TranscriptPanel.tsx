import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAppStore, type ScriptLine } from "@/store/appStore";
import SpeakerBadge from "@/components/SpeakerBadge";
import { Download, Volume2, Square } from "lucide-react";

interface TranscriptPanelProps {
  script: ScriptLine[];
  onSeek?: (time: number) => void;
}

// Pick a female voice from the browser's available voices.
function pickFemaleVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const preferredNames = [
    "Google UK English Female",
    "Google US English",
    "Samantha",
    "Karen",
    "Victoria",
    "Tessa",
    "Microsoft Zira",
    "Microsoft Aria",
    "Microsoft Jenny",
  ];
  for (const name of preferredNames) {
    const v = voices.find((v) => v.name.includes(name));
    if (v) return v;
  }
  // Fallback: any voice whose name contains "female"
  const female = voices.find((v) => /female|woman/i.test(v.name));
  if (female) return female;
  // Otherwise prefer English
  return voices.find((v) => v.lang.startsWith("en")) ?? voices[0];
}

export default function TranscriptPanel({ script, onSeek }: TranscriptPanelProps) {
  const currentTime = useAppStore((s) => s.currentTime);
  const activeRef = useRef<HTMLDivElement>(null);
  const [reading, setReading] = useState(false);

  const activeIndex = script.findIndex((line, i) => {
    const next = script[i + 1];
    return currentTime >= line.timestamp && (!next || currentTime < next.timestamp);
  });

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeIndex]);

  // Pre-load voices (some browsers populate them async)
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const handler = () => pickFemaleVoice();
    window.speechSynthesis.onvoiceschanged = handler;
    handler();
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const stopReading = () => {
    window.speechSynthesis.cancel();
    setReading(false);
  };

  const readAloud = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setReading(true);

    const voice = pickFemaleVoice();
    let i = 0;
    const speakNext = () => {
      if (i >= script.length) {
        setReading(false);
        return;
      }
      const line = script[i];
      const utter = new SpeechSynthesisUtterance(`${line.speaker} says. ${line.text}`);
      if (voice) utter.voice = voice;
      utter.pitch = 1.15;
      utter.rate = 1;
      utter.lang = voice?.lang || "en-US";
      utter.onend = () => {
        i += 1;
        speakNext();
      };
      utter.onerror = () => setReading(false);
      window.speechSynthesis.speak(utter);
    };
    speakNext();
  };

  const readLine = (line: ScriptLine) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const voice = pickFemaleVoice();
    const utter = new SpeechSynthesisUtterance(line.text);
    if (voice) utter.voice = voice;
    utter.pitch = 1.15;
    utter.lang = voice?.lang || "en-US";
    window.speechSynthesis.speak(utter);
  };

  const downloadTranscript = () => {
    const text = script
      .map((line) => {
        const time = `${Math.floor(line.timestamp / 60)}:${Math.floor(line.timestamp % 60).toString().padStart(2, "0")}`;
        return `[${time}] ${line.speaker}: ${line.text}`;
      })
      .join("\n\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transcript.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass rounded-2xl p-6 max-h-[600px] overflow-y-auto">
      <div className="sticky top-0 bg-card/90 backdrop-blur pb-3 z-10">
        <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
          <h3 className="font-display font-semibold text-foreground">Transcript</h3>
          <div className="flex items-center gap-2">
            {reading ? (
              <button
                onClick={stopReading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
              >
                <Square className="w-3.5 h-3.5" />
                Stop
              </button>
            ) : (
              <button
                onClick={readAloud}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Read Aloud
              </button>
            )}
            <button
              onClick={downloadTranscript}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {script.map((line, i) => {
          const isActive = i === activeIndex;
          return (
            <motion.div
              key={i}
              ref={isActive ? activeRef : undefined}
              className={`group p-3 rounded-xl transition-all ${
                isActive
                  ? "bg-primary/10 border border-primary/30"
                  : "hover:bg-secondary/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <button onClick={() => onSeek?.(line.timestamp)} className="contents cursor-pointer">
                  <SpeakerBadge speaker={line.speaker} />
                  <span className="text-xs text-muted-foreground">
                    {Math.floor(line.timestamp / 60)}:{Math.floor(line.timestamp % 60).toString().padStart(2, "0")}
                  </span>
                </button>
                {line.paperSection && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                    {line.paperSection}
                  </span>
                )}
                <button
                  onClick={() => readLine(line)}
                  className="ml-auto opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-primary/10 text-primary transition"
                  title="Read this line"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p
                className={`text-sm leading-relaxed cursor-pointer ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                onClick={() => onSeek?.(line.timestamp)}
              >
                {line.text}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
