"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, MessageSquare, FileText, Sparkles, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "url" | "prompt" | "describe";

const moods = [
    { id: "funny", label: "Funny", icon: "😂" },
    { id: "cinematic", label: "Cinematic", icon: "🎬" },
    { id: "emotional", label: "Emotional", icon: "😢" },
    { id: "horror", label: "Horror", icon: "👻" },
    { id: "cute", label: "Cute", icon: "🥺" },
    { id: "realistic", label: "Realistic", icon: "📷" },
];

const languages = [
    { id: "en", label: "English" },
    { id: "es", label: "Spanish" },
    { id: "fr", label: "French" },
    { id: "de", label: "German" },
];

interface InputCardProps {
    onGenerate: (data: { type: Tab; value: string; mood: string; language: string }) => void;
    isLoading: boolean;
}

export function InputCard({ onGenerate, isLoading }: InputCardProps) {
    const [activeTab, setActiveTab] = useState<Tab>("url");
    const [value, setValue] = useState("");
    const [mood, setMood] = useState("cinematic");
    const [language, setLanguage] = useState("en");

    const tabs = [
        { id: "url", label: "Paste Video URL", icon: Link2 },
        { id: "prompt", label: "Paste Prompt", icon: MessageSquare },
        { id: "describe", label: "Describe Video", icon: FileText },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!value.trim()) return;
        onGenerate({ type: activeTab, value, mood, language });
    };

    return (
        <div className="mx-auto max-w-3xl w-full px-4 mb-20 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <div className="bg-card glass-morphism rounded-2xl border shadow-xl overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all relative",
                                    activeTab === tab.id
                                        ? "text-primary bg-primary/5"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <textarea
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={
                                activeTab === "url"
                                    ? "Paste Sora or AI video link (e.g. https://sora.com/video/123...)"
                                    : activeTab === "prompt"
                                        ? "Paste the AI prompt used to generate the video..."
                                        : "Describe what's happening in the video in your own words..."
                            }
                            className="w-full min-h-[120px] p-4 bg-muted/30 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-base"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Mood Selector */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                                Video Mood
                            </label>
                            <div className="relative">
                                <select
                                    value={mood}
                                    onChange={(e) => setMood(e.target.value)}
                                    className="w-full p-3 bg-muted/30 border rounded-xl appearance-none outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                >
                                    {moods.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.icon} {m.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>

                        {/* Language Selector */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                                Language
                            </label>
                            <div className="relative">
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full p-3 bg-muted/30 border rounded-xl appearance-none outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                >
                                    {languages.map((l) => (
                                        <option key={l.id} value={l.id}>
                                            {l.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !value.trim()}
                        className="w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                    >
                        {isLoading ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Sparkles className="h-5 w-5" />
                                Generate Viral Content
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
