import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const videoUrl = searchParams.get("url");
    const filename = searchParams.get("filename") || "viralcraft_video.mp4";

    if (!videoUrl) {
        return new Response("URL is required", { status: 400 });
    }

    try {
        const response = await fetch(videoUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch video: ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type") || "video/mp4";

        // Stream the response back to the client
        return new Response(response.body, {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Cache-Control": "no-cache",
            },
        });
    } catch (error: any) {
        console.error("Download proxy error:", error);
        return new Response(`Download failed: ${error.message}`, { status: 500 });
    }
}
