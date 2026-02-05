import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sparkles } from "lucide-react";

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-14 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                        <span className="font-outfit text-xl font-bold tracking-tight">ViralCraft</span>
                    </Link>
                </div>
                <nav className="flex items-center space-x-6">
                    <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Home</Link>
                    <Link href="/sora" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                        Sora Studio
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 rounded-full font-bold">NEW</span>
                    </Link>
                    <ThemeToggle />
                </nav>
            </div>
        </header>
    );
}
