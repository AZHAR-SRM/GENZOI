import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import UploadCard from "@/components/UploadCard";
import PipelineProgress from "@/components/PipelineProgress";
import { useAppStore, type Episode } from "@/store/appStore";

export const Route = createFileRoute("/workspace")({
  component: Workspace,
  head: () => ({
    meta: [
      { title: "Workspace — GENZOI" },
      { name: "description", content: "Upload a research paper to generate your AI podcast episode." },
    ],
  }),
});

const mockEpisode: Episode = {
  id: "demo-1",
  paperTitle: "Attention Is All You Need",
  episodeTitle: "The Transformer Revolution — Attention Is All You Need",
  summary: "A deep dive into the seminal paper that introduced the Transformer architecture, exploring self-attention mechanisms, multi-head attention, and why this model replaced recurrent architectures.",
  keyTakeaways: [
    "The Transformer eliminates recurrence entirely, relying solely on attention mechanisms.",
    "Multi-head attention allows the model to jointly attend to information from different representation subspaces.",
    "Positional encoding injects sequence order information without recurrence.",
    "The architecture achieves state-of-the-art results in machine translation with significantly less training time.",
  ],
  chapters: [
    { title: "Introduction", paperSection: "Section 1", startTime: 0, endTime: 60 },
    { title: "Background", paperSection: "Section 2", startTime: 60, endTime: 150 },
    { title: "Model Architecture", paperSection: "Section 3", startTime: 150, endTime: 360 },
    { title: "Self-Attention", paperSection: "Section 3.2", startTime: 360, endTime: 540 },
    { title: "Multi-Head Attention", paperSection: "Section 3.2.2", startTime: 540, endTime: 720 },
    { title: "Training", paperSection: "Section 5", startTime: 720, endTime: 900 },
    { title: "Results", paperSection: "Section 6", startTime: 900, endTime: 1080 },
    { title: "Conclusion", paperSection: "Section 7", startTime: 1080, endTime: 1200 },
  ],
  script: [
    { speaker: "Host", text: "Welcome to GENZOI! Today we're diving into one of the most influential papers in AI history — 'Attention Is All You Need.' Let's break it down.", timestamp: 0, paperSection: "Introduction" },
    { speaker: "Guest", text: "Thanks for having me! This paper fundamentally changed how we think about sequence modeling. Before Transformers, the dominant approach was recurrent neural networks.", timestamp: 15, paperSection: "Introduction" },
    { speaker: "Host", text: "Right, and RNNs had some serious limitations, especially when it came to long sequences. Can you explain what the key problem was?", timestamp: 35, paperSection: "Background" },
    { speaker: "Guest", text: "The main issue was sequential computation. RNNs process tokens one by one, which makes them slow to train and causes the vanishing gradient problem for long sequences.", timestamp: 50, paperSection: "Background" },
    { speaker: "Host", text: "So the Transformer solves this with attention. Walk us through how self-attention works.", timestamp: 75, paperSection: "Model Architecture" },
    { speaker: "Guest", text: "Self-attention computes a weighted sum of all positions in a sequence. Each position can attend to every other position in a single step — no recurrence needed. It uses queries, keys, and values.", timestamp: 90, paperSection: "Self-Attention" },
    { speaker: "Host", text: "And what about multi-head attention? Why not just use a single attention function?", timestamp: 120, paperSection: "Multi-Head Attention" },
    { speaker: "Guest", text: "Multiple heads allow the model to attend to different aspects simultaneously — syntax, semantics, positional relationships. It's like having multiple 'perspectives' on the same data.", timestamp: 140, paperSection: "Multi-Head Attention" },
    { speaker: "Host", text: "The results speak for themselves — state-of-the-art on machine translation benchmarks with much less training time.", timestamp: 170, paperSection: "Results" },
    { speaker: "Guest", text: "Exactly. And what's remarkable is how this architecture became the foundation for GPT, BERT, and virtually every modern language model.", timestamp: 190, paperSection: "Conclusion" },
  ],
  createdAt: new Date().toISOString(),
};

function Workspace() {
  const navigate = useNavigate();
  const [uploaded, setUploaded] = useState(false);
  const { isGenerating, setIsGenerating, updatePipelineStep, resetPipeline, setCurrentEpisode, addEpisode } = useAppStore();

  const handleUpload = async (_data: { type: string; content: string; file?: File }) => {
    setUploaded(true);
    setIsGenerating(true);
    resetPipeline();

    const steps = ["parse", "extract", "script", "voices", "transcript", "audio"];
    for (const step of steps) {
      updatePipelineStep(step, { status: "active", progress: 0 });
      for (let p = 0; p <= 100; p += 20) {
        await new Promise((r) => setTimeout(r, 300));
        updatePipelineStep(step, { progress: p });
      }
      updatePipelineStep(step, { status: "completed", progress: 100 });
    }

    setIsGenerating(false);
    setCurrentEpisode(mockEpisode);
    addEpisode(mockEpisode);
    setTimeout(() => navigate({ to: "/episode/$id", params: { id: mockEpisode.id } }), 500);
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
              {uploaded ? "Generating Episode" : "Upload Your Paper"}
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              {uploaded
                ? "Sit back while we turn your paper into a podcast."
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
