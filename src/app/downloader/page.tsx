"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Link as LinkIcon, AlertCircle, Youtube, Instagram, Facebook, Sparkles, Loader2, CheckCircle2 } from "lucide-react";

export default function DownloaderPage() {
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [metadata, setMetadata] = useState<any>(null);

    const handleDownload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setIsLoading(true);
        setError(null);
        setMetadata(null);

        try {
            const res = await fetch("/api/metadata", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to fetch video details");

            if (data.metadata) {
                setMetadata(data.metadata);
            } else {
                throw new Error("No video details found for this link");
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please check your URL.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex-1 flex flex-col min-h-screen">
            <Navbar />

            <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 bg-gradient-to-b from-background to-muted/20">
                <div className="max-w-3xl w-full space-y-12">
                    {/* Header Section */}
                    <div className="text-center space-y-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wide uppercase mb-4"
                        >
                            <Sparkles className="h-4 w-4" />
                            Universal Downloader
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-bold font-outfit tracking-tight"
                        >
                            Save Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-400">Viral Moments</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-muted-foreground max-w-2xl mx-auto"
                        >
                            Download high-quality videos from YouTube, Instagram, Facebook, and Sora with a single click. No watermarks, just pure content.
                        </motion.p>
                    </div>

                    {/* Input Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative"
                    >
                        <form onSubmit={handleDownload} className="relative group">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                                <LinkIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Paste YouTube, Reels, or Facebook link here..."
                                className="w-full h-16 pl-14 pr-36 bg-card border-2 border-border rounded-2xl text-lg font-medium focus:outline-none focus:border-primary/50 transition-all shadow-xl placeholder:text-muted-foreground/50"
                            />
                            <div className="absolute inset-y-2 right-2 flex items-center">
                                <button
                                    type="submit"
                                    disabled={isLoading || !url}
                                    className="h-full px-8 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Download className="h-5 w-5" />
                                            <span>Get Video</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Platform Icons */}
                        <div className="flex justify-center gap-8 mt-6 text-muted-foreground/40">
                            <Youtube className="h-6 w-6" />
                            <Instagram className="h-6 w-6" />
                            <Facebook className="h-6 w-6" />
                            <span className="font-bold text-xs uppercase tracking-widest mt-1">Sora</span>
                        </div>
                    </motion.div>

                    {/* Results/Feedback Section */}
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3"
                            >
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        {metadata && (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-card glass-morphism rounded-3xl border shadow-2xl overflow-hidden p-6 md:p-8"
                            >
                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    <div className="relative w-full md:w-64 aspect-video bg-muted rounded-2xl overflow-hidden shadow-lg border">
                                        {metadata.thumbnail ? (
                                            <img
                                                src={metadata.thumbnail}
                                                alt={metadata.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Youtube className="h-12 w-12 text-muted-foreground/20" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/60 text-white text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border border-white/10">
                                            HD Ready
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-6">
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold font-outfit leading-tight line-clamp-2">{metadata.title}</h3>
                                            <p className="text-muted-foreground text-sm line-clamp-2">{metadata.description}</p>
                                        </div>

                                        <div className="pt-2 space-y-6">
                                            {metadata.videoUrl ? (
                                                <div className="space-y-6">
                                                    {/* Video Preview Player */}
                                                    <div className="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-inner border border-white/5 ring-1 ring-white/10">
                                                        <video
                                                            src={metadata.videoUrl}
                                                            controls
                                                            className="w-full h-full object-contain"
                                                            poster={metadata.thumbnail}
                                                        >
                                                            Your browser does not support the video tag.
                                                        </video>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2 text-green-500 text-sm font-medium">
                                                                <CheckCircle2 className="h-4 w-4" />
                                                                <span>Stream Optimized</span>
                                                            </div>
                                                            {/* Smart AI Pulse */}
                                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/5 border border-primary/10">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-sm shadow-primary/40" />
                                                                <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Smart AI Link Active</span>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {/* Direct Download */}
                                                            <a
                                                                href={metadata.videoUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center justify-center gap-3 w-full py-4 bg-muted text-foreground rounded-2xl font-bold hover:bg-muted/80 transition-all active:scale-95 border"
                                                            >
                                                                <Download className="h-5 w-5" />
                                                                Direct Link
                                                            </a>

                                                            {/* Smart Mirror (Proxy) */}
                                                            <a
                                                                href={`/api/download?url=${encodeURIComponent(metadata.videoUrl)}&filename=${encodeURIComponent(metadata.title || "viralcraft_video")}.mp4`}
                                                                className="flex items-center justify-center gap-3 w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95 text-center"
                                                            >
                                                                <Sparkles className="h-5 w-5" />
                                                                Smart Mirror
                                                            </a>
                                                        </div>

                                                        {/* External Mirrors */}
                                                        <div className="flex flex-wrap items-center justify-center gap-4 py-2 opacity-60 hover:opacity-100 transition-opacity">
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-full text-center">External Fallbacks</p>
                                                            <a href={`https://snapsave.app/`} target="_blank" className="text-xs hover:text-primary transition-colors">SnapSave</a>
                                                            <a href={`https://en.savefrom.net/`} target="_blank" className="text-xs hover:text-primary transition-colors">SaveFrom</a>
                                                            <a href={`https://fdown.net/`} target="_blank" className="text-xs hover:text-primary transition-colors">FDown</a>
                                                        </div>

                                                        {/* Native Fallback Guidance */}
                                                        <div className="p-4 rounded-xl bg-muted/40 border border-border/50 text-center space-y-2">
                                                            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">
                                                                Developer Pro Tip
                                                            </p>
                                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                                If buttons fail, use the <strong>Smart Mirror</strong> or <strong>right-click</strong> the player to "Save Video As". Mirroring bypasses 99% of blocks.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-6 rounded-2xl bg-muted/30 border border-dashed border-muted-foreground/20 text-center">
                                                    <AlertCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                                                    <p className="text-sm text-muted-foreground">
                                                        Extraction logic is being shielded by platform security. <br />
                                                        <strong>Try the Smart Mirror or an External Fallback.</strong>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <Footer />
        </main>
    );
}
