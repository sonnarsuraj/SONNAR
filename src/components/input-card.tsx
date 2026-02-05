import { useState, useEffect } from "react";
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
    { id: "English", label: "English" },
    { id: "Hinglish", label: "Hinglish" },
    { id: "Hindi", label: "Hindi" },
    { id: "Marathi", label: "Marathi" },
];

interface InputCardProps {
    onGenerate: (data: { type: Tab; value: string; mood: string; language: string }) => void;
    isLoading: boolean;
}

export function InputCard({ onGenerate, isLoading }: InputCardProps) {
    const [activeTab, setActiveTab] = useState<Tab>("url");
    const [value, setValue] = useState("");
    const [mood, setMood] = useState("cinematic");
    const [language, setLanguage] = useState("English");

    // Load inputs from localStorage on initial mount
    useEffect(() => {
        const savedInputs = localStorage.getItem("viralCraftInputs");
        if (savedInputs) {
            try {
                const { activeTab: sTab, value: sValue, mood: sMood, language: sLanguage } = JSON.parse(savedInputs);
                if (sTab) setActiveTab(sTab);
                if (sValue) setValue(sValue);
                if (sMood) setMood(sMood);
                if (sLanguage) setLanguage(sLanguage);
            } catch (e) {
                console.error("Failed to parse saved inputs:", e);
            }
        }
    }, []);

    // Save inputs to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem("viralCraftInputs", JSON.stringify({ activeTab, value, mood, language }));
    }, [activeTab, value, mood, language]);

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
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                {activeTab === "url" ? "Video URL" : activeTab === "prompt" ? "AI Prompt" : "Video Description"}
                            </label>
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        const text = await navigator.clipboard.readText();
                                        if (text) setValue(text);
                                    } catch (err) {
                                        console.error("Paste failed:", err);
                                    }
                                }}
                                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider hover:bg-primary/20 transition-all active:scale-95"
                            >
                                <Sparkles className="h-3 w-3" />
                                Paste
                            </button>
                        </div>
                        <textarea
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={
                                activeTab === "url"
                                    ? "Paste video link (e.g. YouTube, Instagram...)"
                                    : activeTab === "prompt"
                                        ? "Paste the AI prompt used for the video..."
                                        : "Describe what's happening in the video..."
                            }
                            className="w-full min-h-[140px] p-4 bg-muted/30 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-base"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
