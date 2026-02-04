import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // Basic validation for URL
        try {
            new URL(url);
        } catch {
            return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
        }

        // Fetch the page content safely with a more realistic User-Agent and advanced headers
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
                "Sec-Fetch-User": "?1",
                "Upgrade-Insecure-Requests": "1"
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        const html = await response.text();

        // Extract Title and Meta tags
        const titleMatch = html.match(/<meta\s+(?:property|name)="og:title"\s+content="([^"]+)"/i) ||
            html.match(/<title>([^<]+)<\/title>/i);
        const thumbnailMatch = html.match(/<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"/i) ||
            html.match(/<meta\s+(?:property|name)="twitter:image"\s+content="([^"]+)"/i);
        const descriptionMatch = html.match(/<meta\s+(?:property|name)="og:description"\s+content="([^"]+)"/i);

        let videoUrl = null;
        const platform = url.includes("youtube.com") || url.includes("youtu.be") ? "youtube" :
            url.includes("instagram.com") ? "instagram" :
                url.includes("facebook.com") ? "facebook" :
                    url.includes("sora.chatgpt.com") ? "sora" : "generic";

        console.log(`Extracting for platform: ${platform}`);

        // STRATEGY 1: Cobalt API (Smart Shortcut for YT, IG, FB)
        if (["youtube", "instagram", "facebook"].includes(platform)) {
            try {
                const cobaltRes = await fetch("https://api.cobalt.tools/api/json", {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        url: url,
                        vQuality: "1080",
                        filenameStyle: "pretty"
                    })
                });

                if (cobaltRes.ok) {
                    const cobaltData = await cobaltRes.json();
                    if (cobaltData.url) {
                        videoUrl = cobaltData.url;
                        console.log("Cobalt API Success:", videoUrl.slice(0, 50) + "...");
                    } else if (cobaltData.picker) {
                        videoUrl = cobaltData.picker[0].url;
                        console.log("Cobalt API Picker used.");
                    }
                }
            } catch (cobaltErr) {
                console.error("Cobalt API Error:", cobaltErr);
            }
        }

        // STRATEGY 2: Standard Meta Tags (Fallback)
        if (!videoUrl) {
            videoUrl = (
                html.match(/<meta\s+(?:property|name)="og:video:url"\s+content="([^"]+)"/i) ||
                html.match(/<meta\s+(?:property|name)="og:video"\s+content="([^"]+)"/i) ||
                html.match(/<meta\s+(?:property|name)="twitter:player:stream"\s+content="([^"]+)"/i)
            )?.[1];
        }

        // STRATEGY 3: Platform Specific Deep Extraction (Custom Regex)
        if (!videoUrl) {
            if (platform === "youtube") {
                const ytMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
                if (ytMatch) {
                    try {
                        const data = JSON.parse(ytMatch[1]);
                        const formats = [...(data.streamingData?.formats || []), ...(data.streamingData?.adaptiveFormats || [])];
                        // Get highest quality with a direct URL (filtering out signatureCipher for now)
                        const best = formats.filter(f => f.url).sort((a, b) => (b.width || 0) - (a.width || 0))[0];
                        if (best) videoUrl = best.url;
                    } catch (e) {
                        console.error("YouTube parse error:", e);
                    }
                }
            } else if (platform === "instagram") {
                const igMatch = html.match(/"video_url":"([^"]+)"/) || html.match(/"xd_url":"([^"]+)"/);
                if (igMatch) videoUrl = igMatch[1].replace(/\\u002f/gi, '/');
            } else if (platform === "facebook") {
                const fbMatch = html.match(/"hd_src":"([^"]+)"/) || html.match(/"sd_src":"([^"]+)"/) || html.match(/"browser_native_hd_url":"([^"]+)"/i);
                if (fbMatch) videoUrl = fbMatch[1].replace(/\\u002f/gi, '/');
            } else if (platform === "sora" || platform === "generic") {
                const soraRegexes = [
                    /"(https:\/\/persistent\.oaistatic\.com\/[^"]+\.mp4(?:\?[^"]+)?)"/i,
                    /"(https:\/\/cdn\.openai\.com\/[^"]+\.mp4(?:\?[^"]+)?)"/i,
                    /https?:\/\/[^"']+\.mp4[^"']*/i,
                    /"([^"]+\.mp4(?:\?[^"]+)?"|'[^']+\.mp4(?:\?[^']+)?')/i
                ];
                for (const r of soraRegexes) {
                    const m = html.match(r);
                    if (m) {
                        videoUrl = (m[1] || m[0]).replace(/\\u002f/gi, '/');
                        break;
                    }
                }
            }
        }

        // Final cleanup for videoUrl
        if (videoUrl) {
            videoUrl = videoUrl.replace(/&amp;/g, '&');
            if (videoUrl.startsWith('//')) videoUrl = 'https:' + videoUrl;
            else if (videoUrl.startsWith('/')) {
                const origin = new URL(url).origin;
                videoUrl = origin + videoUrl;
            }
        }

        console.log("Metadata Extracted:", {
            platform,
            title: titleMatch ? titleMatch[1].slice(0, 30) : "NONE",
            videoUrl: videoUrl ? "FOUND" : "NOT FOUND"
        });

        return NextResponse.json({
            metadata: {
                title: titleMatch ? titleMatch[1] : (platform === "youtube" ? "YouTube Video" : "AI Video"),
                thumbnail: thumbnailMatch ? thumbnailMatch[1] : null,
                description: videoUrl ? "Direct download link extracted successfully!" : "Platform is protecting this stream. Direct download restricted.",
                videoUrl: videoUrl
            }
        });

    } catch (error) {
        console.error("Metadata fetch error:", error);
        return NextResponse.json({
            metadata: {
                title: "Public Video",
                thumbnail: null,
                description: "Platform blocked direct extraction. Please try an external downloader."
            }
        });
    }
}
