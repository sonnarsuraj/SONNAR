import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// genAI will be initialized inside POST with the resolved key

export async function POST(req: Request) {
  try {
    const { type, value, mood, language } = await req.json();

    const modelName = "gemini-flash-latest";
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return NextResponse.json({
        error: "API Key is missing. Please check your Vercel Environment Variables or .env.local file."
      }, { status: 401 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from potentially markdown-fenced response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to generate valid JSON from AI");
    }

    const data = JSON.parse(jsonMatch[0]);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Generation error:", error);

    if (error.message?.includes("API_KEY_INVALID") || error.status === 401) {
      return NextResponse.json({
        error: "Invalid Gemini API Key. Please check your .env.local file."
      }, { status: 401 });
    }

    if (error.status === 429) {
      return NextResponse.json({
        error: "Quota Exceeded or Propagation Delay. If you just created your API key, please wait 2-5 minutes for it to activate. Also, check your quota at: https://aistudio.google.com/app/plan_and_billing"
      }, { status: 429 });
    }

    if (error.status === 404 || error.message?.includes("not found")) {
      return NextResponse.json({
        error: "Gemini Model not found. This might be a regional issue. Please check your API configuration."
      }, { status: 404 });
    }

    return NextResponse.json({ error: "Failed to generate content. Please try again later." }, { status: 500 });
  }
}
