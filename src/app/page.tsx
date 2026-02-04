"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { InputCard } from "@/components/input-card";
import { ResultsDisplay, GenerationResult } from "@/components/results-display";
import { LoadingIndicator } from "@/components/loading-indicator";
import { Footer } from "@/components/footer";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ExternalLink } from "lucide-react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<GenerationResult | null>(null);
  const [metadata, setMetadata] = useState<any>(null);

  const handleGenerate = async (data: { type: string; value: string; mood: string; language: string }) => {
    setIsLoading(true);
    setResults(null);
    // setMetadata(null); // Removed metadata state update

    try {
      // 1. Generate content
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Generation failed");
      }

      const result = await res.json();
      setResults(result);
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = (platform: string) => {
    // In a real app, you might want to only regenerate one platform
    // For now, let's keep it simple and just log or use the last data
    console.log("Regenerating for:", platform);
  };

  return (
    <main className="flex-1 flex flex-col">
      <Navbar />

      <div className="flex-1">
        <Hero />

        <InputCard onGenerate={handleGenerate} isLoading={isLoading} />

        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="container mx-auto"
            >
              {/* Removed metadata display UI */}

              <ResultsDisplay
                results={results}
                onRegenerate={handleRegenerate}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />

      {isLoading && <LoadingIndicator />}
    </main>
  );
}
