import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppStore, type ScriptLine } from "@/store/appStore";
import SpeakerBadge from "@/components/SpeakerBadge";
import { Download } from "lucide-react";

interface TranscriptPanelProps {
  script: ScriptLine[];
  onSeek?: (time: number) => void;
}

export default function TranscriptPanel({ script, onSeek }: TranscriptPanelProps) {
  const currentTime = useAppStore((s) => s.currentTime);
  const activeRef = useRef<HTMLDivElement>(null);

  const activeIndex = script.findIndex((line, i) => {
    const next = script[i + 1];
    return currentTime >= line.timestamp && (!next || currentTime < next.timestamp);
  });

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeIndex]);

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
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-semibold text-foreground">Transcript</h3>
          <button
            onClick={downloadTranscript}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {script.map((line, i) => {
          const isActive = i === activeIndex;
          return (
            <motion.div
              key={i}
              ref={isActive ? activeRef : undefined}
              onClick={() => onSeek?.(line.timestamp)}
              className={`p-3 rounded-xl cursor-pointer transition-all ${
                isActive
                  ? "bg-primary/10 border border-primary/30"
                  : "hover:bg-secondary/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <SpeakerBadge speaker={line.speaker} />
                <span className="text-xs text-muted-foreground">
                  {Math.floor(line.timestamp / 60)}:{Math.floor(line.timestamp % 60).toString().padStart(2, "0")}
                </span>
                {line.paperSection && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                    {line.paperSection}
                  </span>
                )}
              </div>
              <p className={`text-sm leading-relaxed ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                {line.text}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
