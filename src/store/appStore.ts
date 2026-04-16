import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/integrations/supabase/client";
import { getClientId } from "@/lib/clientId";

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
  hydratedFromDb: boolean;

  setCurrentEpisode: (episode: Episode | null) => void;
  addEpisode: (episode: Episode) => Promise<void>;
  removeEpisode: (id: string) => Promise<void>;
  loadEpisodesFromDb: () => Promise<void>;
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

function rowToEpisode(r: any): Episode {
  return {
    id: r.id,
    paperTitle: r.paper_title,
    episodeTitle: r.episode_title,
    summary: r.summary ?? "",
    keyTakeaways: (r.key_takeaways ?? []) as string[],
    chapters: (r.chapters ?? []) as Chapter[],
    script: (r.script ?? []) as ScriptLine[],
    audioUrl: r.audio_url ?? undefined,
    createdAt: r.created_at,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentEpisode: null,
      episodes: [],
      pipelineSteps: [...defaultPipeline],
      isGenerating: false,
      currentTime: 0,
      hydratedFromDb: false,

      setCurrentEpisode: (episode) => set({ currentEpisode: episode }),

      addEpisode: async (episode) => {
        // optimistic local update
        set((state) => ({
          episodes: [episode, ...state.episodes.filter((e) => e.id !== episode.id)],
        }));
        // backup to db
        try {
          const client_id = getClientId();
          await supabase.from("episodes").insert({
            id: episode.id,
            client_id,
            paper_title: episode.paperTitle,
            episode_title: episode.episodeTitle,
            summary: episode.summary,
            key_takeaways: episode.keyTakeaways as any,
            chapters: episode.chapters as any,
            script: episode.script as any,
            audio_url: episode.audioUrl ?? null,
          });
        } catch (e) {
          console.error("Failed to back up episode", e);
        }
      },

      removeEpisode: async (id) => {
        set((state) => ({
          episodes: state.episodes.filter((e) => e.id !== id),
          currentEpisode: state.currentEpisode?.id === id ? null : state.currentEpisode,
        }));
        try {
          const client_id = getClientId();
          await supabase.from("episodes").delete().eq("id", id).eq("client_id", client_id);
        } catch (e) {
          console.error("Failed to delete episode from db", e);
        }
      },

      loadEpisodesFromDb: async () => {
        if (get().hydratedFromDb) return;
        try {
          const client_id = getClientId();
          const { data, error } = await supabase
            .from("episodes")
            .select("*")
            .eq("client_id", client_id)
            .order("created_at", { ascending: false });
          if (error) throw error;
          const remote = (data ?? []).map(rowToEpisode);
          // merge: remote is source of truth, keep any unsynced local episodes too
          const localOnly = get().episodes.filter((e) => !remote.find((r) => r.id === e.id));
          set({
            episodes: [...remote, ...localOnly],
            hydratedFromDb: true,
          });
        } catch (e) {
          console.error("Failed to load episodes", e);
          set({ hydratedFromDb: true });
        }
      },

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
