import { ArrowRight, Video, Sparkles } from "lucide-react";

export function Hero() {
    return (
        <div className="relative isolate px-6 pt-14 lg:px-8 hero-gradient">
            <div className="mx-auto max-w-2xl py-12 sm:py-20">
                <div className="text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-muted-foreground ring-1 ring-border hover:ring-primary/50 transition-all animate-fade-in">
                            The ultimate toolkit for creators and storytellers 🚀
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl font-outfit animate-fade-in" style={{ animationDelay: "100ms" }}>
                        Turn Your Videos into <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-400">Viral Content</span> Instantly
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground animate-fade-in" style={{ animationDelay: "200ms" }}>
                        Paste your video URL, prompt, or description and let our engine
                        craft the perfect titles, captions, and hashtags for YouTube, Instagram, and Facebook.
                    </p>

                </div>
            </div>
        </div>
    );
}
