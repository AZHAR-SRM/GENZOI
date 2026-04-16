import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: "primary" | "accent" | "warm";
}

const gradientMap = {
  primary: "from-primary/20 to-primary/5",
  accent: "from-accent/20 to-accent/5",
  warm: "from-glow-warm/20 to-glow-warm/5",
};

export default function FeatureCard({ icon: Icon, title, description, gradient }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className={`glass rounded-2xl p-6 bg-gradient-to-br ${gradientMap[gradient]} transition-shadow duration-300`}
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientMap[gradient]} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-foreground" />
      </div>
      <h3 className="font-display font-semibold text-lg text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}
