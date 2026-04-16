import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Upload, Mic, BookOpen, Sparkles, Zap, ArrowRight, Headphones } from "lucide-react";
import Navbar from "@/components/Navbar";
import FeatureCard from "@/components/FeatureCard";
import SampleEpisode from "@/components/SampleEpisode";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "GENZOI — Turn Research Papers Into Podcasts" },
      { name: "description", content: "Upload a research paper and get an AI-generated podcast episode with distinct voices, synced transcripts, and an AI assistant." },
    ],
  }),
});

const features = [
  {
    icon: Upload,
    title: "Upload Any Paper",
    description: "Drop a PDF or paste an arXiv URL. We parse sections, figures, and references automatically.",
    gradient: "primary" as const,
  },
  {
    icon: Mic,
    title: "AI Podcast Generation",
    description: "Distinct host and guest voices discuss your paper in an engaging dialogue format.",
    gradient: "accent" as const,
  },
  {
    icon: BookOpen,
    title: "Synced Transcript",
    description: "Follow along with chapter-tagged transcripts that highlight in real-time as audio plays.",
    gradient: "warm" as const,
  },
  {
    icon: Sparkles,
    title: "Ask Zoi — AI Assistant",
    description: "Got questions? Zoi answers using the paper context with section citations, powered by AI.",
    gradient: "primary" as const,
  },
  {
    icon: Headphones,
    title: "Key Takeaways",
    description: "Auto-generated summaries, core contributions, and key findings at a glance.",
    gradient: "accent" as const,
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "From upload to podcast in minutes. Re-generate anytime with different styles.",
    gradient: "warm" as const,
  },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Ambient glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/8 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-accent/8 blur-[100px] pointer-events-none" />

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-8"
            >
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-medium text-muted-foreground">
                AI-Powered Research Podcasts
              </span>
            </motion.div>

            <h1 className="font-display font-bold text-5xl md:text-7xl lg:text-8xl leading-[0.95] mb-6 tracking-tight">
              <span className="text-foreground">Turn Papers Into</span>
              <br />
              <span className="text-gradient-primary">Podcasts</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              Upload a research paper. Get an AI-generated podcast episode with distinct voices,
              synced transcripts, and <strong className="text-foreground">Zoi</strong> — your AI assistant to answer questions.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/workspace"
                className="group px-8 py-4 rounded-2xl text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all glow-primary flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Upload Paper
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="px-8 py-4 rounded-2xl text-base font-semibold glass text-foreground hover:bg-secondary/80 transition-colors border border-border/50"
              >
                See How It Works
              </a>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features */}
      <section id="features" className="py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">Features</span>
            <h2 className="font-display font-bold text-3xl md:text-5xl text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              From paper upload to immersive podcast experience, all powered by AI.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={fadeUp}>
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Sample Episode */}
      <section className="py-28 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-accent mb-3 block">Preview</span>
            <h2 className="font-display font-bold text-3xl md:text-5xl text-foreground mb-4">
              Sample Episode
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Here's what a generated episode looks like.
            </p>
          </motion.div>

          <SampleEpisode />
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 relative">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-12 md:p-20 gradient-border relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="relative z-10">
              <h2 className="font-display font-bold text-3xl md:text-5xl text-foreground mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-8">
                Upload your first research paper and generate an episode in minutes.
              </p>
              <Link
                to="/workspace"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all glow-primary"
              >
                <Upload className="w-5 h-5" />
                Start Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border/50">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Headphones className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-sm text-foreground">GENZOI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 GENZOI. Turn research into conversations.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/workspace" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Workspace</Link>
            <Link to="/episodes" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Episodes</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
