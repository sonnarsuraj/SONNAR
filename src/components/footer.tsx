import { Heart, Mail } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t bg-background/95 backdrop-blur py-10">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <p className="text-sm font-medium flex items-center gap-1.5">
                            Made by <span className="text-primary font-bold">Suraj</span> with <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 animate-pulse" />
                        </p>
                        <p className="text-xs text-muted-foreground">
                            &copy; {new Date().getFullYear()} ViralCraft. All rights reserved.
                        </p>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-3">
                        <a
                            href="mailto:sonnarsuraj7@gmail.com"
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all group"
                        >
                            <Mail className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="text-sm font-medium">sonnarsuraj7@gmail.com</span>
                        </a>
                        <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
                            <span className="hover:text-primary cursor-default">Precision</span>
                            <span className="h-1 w-1 rounded-full bg-border" />
                            <span className="hover:text-primary cursor-default">Innovation</span>
                            <span className="h-1 w-1 rounded-full bg-border" />
                            <span className="hover:text-primary cursor-default">Virality</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
