import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// genAI will be initialized inside POST with the resolved key

function repairAndParseJSON(text: string) {
  try {
    // 1. Try standard parse first
    return JSON.parse(text);
  } catch (e) {
    // 2. Try to extract from markdown blocks or generic braces
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerE) {
        // 3. Last ditch: try to clean common AI mistakes (trailing commas, etc)
        const cleaned = jsonMatch[0]
          .replace(/,\s*\}/g, "}")
          .replace(/,\s*\]/g, "]");
        return JSON.parse(cleaned);
      }
    }
    throw new Error("Could not find or repair valid JSON in AI response");
  }
}

async function generateWithGroq(prompt: string, apiKey: string) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Groq generation failed");
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  return repairAndParseJSON(content);
}

export async function POST(req: Request) {
  try {
    const { type, value, mood, language } = await req.json();

    const modelName = "gemini-flash-latest";
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;

    // Diagnostic logging for Vercel
    console.log("Environment Diagnostic:", {
      hasGemini: !!apiKey,
      geminiPrefix: apiKey ? apiKey.substring(0, 7) + "..." : "none",
      hasGroq: !!groqKey,
      groqPrefix: groqKey ? groqKey.substring(0, 7) + "..." : "none"
    });

    const prompt = `
      You are a world-class viral content strategist and social media growth expert.
      Your task is to generate high-quality, viral-ready captions, titles, and tags for a video based on the following input:
      
      Input Type: ${type}
      Content: ${value}
      Mood: ${mood}
      Language: ${language}

      STRICT OUTPUT FORMAT (JSON ONLY):
      {
        "youtube": {
          "title": "ONE emoji + SEO Title + 2-3 Hashtags. (90-100 chars)",
          "description": "Engaging narrative with clear paragraph breaks and a massive hashtag block at the end."
        },
        "instagram": {
          "description": "HOOK IN ALL-CAPS\\n\\nNarrative body with emojis...\\n\\n#viral #hashtags"
        },
        "facebook": {
          "description": "Engaging Hook...\\n\\nRelatable Storyline...\\n\\n#hashtags"
        }
      }

      REQUIRED ATTRIBUTES (CRITICAL):
      - NO WALL OF TEXT: You MUST have at least 2-3 distinct paragraphs for EVERY caption.
      - DOUBLE NEWLINES: Use \n\n between EVERY section. 
      - INSTAGRAM & FACEBOOK FORMAT: 
        1. HOOK (One short sentence, all-caps for Instagram).
        2. [Double Newline]
        3. STORY/BODY (2-3 sentences explaining the vibe).
        4. [Double Newline]
        5. HASHTAG BLOCK (Dense and viral).
      - NO MARKDOWN: Never use **bold** or *italics*. Use pure text and emojis only.
      - YouTube: Title MUST start with emoji and include hashtags (STRICTLY 90-100 chars).
      - Tone: ${mood}. Language: ${language}.
      - Output ONLY JSON.
    `;

    try {
      // 1. Try Gemini first
      if (!apiKey || apiKey === "your_gemini_api_key_here") {
        throw new Error("Gemini API Key missing");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return NextResponse.json(repairAndParseJSON(text));
    } catch (geminiError: any) {
      console.warn("Gemini failed, checking Groq fallback...");

      // 2. Fallback to Groq
      const isGroqConfigured = groqKey && groqKey !== "your_groq_api_key_here" && groqKey.length > 5;

      if (isGroqConfigured) {
        try {
          console.log("Attempting fallback with Groq...");
          const groqData = await generateWithGroq(prompt, groqKey!);
          return NextResponse.json(groqData);
        } catch (groqError: any) {
          console.error("Groq fallback also failed:", groqError.message || groqError);
          throw new Error(`Primary engine (Gemini) hit a limit and secondary engine (Groq) failed: ${groqError.message}`);
        }
      } else {
        const detail = !groqKey ? "GROQ_API_KEY is missing" : "GROQ_API_KEY is too short/invalid";
        console.error(`Groq fallback skipped: ${detail}`);

        if (geminiError.message?.includes("429") || geminiError.message?.includes("quota")) {
          throw new Error(`Gemini quota exceeded. Groq fallback failed because: ${detail}. Please ensure you've redeployed your Vercel app after adding the keys.`);
        }
        throw geminiError;
      }
    }
  } catch (error: any) {
    console.error("Critical failure in content generation pipeline:", error);

    const status = error.message?.includes("missing") || error.message?.includes("not configured") ? 401 : 500;
    return NextResponse.json({
      error: error.message || "Failed to generate content. Please try again later."
    }, { status });
  }
}
