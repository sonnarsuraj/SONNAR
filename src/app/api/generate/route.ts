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
          "title": "ONE emoji + high curiosity SEO title + 2-3 viral hashtags. MUST BE STRICTLY BETWEEN 90 AND 100 CHARACTERS LONG.",
          "description": "Storytelling tone, natural emojis, and a heavy density of hashtags. Ratio: 30% title-context hashtags and 80% viral/trending hashtags (ensure total volume is high).",
          "tags": "comma-separated, lowercase, high-search niche keywords + viral tags"
        },
        "instagram": {
          "description": "Story-driven caption + hook + viral hashtags (all in one text block)"
        },
        "facebook": {
          "description": "Combined storytelling caption + viral hashtags (all in one text block)"
        }
      }

      REQUIRED ATTRIBUTES:
      - TONE: High energy, casual, and creator-friendly. 
      - EMOJIS: Use emojis frequently but naturally to boost engagement and readability.
      - READABILITY & SPACING: 
        - Use DOUBLE NEWLINES (\n\n) between major sections (Hook, Body, Storyline, Hashtags).
        - Ensure clear paragraph breaks.
        - Do not use markdown like bold (**) or bullet points (*) as they might look messy when copy-pasted to all platforms. Use plain text spacing instead.
      - HASHTAGS: 
        - YouTube description MUST have a high density of hashtags. 
        - Separate the hashtag block from the main text with three newlines (\n\n\n).
        - Place the hashtags in a clean, readable block.
      - YouTube: Title MUST start with an emoji, include 2-3 viral hashtags at the end, and be STRICTLY between 90 and 100 characters in total length.
      - YouTube: Description MUST include a clear "Storyline" approach.
      - Instagram: First line MUST be a "Hook" in ALL-CAPS text (do not use rich formatting like bold).
      - Facebook: Focus on community, storytelling, and relatability.
      - Use provided Mood (${mood}) to set the tone.
      - Output EVERYTHING in the specified Language (${language}).
      - STRICT RULE: DO NOT mention "AI", "Artificial Intelligence", "Sora", "OpenAI", or any specific AI technology in the output.
      - STRICT RULE: The content should sound 100% human-made and focus on the visual storytelling of the video itself, not how it was made.
      - Do not include any text other than the JSON object.
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
