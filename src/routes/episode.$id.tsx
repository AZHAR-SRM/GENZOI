import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import EpisodePlayer from "@/components/EpisodePlayer";
import TranscriptPanel from "@/components/TranscriptPanel";
import ChapterSidebar from "@/components/ChapterSidebar";
import TakeawayCards from "@/components/TakeawayCards";
import { useAppStore } from "@/store/appStore";
import { FileText, Calendar, Layers } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/episode/$id")({
  component: EpisodePage,
  head: () => ({
    meta: [
      { title: "Episode — GENZOI" },
      { name: "description", content: "Listen to your AI-generated podcast episode." },
    ],
  }),
});

function EpisodePage() {
  const episode = useAppStore((s) => s.currentEpisode);

  if (!episode) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display font-semibold text-xl text-foreground mb-2">No Episode Found</h2>
            <p className="text-muted-foreground mb-4">Upload a paper first to generate an episode.</p>
            <Link
              to="/workspace"
              className="inline-flex px-6 py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors glow-primary"
            >
              Go to Workspace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const duration = Math.ceil((episode.chapters[episode.chapters.length - 1]?.endTime || 0) / 60);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                Episode
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(episode.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl md:text-4xl text-foreground mb-3 leading-tight">
              {episode.episodeTitle}
            </h1>
            <p className="text-muted-foreground max-w-3xl leading-relaxed">{episode.summary}</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: chapters */}
            <div className="lg:col-span-3 space-y-6">
              <ChapterSidebar chapters={episode.chapters} />
              <TakeawayCards takeaways={episode.keyTakeaways} />
            </div>

            {/* Center: player + transcript */}
            <div className="lg:col-span-6 space-y-6">
              <EpisodePlayer episode={episode} />
              <TranscriptPanel script={episode.script} />
            </div>

            {/* Right: stats + export */}
            <div className="lg:col-span-3 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  Paper Stats
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Chapters", value: episode.chapters.length, icon: "📑" },
                    { label: "Script Lines", value: episode.script.length, icon: "📝" },
                    { label: "Duration", value: `${duration} min`, icon: "⏱️" },
                    { label: "Takeaways", value: episode.keyTakeaways.length, icon: "💡" },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>{stat.icon}</span>
                        {stat.label}
                      </span>
                      <span className="text-sm font-bold text-foreground">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-6"
              >
                <h3 className="font-display font-semibold text-foreground mb-4">Export</h3>
                <div className="space-y-2.5">
                  <button className="w-full py-3 rounded-xl text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-primary/20">
                    Download MP3
                  </button>
                  <button className="w-full py-3 rounded-xl text-sm font-semibold bg-accent/10 text-accent hover:bg-accent/20 transition-all border border-accent/20">
                    Export Transcript
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
