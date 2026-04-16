import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

interface TakeawayCardsProps {
  takeaways: string[];
}

export default function TakeawayCards({ takeaways }: TakeawayCardsProps) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-accent" />
        <h3 className="font-display font-semibold text-foreground">Key Takeaways</h3>
      </div>

      <div className="space-y-3">
        {takeaways.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex gap-3 p-3 rounded-xl bg-accent/5 border border-accent/10"
          >
            <span className="shrink-0 w-6 h-6 rounded-full bg-accent/15 text-accent text-xs font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <p className="text-sm text-muted-foreground leading-relaxed">{t}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
