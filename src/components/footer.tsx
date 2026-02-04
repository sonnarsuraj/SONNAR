export function Footer() {
    return (
        <footer className="border-t bg-background/95 backdrop-blur py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} SoraViral. Built for the future of creativity.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <a href="#" className="hover:text-primary transition-colors">Twitter</a>
                        <a href="#" className="hover:text-primary transition-colors">Discord</a>
                        <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
