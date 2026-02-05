import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Video,
    Camera,
    Sun,
    Palette,
    Wind,
    Maximize,
    Sparkles,
    ChevronDown,
    Type,
    Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

const shotTypes = ["Cinematic", "Close-up", "Wide Shot", "Extreme Close-up", "Drone Shot", "POV", "Low Angle", "High Angle"];
const movements = ["Static", "Dynamic", "Pan", "Tilt", "Dolly Zoom", "Tracking", "Handheld", "Crane Shot"];
const lightingStyles = ["Natural Sunlight", "Golden Hour", "Cyberpunk Neon", "Soft Studio", "Moonlight", "High Contrast", "Moody", "Volumetric"];
const colorPalettes = ["Vibrant", "Desaturated", "Monochrome", "Pastel", "Warm", "Cool", "Teal & Orange", "Cinematic Film"];
const styles = ["Hyper-Realistic", "3D Animation", "Claymation", "Vintage Film", "Dreamlike", "Surreal", "Cybernetic", "Oil Painting"];
const aspectRatios = ["16:9", "9:16", "1:1", "21:9", "4:3"];
const motionSpeeds = ["Standard", "Slow Motion", "Fast-Paced", "Time-lapse"];

interface SoraCardProps {
    onGenerate: (data: any) => void;
    isLoading: boolean;
}

export function SoraCard({ onGenerate, isLoading }: SoraCardProps) {
    const [subject, setSubject] = useState("");
    const [action, setAction] = useState("");
    const [characterDetails, setCharacterDetails] = useState("");
    const [isCustomCharacter, setIsCustomCharacter] = useState(false);
    const [cameraShot, setCameraShot] = useState("Cinematic");
    const [cameraMovement, setCameraMovement] = useState("Dynamic");
    const [lighting, setLighting] = useState("Natural Sunlight");
    const [palette, setPalette] = useState("Vibrant");
    const [style, setStyle] = useState("Hyper-Realistic");
    const [aspectRatio, setAspectRatio] = useState("16:9");
    const [motionSpeed, setMotionSpeed] = useState("Standard");

    // Load inputs from localStorage on initial mount
    useEffect(() => {
        const savedInputs = localStorage.getItem("soraStudioInputs");
        if (savedInputs) {
            try {
                const saved = JSON.parse(savedInputs);
                if (saved.subject) setSubject(saved.subject);
                if (saved.action) setAction(saved.action);
                if (saved.characterDetails) setCharacterDetails(saved.characterDetails);
                if (saved.isCustomCharacter !== undefined) setIsCustomCharacter(saved.isCustomCharacter);
                if (saved.cameraShot) setCameraShot(saved.cameraShot);
                if (saved.cameraMovement) setCameraMovement(saved.cameraMovement);
                if (saved.lighting) setLighting(saved.lighting);
                if (saved.palette) setPalette(saved.palette);
                if (saved.style) setStyle(saved.style);
                if (saved.aspectRatio) setAspectRatio(saved.aspectRatio);
                if (saved.motionSpeed) setMotionSpeed(saved.motionSpeed);
            } catch (e) {
                console.error("Failed to parse saved Sora inputs:", e);
            }
        }
    }, []);

    // Save inputs to localStorage whenever they change
    useEffect(() => {
        const inputs = {
            subject,
            action,
            characterDetails,
            isCustomCharacter,
            cameraShot,
            cameraMovement,
            lighting,
            palette,
            style,
            aspectRatio,
            motionSpeed
        };
        localStorage.setItem("soraStudioInputs", JSON.stringify(inputs));
    }, [subject, action, characterDetails, isCustomCharacter, cameraShot, cameraMovement, lighting, palette, style, aspectRatio, motionSpeed]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate({
            subject,
            action,
            characterDetails: isCustomCharacter ? characterDetails : null,
            cameraShot,
            cameraMovement,
            lighting,
            colorPalette: palette,
            style,
            aspectRatio,
            motionSpeed
        });
    };

    return (
        <div className="mx-auto max-w-4xl w-full px-4 mb-20">
            <div className="bg-card glass-morphism rounded-3xl border shadow-2xl overflow-hidden">
                <div className="p-6 sm:p-10 space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <Video className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-outfit font-bold">Sora Prompt Engine</h2>
                            <p className="text-sm text-muted-foreground">Studio-grade video prompt generator</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Main Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1">
                                    <Type className="h-3 w-3" /> Subject
                                </label>
                                <textarea
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g. A majestic white lion with blue eyes..."
                                    className="w-full h-32 p-4 bg-muted/30 border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1">
                                    <Layers className="h-3 w-3" /> Core Action
                                </label>
                                <textarea
                                    value={action}
                                    onChange={(e) => setAction(e.target.value)}
                                    placeholder="e.g. Walking through a futuristic Tokyo street at night..."
                                    className="w-full h-32 p-4 bg-muted/30 border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none text-base"
                                />
                            </div>
                        </div>

                        {/* Character Consistency Option */}
                        <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                        Custom Character Consistency
                                    </h4>
                                    <p className="text-xs text-muted-foreground">Keep your unique character consistent across video generations</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsCustomCharacter(!isCustomCharacter)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                        isCustomCharacter ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {isCustomCharacter ? "Enabled" : "Disabled"}
                                </button>
                            </div>

                            <AnimatePresence>
                                {isCustomCharacter && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <textarea
                                            value={characterDetails}
                                            onChange={(e) => setCharacterDetails(e.target.value)}
                                            placeholder="Describe your character in detail (e.g. 'Hero with a red cape, metallic arm, and glowing eyes')..."
                                            className="w-full h-24 p-4 bg-muted/50 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none text-sm"
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Dropdowns Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            <SelectGroup label="Camera Shot" icon={Camera} value={cameraShot} onChange={setCameraShot} options={shotTypes} />
                            <SelectGroup label="Movement" icon={Wind} value={cameraMovement} onChange={setCameraMovement} options={movements} />
                            <SelectGroup label="Lighting" icon={Sun} value={lighting} onChange={setLighting} options={lightingStyles} />
                            <SelectGroup label="Style" icon={Sparkles} value={style} onChange={setStyle} options={styles} />
                            <SelectGroup label="Palette" icon={Palette} value={palette} onChange={setPalette} options={colorPalettes} />
                            <SelectGroup label="Ratio" icon={Maximize} value={aspectRatio} onChange={setAspectRatio} options={aspectRatios} />
                            <SelectGroup label="Speed" icon={Sparkles} value={motionSpeed} onChange={setMotionSpeed} options={motionSpeeds} />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !subject || !action}
                            className="w-full py-5 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-primary/90 transition-all disabled:opacity-50 shadow-xl shadow-primary/20 active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Sparkles className="h-5 w-5" />
                                    Generate Sora Prompt
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

function SelectGroup({ label, icon: Icon, value, onChange, options }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1">
                <Icon className="h-2.5 w-2.5" /> {label}
            </label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full p-2.5 pl-3 pr-8 bg-muted/20 border rounded-xl appearance-none outline-none focus:ring-1 focus:ring-primary/40 transition-all cursor-pointer text-sm font-medium"
                >
                    {options.map((opt: string) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
            </div>
        </div>
    );
}
