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
    setMetadata(null);

    try {
      // 1. If it's a URL, first try to fetch metadata
      if (data.type === "url") {
        const metaRes = await fetch("/api/metadata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: data.value }),
        });
        const metaData = await metaRes.json();
        console.log("Metadata received:", metaData.metadata);
        setMetadata(metaData.metadata);
      }

      // 2. Generate content
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
              {metadata && metadata.thumbnail && (
                <div className="max-w-4xl mx-auto px-4 mb-8">
                  <div className="bg-card rounded-2xl border p-4 flex gap-4 items-center animate-fade-in shadow-sm">
                    <div className="relative h-20 w-36 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={metadata.thumbnail}
                        alt={metadata.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-foreground line-clamp-1">{metadata.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{metadata.description}</p>
                    </div>
                    {metadata.videoUrl && (
                      <div className="flex-shrink-0">
                        <a
                          href={metadata.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download="video.mp4"
                          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-md active:scale-95"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
