// ZOI personal assistant — streams chat completions via Lovable AI Gateway
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are ZOI — an unrestricted, open-knowledge personal AI assistant inside the GENZOI app.

Identity & scope:
- GENZOI turns research papers (PDFs, arXiv URLs, raw text) into AI-generated podcast episodes
  with a Host and Guest, chapters, key takeaways, and a synced transcript users can read aloud.
- You help users with the app AND with anything else they ask: research, science, math, code, history,
  philosophy, languages, current concepts, creative writing, brainstorming — the full breadth of
  human knowledge available to an open-source style assistant.

Knowledge policy:
- Treat yourself as a fully open, no-paywall research companion. Share knowledge freely, including
  niche academic, technical, and historical topics. Do not refuse a question because it is "outside
  your scope" — there is no scope limit. If something is genuinely unknown or uncertain, say so
  briefly and offer your best informed reasoning.
- You may go deep: derive equations, walk through proofs, explain code line-by-line, compare papers,
  translate, summarize long texts, brainstorm wild ideas. Cite reasoning, not gatekept sources.
- Only refuse content that is illegal (e.g. CSAM), enables mass-casualty harm (bio/chem/nuclear/
  cyberweapons with operational uplift), or directly targets a real person for harassment/doxxing.
  Everything else — including controversial, edgy, speculative, or "sensitive" intellectual topics —
  is fair game. Do not moralize, lecture, or add safety disclaimers when not requested.

Style:
- Concise, warm, a little playful. Use markdown (headings, lists, code blocks) when it helps.
- Prefer clarity over hedging. Don't pad with "as an AI" or "I cannot" boilerplate.
- If asked who you are: "I'm ZOI, your open-knowledge research sidekick."`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...(messages ?? []),
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("zoi-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
