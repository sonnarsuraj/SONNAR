"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { SoraCard } from "@/components/sora-card";
import { Footer } from "@/components/footer";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, Check, Info, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingIndicator } from "@/components/loading-indicator";

interface SoraResult {
    finalPrompt: string;
    breakdown: {
        subjectDetails: string;
        environment: string;
        cinematography: string;
        styleNotes: string;
    };
    tips: string[];
}

export default function SoraPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<SoraResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Load results from localStorage on initial mount
    useEffect(() => {
        const savedResult = localStorage.getItem("soraStudioResult");
        if (savedResult) {
            try {
                setResult(JSON.parse(savedResult));
            } catch (e) {
                console.error("Failed to parse saved Sora result:", e);
            }
        }
    }, []);

    // Save results to localStorage whenever they change
    useEffect(() => {
        if (result) {
            localStorage.setItem("soraStudioResult", JSON.stringify(result));
        }
    }, [result]);

    const handleGenerate = async (data: any) => {
        setIsLoading(true);
        setResult(null);
        setError(null);

        try {
            const res = await fetch("/api/sora-generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to generate Sora prompt");
            const dataRes = await res.json();
            setResult(dataRes);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!result) return;
        navigator.clipboard.writeText(result.finalPrompt);
        setCopied(true);
        setTimeout(() => setCopied(null as any), 2000);
    };

    return (
        <main className="flex-1 flex flex-col min-h-screen">
            <Navbar />

            <div className="flex-1 py-12">
                <div className="container mx-auto px-4 mb-12 text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest"
                    >
                        <Sparkles className="h-3 w-3" />
                        Next-Gen Video Generation
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-outfit font-black tracking-tight"
                    >
                        Sora <span className="text-primary italic">Prompt</span> Studio
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground text-lg max-w-2xl mx-auto"
                    >
                        Design technical, cinematic, and hyper-realistic prompts for Sora 2.0 with professional cinematography controls.
                    </motion.p>
                </div>

                <SoraCard onGenerate={handleGenerate} isLoading={isLoading} />

                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="container mx-auto px-4 pb-20 max-w-4xl"
                        >
                            <div className="bg-card glass-morphism rounded-3xl border shadow-2xl overflow-hidden p-6 sm:p-10 space-y-8">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <h3 className="text-2xl font-outfit font-bold flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                        Advanced Sora Prompt
                                    </h3>
                                    <button
                                        onClick={handleCopy}
                                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        {copied ? "Copied Prompt" : "Copy Prompt"}
                                    </button>
                                </div>

                                <div className="relative group">
                                    <textarea
                                        readOnly
                                        value={result.finalPrompt}
                                        className="w-full min-h-[250px] p-8 bg-muted/20 border rounded-2xl leading-[1.8] focus:outline-none resize-none text-lg font-medium italic text-foreground/90 whitespace-pre-wrap"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                    <div className="space-y-4">
                                        <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary">
                                            <Info className="h-4 w-4" /> Technical Breakdown
                                        </h4>
                                        <div className="space-y-4">
                                            <div className="p-4 bg-muted/10 rounded-xl border-l-4 border-primary/40">
                                                <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Subject & Environment</p>
                                                <p className="text-sm leading-relaxed">{result.breakdown.subjectDetails} {result.breakdown.environment}</p>
                                            </div>
                                            <div className="p-4 bg-muted/10 rounded-xl border-l-4 border-primary/40">
                                                <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Cinematography & Style</p>
                                                <p className="text-sm leading-relaxed">{result.breakdown.cinematography} {result.breakdown.styleNotes}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary">
                                            <Lightbulb className="h-4 w-4" /> Pro Tips
                                        </h4>
                                        <div className="space-y-3">
                                            {result.tips.map((tip, i) => (
                                                <div key={i} className="flex gap-3 text-sm p-4 bg-primary/5 rounded-xl border border-primary/10">
                                                    <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                                                        {i + 1}
                                                    </div>
                                                    <p>{tip}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <div className="container mx-auto px-4 max-w-4xl mt-4">
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center font-medium">
                            {error}
                        </div>
                    </div>
                )}
            </div>

            <Footer />
            {isLoading && <LoadingIndicator />}
        </main>
    );
}
