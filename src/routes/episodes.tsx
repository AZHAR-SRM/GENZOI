import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useAppStore } from "@/store/appStore";
import { Headphones, Trash2, Clock, FileText, BookOpen, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/episodes")({
  component: Episodes,
  head: () => ({
    meta: [
      { title: "Episodes — GENZOI" },
      { name: "description", content: "Browse all your generated podcast episodes." },
    ],
  }),
});

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function Episodes() {
  const episodes = useAppStore((s) => s.episodes);
  const setCurrentEpisode = useAppStore((s) => s.setCurrentEpisode);
  const removeEpisode = useAppStore((s) => s.removeEpisode);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-2 block">Library</span>
            <h1 className="font-display font-bold text-3xl md:text-5xl text-foreground mb-3">
              Your Episodes
            </h1>
            <p className="text-muted-foreground text-lg">
              All your generated podcast episodes in one place.
            </p>
          </motion.div>

          {episodes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl p-16 text-center gradient-border"
            >
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display font-semibold text-xl text-foreground mb-2">
                No Episodes Yet
              </h2>
              <p className="text-muted-foreground mb-6">
                Upload a research paper to generate your first episode.
              </p>
              <Link
                to="/workspace"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors glow-primary"
              >
                Go to Workspace
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {episodes.map((ep) => (
                <motion.div
                  key={ep.id}
                  variants={fadeUp}
                  className="glass rounded-2xl p-6 flex flex-col group hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
                      <Headphones className="w-5 h-5 text-primary" />
                    </div>
                    <button
                      onClick={() => removeEpisode(ep.id)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete episode"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-display font-semibold text-foreground mb-1.5 line-clamp-2 leading-snug">
                    {ep.episodeTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                    <FileText className="w-3 h-3" />
                    {ep.paperTitle}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-5 flex-1 leading-relaxed">
                    {ep.summary}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {new Date(ep.createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      to="/episode/$id"
                      params={{ id: ep.id }}
                      onClick={() => setCurrentEpisode(ep)}
                      className="group/btn px-4 py-2 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-all flex items-center gap-1.5"
                    >
                      Play
                      <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
