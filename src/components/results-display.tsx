"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Youtube,
    Instagram,
    Facebook,
    Copy,
    Check,
    RefreshCcw,
    ChevronRight,
    MessageSquare,
    Hash,
    Type
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PlatformContent {
    title?: string;
    description: string;
    tags?: string;
    hashtags?: string;
}

export interface GenerationResult {
    youtube: PlatformContent;
    instagram: PlatformContent;
    facebook: PlatformContent;
}

interface ResultsDisplayProps {
    results: GenerationResult;
    onRegenerate: (platform: string) => void;
}

type Platform = "youtube" | "instagram" | "facebook";

export function ResultsDisplay({ results, onRegenerate }: ResultsDisplayProps) {
    const [activePlatform, setActivePlatform] = useState<Platform>("youtube");
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const platforms = [
        { id: "youtube", label: "YouTube", icon: Youtube, color: "text-red-500" },
        { id: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-500" },
        { id: "facebook", label: "Facebook", icon: Facebook, color: "text-blue-600" },
    ];

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const currentContent = results[activePlatform];

    return (
        <div className="mx-auto max-w-4xl w-full px-4 pb-20 animate-fade-in">
            <div className="bg-card glass-morphism rounded-3xl border shadow-2xl overflow-hidden">
                {/* Platform Selection */}
                <div className="flex border-b">
                    {platforms.map((p) => {
                        const Icon = p.icon;
                        return (
                            <button
                                key={p.id}
                                onClick={() => setActivePlatform(p.id as Platform)}
                                className={cn(
                                    "flex-1 flex flex-col items-center gap-1 py-6 transition-all relative",
                                    activePlatform === p.id
                                        ? "bg-primary/5"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <Icon className={cn("h-6 w-6", activePlatform === p.id ? p.color : "text-muted-foreground")} />
                                <span className="text-sm font-bold uppercase tracking-wider">{p.label}</span>
                                {activePlatform === p.id && (
                                    <motion.div
                                        layoutId="activePlatform"
                                        className="absolute bottom-0 left-0 right-0 h-1 bg-primary"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 sm:p-8 space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h3 className="text-xl sm:text-2xl font-outfit font-bold flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                Viral Strategy
                            </h3>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                                Optimized for {activePlatform}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    const all = [currentContent.title, currentContent.description, currentContent.tags || currentContent.hashtags].filter(Boolean).join("\n\n");
                                    handleCopy(all, "all");
                                }}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-all active:scale-95"
                            >
                                {copiedField === "all" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                {copiedField === "all" ? "Copied All" : "Copy All"}
                            </button>
                            <button
                                onClick={() => onRegenerate(activePlatform)}
                                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
                            >
                                <RefreshCcw className="h-4 w-4" />
                                <span className="hidden sm:inline">Regenerate</span>
                            </button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activePlatform}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {activePlatform === "youtube" && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                            <Type className="h-3 w-3" /> Catchy Title
                                        </label>
                                        <span className={cn(
                                            "text-[10px] font-medium px-2 py-0.5 rounded-full",
                                            (currentContent.title?.length || 0) > 100 ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                                        )}>
                                            {currentContent.title?.length || 0} / 100
                                        </span>
                                    </div>
                                    <div className="relative group">
                                        <textarea
                                            readOnly
                                            value={currentContent.title}
                                            className="w-full p-4 pr-12 bg-muted/20 border rounded-xl font-medium focus:outline-none resize-none text-base sm:text-lg"
                                        />
                                        <button
                                            onClick={() => handleCopy(currentContent.title || "", "title")}
                                            className="absolute top-2 right-2 p-2.5 rounded-lg bg-background/80 sm:bg-background/50 backdrop-blur opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-muted shadow-sm"
                                        >
                                            {copiedField === "title" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                        <MessageSquare className="h-3 w-3" /> Capturing Caption
                                    </label>
                                </div>
                                <div className="relative group">
                                    <textarea
                                        readOnly
                                        value={currentContent.description}
                                        className="w-full min-h-[300px] p-6 pr-12 bg-muted/20 border rounded-2xl leading-[1.8] focus:outline-none resize-none text-base font-medium whitespace-pre-wrap"
                                    />
                                    <button
                                        onClick={() => handleCopy(currentContent.description, "desc")}
                                        className="absolute top-2 right-2 p-2.5 rounded-lg bg-background/80 sm:bg-background/50 backdrop-blur opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-muted shadow-sm"
                                    >
                                        {copiedField === "desc" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {((activePlatform === "youtube" && currentContent.tags) || ((activePlatform === "instagram" || activePlatform === "facebook") && currentContent.hashtags)) && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                            <Hash className="h-3 w-3" /> {activePlatform === "youtube" ? "Potential Keywords" : "Hashtags"}
                                        </label>
                                        {(activePlatform === "instagram" || activePlatform === "facebook") && (
                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
                                                {currentContent.hashtags?.split(" ").length || 0} Hashtags
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative group">
                                        <div className="w-full p-4 pr-12 bg-muted/20 border rounded-xl flex flex-wrap gap-2 min-h-[60px]">
                                            {(currentContent.tags || currentContent.hashtags)?.split(activePlatform === "youtube" ? "," : " ").map((tag, i) => (
                                                <span key={i} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-[13px] font-medium">
                                                    {tag.trim()}
                                                </span>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => handleCopy(currentContent.tags || currentContent.hashtags || "", "tags")}
                                            className="absolute top-2 right-2 p-2.5 rounded-lg bg-background/80 sm:bg-background/50 backdrop-blur opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-muted shadow-sm"
                                        >
                                            {copiedField === "tags" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <div className="mt-8 flex justify-center opacity-40">
                <div className="inline-flex items-center gap-2 p-3 text-[10px] text-muted-foreground uppercase tracking-widest">
                    High Performance Content Engine
                </div>
            </div>
        </div>
    );
}

function Sparkles({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
        </svg>
    );
}
