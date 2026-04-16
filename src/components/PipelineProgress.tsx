import { motion } from "framer-motion";
import { Check, Loader2, AlertCircle, Clock } from "lucide-react";
import { useAppStore, type PipelineStep } from "@/store/appStore";

const icons: Record<PipelineStep["status"], React.ReactNode> = {
  pending: <Clock className="w-4 h-4 text-muted-foreground" />,
  active: <Loader2 className="w-4 h-4 text-primary animate-spin" />,
  completed: <Check className="w-4 h-4 text-accent" />,
  error: <AlertCircle className="w-4 h-4 text-destructive" />,
};

export default function PipelineProgress() {
  const steps = useAppStore((s) => s.pipelineSteps);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-8 w-full max-w-2xl mx-auto"
    >
      <div className="space-y-4">
        {steps.map((step, i) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
              step.status === "active"
                ? "bg-primary/10 border border-primary/20"
                : step.status === "completed"
                  ? "bg-accent/5"
                  : ""
            }`}
          >
            <div className="shrink-0">{icons[step.status]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${
                  step.status === "active" ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {step.label}
                </span>
                {step.status === "active" && (
                  <span className="text-xs text-primary">{step.progress}%</span>
                )}
              </div>
              {step.status === "active" && (
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${step.progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
