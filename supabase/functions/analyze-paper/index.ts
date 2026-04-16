// Analyzes paper text and returns a structured podcast episode JSON.
// Uses Lovable AI Gateway (no API key needed).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface AnalyzeBody {
  text: string;
  title?: string;
}

const SYSTEM_PROMPT = `You are an expert science communicator. You will be given the raw text of a research paper.
Produce a JSON podcast episode with a Host and Guest discussing the paper.

Rules:
- Base every claim on the actual paper content provided. Do NOT invent facts.
- 8-14 script lines, alternating Host/Guest, conversational, ~20-40 words each.
- 4-6 chapters covering the paper's real sections.
- 3-5 concrete key takeaways from the paper.
- timestamps in seconds, evenly spaced ~15-25s apart starting at 0.
- chapter startTime/endTime in seconds, ending around the last script line + 30.
- paperSection values must reference real section names from the paper.

Return ONLY valid JSON matching this schema:
{
  "paperTitle": string,
  "episodeTitle": string,
  "summary": string (2-3 sentences),
  "keyTakeaways": string[],
  "chapters": [{"title": string, "paperSection": string, "startTime": number, "endTime": number}],
  "script": [{"speaker": "Host"|"Guest", "text": string, "timestamp": number, "paperSection": string}]
}`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text, title }: AnalyzeBody = await req.json();
    if (!text || text.trim().length < 100) {
      return new Response(JSON.stringify({ error: "Paper text too short" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI gateway not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Trim to keep request fast and within limits
    const trimmed = text.slice(0, 30000);

    const userPrompt = `Paper title hint: ${title ?? "Unknown"}\n\nPaper text:\n${trimmed}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI error", aiRes.status, errText);
      return new Response(JSON.stringify({ error: "AI request failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const content = data.choices?.[0]?.message?.content ?? "{}";
    const episode = JSON.parse(content);

    return new Response(JSON.stringify({ episode }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-paper error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
