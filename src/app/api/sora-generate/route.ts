import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

function repairAndParseJSON(text: string) {
    try {
        return JSON.parse(text);
    } catch (e) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (innerE) {
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
            max_tokens: 2048,
            response_format: { type: "json_object" }
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Groq generation failed");
    }

    const data = await response.json();
    return repairAndParseJSON(data.choices[0].message.content);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            subject,
            action,
            characterDetails,
            cameraShot,
            cameraMovement,
            lighting,
            colorPalette,
            style,
            aspectRatio,
            motionSpeed
        } = body;

        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        const groqKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;

        const prompt = `
      You are an expert OpenAI Sora Prompt Engineer. Your goal is to transform a basic video concept into an ULTRA-DETAILED, cinematically extravagant Sora 2 prompt.

      INPUT CONCEPT:
      - Subject: ${subject || "User didn't specify"}
      - Action: ${action || "User didn't specify"}
      - Custom Character Reference: ${characterDetails || "None (Generate a new detailed character)"}
      - Camera Shot: ${cameraShot || "Cinematic"}
      - Camera Movement: ${cameraMovement || "Dynamic"}
      - Lighting: ${lighting || "Natural"}
      - Color Palette: ${colorPalette || "Vibrant"}
      - Style: ${style || "Realistic"}
      - Aspect Ratio: ${aspectRatio || "16:9"}
      - Motion Speed: ${motionSpeed || "Standard"}

      SORA PROMPT ENGINEERING RULES (ULTRA-DETAIL MODE):
      1. EXCESSIVE DETAIL: Do not just say "a cat". Describe the individual strands of fur, the way the light refracts through the pupils, the dust particles dancing in the air nearby, and the microscopic texture of the ground.
      2. CHARACTER CONSISTENCY: ${characterDetails ? `The user has provided a custom character. You MUST use the provided description (${characterDetails}) and expand on it while maintaining absolute visual consistency for Sora's multi-shot reference capabilities.` : "Create a vivid, unique character with highly specific visual anchors (scars, clothing textures, specific eye colors) that Sora can recognize consistently."}
      3. CINEMATOGRAPHY: Use professional terms (e.g., anamorphic bokeh, 35mm lens, global illumination, ray-traced shadows, subsurface scattering).
      4. STRUCTURE & SPACING: 
         - Use DOUBLE NEWLINES (\n\n) between major segments (Subject/Action, Environment, Lighting, Technical Camera Specs).
         - Ensure the final output is a clean, readable block without markdown characters like **.
      5. SORA 2 FEATURES: Include descriptions of complex interactions and consistent character features.
      6. LENGTH: The final prompt should be a massive, descriptive block of 150-250 words to ensure Sora captures every nuance.

      STRICT OUTPUT FORMAT (JSON ONLY):
      {
        "finalPrompt": "The full ULTRA-DETAILED Sora prompt with proper spacing (\n\n) here...",
        "breakdown": {
          "subjectDetails": "Exceedingly detailed description of the subject and action",
          "environment": "Hyper-specific details about the setting and atmosphere",
          "cinematography": "Technical details about camera and lighting",
          "styleNotes": "Specific artistic or realistic style notes"
        },
        "tips": ["Tip 1 for getting the best result", "Tip 2..."]
      }

      Do not include any text other than the JSON object.
    `;

        try {
            if (!apiKey || apiKey === "your_gemini_api_key_here") {
                throw new Error("Gemini API Key missing");
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // Use Pro for better prompt engineering
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return NextResponse.json(repairAndParseJSON(text));
        } catch (geminiError) {
            console.warn("Gemini failed, checking Groq fallback...");
            if (groqKey && groqKey !== "your_groq_api_key_here") {
                const groqData = await generateWithGroq(prompt, groqKey);
                return NextResponse.json(groqData);
            }
            throw geminiError;
        }
    } catch (error: any) {
        console.error("Sora generation failure:", error);
        return NextResponse.json({ error: error.message || "Failed to generate Sora prompt." }, { status: 500 });
    }
}
