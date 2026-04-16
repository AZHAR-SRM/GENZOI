import { motion } from "framer-motion";
import { Play, Clock, BookOpen, MessageSquare } from "lucide-react";

export default function SampleEpisode() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="glass rounded-2xl p-8 gradient-border"
    >
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 h-64 rounded-xl bg-gradient-to-br from-primary/30 via-accent/20 to-glow-warm/20 flex items-center justify-center relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-16 h-16 rounded-full bg-primary/80 backdrop-blur flex items-center justify-center cursor-pointer glow-primary z-10"
          >
            <Play className="w-7 h-7 text-primary-foreground ml-1" />
          </motion.div>
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <p className="text-xs text-muted-foreground">Sample Episode</p>
            <p className="font-display font-semibold text-sm text-foreground">
              "Attention Is All You Need" — Transformer Architecture
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                AI / Deep Learning
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent">
                8 chapters
              </span>
            </div>
            <h3 className="font-display font-bold text-xl text-foreground mb-2">
              Attention Is All You Need
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Dive deep into the Transformer architecture with a host-guest dialogue exploring self-attention,
              multi-head attention, positional encoding, and why this paper revolutionized NLP and beyond.
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>24 min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>8 sections</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              <span>42 exchanges</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
