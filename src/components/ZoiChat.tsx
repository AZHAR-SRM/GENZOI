import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X, Sparkles, Loader2, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getClientId } from "@/lib/clientId";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zoi-chat`;

const WELCOME: Msg = {
  role: "assistant",
  content:
    "Hey, I'm **ZOI** — your open-knowledge research sidekick. Ask me anything: explain a paper, derive a formula, debug code, brainstorm episode angles, or just chat. ✨",
};

export default function ZoiChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [hydrated, setHydrated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hydrate ZOI history from DB once
  useEffect(() => {
    (async () => {
      try {
        const client_id = getClientId();
        const { data, error } = await supabase
          .from("zoi_messages")
          .select("role, content, created_at")
          .eq("client_id", client_id)
          .order("created_at", { ascending: true });
        if (error) throw error;
        if (data && data.length > 0) {
          setMessages([
            WELCOME,
            ...data
              .filter((r) => r.role === "user" || r.role === "assistant")
              .map((r) => ({ role: r.role as "user" | "assistant", content: r.content })),
          ]);
        }
      } catch (e) {
        console.error("ZOI history load failed", e);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const persist = async (role: "user" | "assistant", content: string) => {
    try {
      await supabase.from("zoi_messages").insert({
        client_id: getClientId(),
        role,
        content,
      });
    } catch (e) {
      console.error("ZOI persist failed", e);
    }
  };

  const clearHistory = async () => {
    try {
      await supabase
        .from("zoi_messages")
        .delete()
        .eq("client_id", getClientId());
      setMessages([WELCOME]);
      toast.success("ZOI history cleared");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't clear history");
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);
    persist("user", text);

    let assistantSoFar = "";
    let assistantStarted = false;
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        if (!assistantStarted) {
          assistantStarted = true;
          return [...prev, { role: "assistant", content: assistantSoFar }];
        }
        return prev.map((m, i) =>
          i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
        );
      });
    };

    try {
      // Send full conversation (excluding the static welcome) for context
      const history = next
        .filter((m, i) => !(i === 0 && m === WELCOME))
        .map((m) => ({ role: m.role, content: m.content }));

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (resp.status === 429) {
        toast.error("Rate limit hit — try again in a moment.");
        setLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast.error("AI credits exhausted. Add credits in workspace settings.");
        setLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error("Failed to start stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (assistantSoFar.trim()) {
        persist("assistant", assistantSoFar);
      }
    } catch (e) {
      console.error(e);
      toast.error("ZOI couldn't reply. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating launcher */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        aria-label="Open ZOI assistant"
        className="fixed bottom-5 right-5 z-[60] w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-2xl glow-primary flex items-center justify-center"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span
              key="msg"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="fixed bottom-24 right-5 z-[60] w-[min(92vw,380px)] h-[min(70vh,560px)] rounded-2xl glass-strong border border-border shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-gradient-to-r from-primary/15 to-transparent">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center glow-primary">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-foreground leading-tight">ZOI</div>
                <div className="text-[11px] text-muted-foreground">
                  {hydrated ? "Open-knowledge AI · history saved" : "Loading history…"}
                </div>
              </div>
              <button
                onClick={clearHistory}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                aria-label="Clear history"
                title="Clear history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-secondary text-foreground rounded-bl-md"
                    }`}
                  >
                    <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-pre:my-2 prose-code:text-primary">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-secondary text-muted-foreground rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ZOI is thinking…
                  </div>
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="border-t border-border p-3 bg-background/40">
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={1}
                  placeholder="Ask ZOI anything…"
                  className="flex-1 resize-none rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm px-3 py-2.5 max-h-32 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-colors glow-primary"
                  aria-label="Send"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
