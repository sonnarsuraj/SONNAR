"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";

const messages = [
    "Analyzing video idea...",
    "Extracting creative details...",
    "Crafting viral hooks for Instagram...",
    "Optimizing YouTube titles & descriptions...",
    "Finalizing Facebook storytelling captions...",
    "Almost ready! Polishing hashtags...",
];

export function LoadingIndicator() {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="relative inline-block">
                    <Loader2 className="h-16 w-16 text-primary animate-spin" />
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <div className="h-8 w-8 bg-primary/20 rounded-full blur-xl" />
                    </motion.div>
                </div>

                <div className="space-y-3">
                    <h2 className="text-2xl font-outfit font-bold text-foreground">
                        Analyzing Content...
                    </h2>
                    <div className="h-8 overflow-hidden relative">
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={currentMessageIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-muted-foreground font-medium"
                            >
                                {messages[currentMessageIndex]}
                            </motion.p>
                        </AnimatePresence>
                    </div>
                </div>

                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 15, ease: "linear" }}
                    />
                </div>

                <div className="flex justify-center gap-4 text-xs font-medium text-muted-foreground/60 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Secure</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Precise</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Viral</span>
                </div>
            </div>
        </div>
    );
}
