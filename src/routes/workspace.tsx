import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import UploadCard from "@/components/UploadCard";
import PipelineProgress from "@/components/PipelineProgress";
import { useAppStore, type Episode } from "@/store/appStore";
import { supabase } from "@/integrations/supabase/client";
import { extractPdfText, extractTextFromUrl } from "@/lib/pdf";

export const Route = createFileRoute("/workspace")({
  component: Workspace,
  head: () => ({
    meta: [
      { title: "Workspace — GENZOI" },
      { name: "description", content: "Upload a research paper to generate your AI podcast episode." },
    ],
  }),
});

function Workspace() {
  const navigate = useNavigate();
  const [uploaded, setUploaded] = useState(false);
  const { isGenerating, setIsGenerating, updatePipelineStep, resetPipeline, setCurrentEpisode, addEpisode } = useAppStore();

  const handleUpload = async (data: { type: string; content: string; file?: File }) => {
    setUploaded(true);
    setIsGenerating(true);
    resetPipeline();

    try {
      // Step 1: parse paper text
      updatePipelineStep("parse", { status: "active", progress: 20 });
      let paperText = "";
      let titleHint = data.content;

      if (data.type === "pdf" && data.file) {
        paperText = await extractPdfText(data.file);
        titleHint = data.file.name.replace(/\.pdf$/i, "");
      } else if (data.type === "url") {
        paperText = await extractTextFromUrl(data.content);
      } else {
        paperText = data.content;
      }

      if (!paperText || paperText.trim().length < 100) {
        throw new Error("Could not extract enough text from the paper.");
      }
      updatePipelineStep("parse", { status: "completed", progress: 100 });

      // Step 2: extract sections (visual)
      updatePipelineStep("extract", { status: "active", progress: 60 });
      await new Promise((r) => setTimeout(r, 200));
      updatePipelineStep("extract", { status: "completed", progress: 100 });

      // Step 3: AI script generation
      updatePipelineStep("script", { status: "active", progress: 30 });
      const { data: aiData, error } = await supabase.functions.invoke("analyze-paper", {
        body: { text: paperText, title: titleHint },
      });
      if (error) throw error;
      if (aiData?.error) throw new Error(aiData.error);
      const ep = aiData.episode;
      updatePipelineStep("script", { status: "completed", progress: 100 });

      // Step 4-6 visual
      for (const step of ["voices", "transcript", "audio"]) {
        updatePipelineStep(step, { status: "active", progress: 50 });
        await new Promise((r) => setTimeout(r, 150));
        updatePipelineStep(step, { status: "completed", progress: 100 });
      }

      const episode: Episode = {
        id: crypto.randomUUID(),
        paperTitle: ep.paperTitle ?? titleHint,
        episodeTitle: ep.episodeTitle ?? `${titleHint} — Deep Dive`,
        summary: ep.summary ?? "",
        keyTakeaways: ep.keyTakeaways ?? [],
        chapters: ep.chapters ?? [],
        script: ep.script ?? [],
        createdAt: new Date().toISOString(),
      };

      setIsGenerating(false);
      setCurrentEpisode(episode);
      addEpisode(episode);
      toast.success("Episode generated!");
      setTimeout(() => navigate({ to: "/episode/$id", params: { id: episode.id } }), 400);
    } catch (e) {
      console.error(e);
      setIsGenerating(false);
      setUploaded(false);
      resetPipeline();
      toast.error((e as Error).message || "Failed to analyze paper");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-display font-bold text-3xl md:text-5xl text-foreground mb-4">
              {uploaded ? "Analyzing Paper" : "Upload Your Paper"}
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              {uploaded
                ? "Reading your PDF and generating a real podcast script with AI."
                : "Upload a PDF, paste an arXiv URL, or type your paper text."}
            </p>
          </motion.div>

          {!uploaded ? (
            <UploadCard onUpload={handleUpload} disabled={isGenerating} />
          ) : (
            <PipelineProgress />
          )}
        </div>
      </div>
    </div>
  );
}
