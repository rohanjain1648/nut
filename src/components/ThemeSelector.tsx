import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useAchievements } from "@/hooks/useAchievements";
import { cn } from "@/lib/utils";
import { Lock, Palette } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ThemeSelector() {
    const { theme, setTheme } = useTheme();
    const { unlockedThemes } = useAchievements();

    const themes = [
        { id: 'light', label: 'Light (Default)', color: 'bg-stone-100', unlocked: true },
        { id: 'dark', label: 'Dark', color: 'bg-slate-900', unlocked: true },
        { id: 'mint', label: 'Mint', color: 'bg-emerald-100', unlocked: unlockedThemes.includes('mint') },
        { id: 'sunset', label: 'Sunset', color: 'bg-orange-100', unlocked: unlockedThemes.includes('sunset') },
        { id: 'ocean', label: 'Ocean', color: 'bg-blue-100', unlocked: unlockedThemes.includes('ocean') },
        { id: 'cosmic', label: 'Cosmic', color: 'bg-purple-900', unlocked: unlockedThemes.includes('cosmic') },
    ];

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Theme Personalization</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <TooltipProvider>
                    {themes.map((t) => (
                        <Tooltip key={t.id}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={theme === t.id ? 'default' : 'outline'}
                                    className={cn(
                                        "justify-start gap-2 h-auto py-2 relative overflow-hidden transition-all",
                                        theme === t.id ? "border-primary" : "border-transparent bg-muted/30 hover:bg-muted/50",
                                        !t.unlocked && "opacity-60 grayscale cursor-not-allowed"
                                    )}
                                    disabled={!t.unlocked}
                                    onClick={() => t.unlocked && setTheme(t.id)}
                                >
                                    <div className={cn("w-4 h-4 rounded-full border shadow-sm", t.color)} />
                                    <span className="text-xs truncate">{t.label}</span>

                                    {!t.unlocked && (
                                        <Lock className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/70" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {t.unlocked
                                    ? `Switch to ${t.label} theme`
                                    : "Unlock this theme by earning badges!"}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </div>
        </div>
    );
}
