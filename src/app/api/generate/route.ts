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
    const groqKey = process.env.GROQ_API_KEY;

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
          "title": "ONE emoji + high curiosity SEO title (<100 chars)",
          "description": "Storytelling tone, natural emojis, many viral hashtags, optimized for Shorts/long form",
          "tags": "comma-separated, lowercase, high-search niche keywords"
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
      - READABILITY: Use short sentences, line breaks, and clear bullet points.
      - HASHTAGS: Use a 50/50 mix of Niche-Specific tags (related to the exact topic) and High-Reach Viral tags (e.g., #viral, #trending, #explorepage).
      - YouTube: Title MUST start with an emoji.
      - YouTube: Description MUST include a "Storyline" approach.
      - Instagram: First line MUST be a "Hook" in all-caps or bold-style text.
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
      console.warn("Gemini failed, falling back to Groq:", geminiError.message || geminiError);

      // 2. Fallback to Groq
      if (groqKey && groqKey !== "your_groq_api_key_here") {
        try {
          const groqData = await generateWithGroq(prompt, groqKey);
          return NextResponse.json(groqData);
        } catch (groqError: any) {
          console.error("Groq fallback also failed:", groqError.message || groqError);
          throw new Error("All AI providers are currently unavailable. Please try again later.");
        }
      } else {
        throw geminiError; // Rethrow Gemini error if no Groq key available
      }
    }
  } catch (error: any) {
    console.error("Content generation error:", error);

    const status = error.message?.includes("missing") ? 401 : 500;
    return NextResponse.json({
      error: error.message || "Failed to generate content. Please try again later."
    }, { status });
  }
}
