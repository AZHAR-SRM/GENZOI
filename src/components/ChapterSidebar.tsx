import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { useAppStore, type Chapter } from "@/store/appStore";

interface ChapterSidebarProps {
  chapters: Chapter[];
  onSelect?: (time: number) => void;
}

export default function ChapterSidebar({ chapters, onSelect }: ChapterSidebarProps) {
  const currentTime = useAppStore((s) => s.currentTime);

  const activeChapter = chapters.findIndex(
    (ch) => currentTime >= ch.startTime && currentTime < ch.endTime
  );

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">Chapters</h3>
      </div>

      <div className="space-y-1">
        {chapters.map((ch, i) => (
          <motion.button
            key={i}
            onClick={() => onSelect?.(ch.startTime)}
            whileHover={{ x: 4 }}
            className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
              i === activeChapter
                ? "bg-primary/10 text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium truncate pr-2">{ch.title}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {Math.floor(ch.startTime / 60)}:{Math.floor(ch.startTime % 60).toString().padStart(2, "0")}
              </span>
            </div>
            {ch.paperSection && (
              <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">{ch.paperSection}</p>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
