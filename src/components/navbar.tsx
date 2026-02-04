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
                <nav className="flex items-center space-x-4">
                    <ThemeToggle />
                </nav>
            </div>
        </header>
    );
}
