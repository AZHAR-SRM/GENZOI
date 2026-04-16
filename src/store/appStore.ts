import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Chapter {
  title: string;
  paperSection: string;
  startTime: number;
  endTime: number;
}

export interface ScriptLine {
  speaker: "Host" | "Guest";
  text: string;
  timestamp: number;
  paperSection: string;
}

export interface Episode {
  id: string;
  paperTitle: string;
  episodeTitle: string;
  summary: string;
  keyTakeaways: string[];
  chapters: Chapter[];
  script: ScriptLine[];
  audioUrl?: string;
  createdAt: string;
}

export interface PipelineStep {
  id: string;
  label: string;
  status: "pending" | "active" | "completed" | "error";
  progress: number;
}

interface AppState {
  currentEpisode: Episode | null;
  episodes: Episode[];
  pipelineSteps: PipelineStep[];
  isGenerating: boolean;
  currentTime: number;

  setCurrentEpisode: (episode: Episode | null) => void;
  addEpisode: (episode: Episode) => void;
  removeEpisode: (id: string) => void;
  updatePipelineStep: (id: string, updates: Partial<PipelineStep>) => void;
  setIsGenerating: (v: boolean) => void;
  setCurrentTime: (t: number) => void;
  resetPipeline: () => void;
}

const defaultPipeline: PipelineStep[] = [
  { id: "parse", label: "Parse Paper", status: "pending", progress: 0 },
  { id: "extract", label: "Extract Sections", status: "pending", progress: 0 },
  { id: "script", label: "Generate Script", status: "pending", progress: 0 },
  { id: "voices", label: "Create Voices", status: "pending", progress: 0 },
  { id: "transcript", label: "Render Transcript", status: "pending", progress: 0 },
  { id: "audio", label: "Build Audio", status: "pending", progress: 0 },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentEpisode: null,
      episodes: [],
      pipelineSteps: [...defaultPipeline],
      isGenerating: false,
      currentTime: 0,

      setCurrentEpisode: (episode) => set({ currentEpisode: episode }),
      addEpisode: (episode) =>
        set((state) => ({
          episodes: [episode, ...state.episodes.filter((e) => e.id !== episode.id)],
        })),
      removeEpisode: (id) =>
        set((state) => ({
          episodes: state.episodes.filter((e) => e.id !== id),
          currentEpisode: state.currentEpisode?.id === id ? null : state.currentEpisode,
        })),
      updatePipelineStep: (id, updates) =>
        set((state) => ({
          pipelineSteps: state.pipelineSteps.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),
      setIsGenerating: (v) => set({ isGenerating: v }),
      setCurrentTime: (t) => set({ currentTime: t }),
      resetPipeline: () =>
        set({ pipelineSteps: defaultPipeline.map((s) => ({ ...s })) }),
    }),
    {
      name: "genzoi-store",
      partialize: (state) => ({
        episodes: state.episodes,
        currentEpisode: state.currentEpisode,
      }),
    }
  )
);
