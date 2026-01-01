import { useAchievements } from '@/hooks/useAchievements';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { Lock, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export const AchievementsList = () => {
    const { achievements, isLoading } = useAchievements();

    if (isLoading) {
        return (
            <Card className="mb-8">
                <CardHeader>
                    <div className="h-6 w-48 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    🏆 Achievements
                </CardTitle>
                <CardDescription>
                    Unlock badges and exclusive themes by staying consistent.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <TooltipProvider>
                        {achievements.map((achievement) => {
                            const Icon = achievement.icon;
                            return (
                                <Tooltip key={achievement.id}>
                                    <TooltipTrigger asChild>
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            className={cn(
                                                "relative p-4 rounded-xl border flex items-start gap-4 transition-all duration-300",
                                                achievement.isUnlocked
                                                    ? "bg-card border-border shadow-sm"
                                                    : "bg-muted/30 border-muted opacity-80"
                                            )}
                                        >
                                            <div className={cn(
                                                "p-3 rounded-full shrink-0",
                                                achievement.isUnlocked
                                                    ? "bg-primary/10 text-primary"
                                                    : "bg-muted text-muted-foreground"
                                            )}>
                                                <Icon className="w-6 h-6" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h4 className={cn(
                                                        "font-semibold text-sm",
                                                        !achievement.isUnlocked && "text-muted-foreground"
                                                    )}>
                                                        {achievement.title}
                                                    </h4>
                                                    {achievement.isUnlocked ? (
                                                        <Check className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <Lock className="w-3 h-3 text-muted-foreground/50" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                    {achievement.description}
                                                </p>

                                                {achievement.reward && (
                                                    <Badge variant="secondary" className={cn(
                                                        "mt-2 text-[10px] px-1.5 h-5",
                                                        achievement.isUnlocked ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" : "opacity-50"
                                                    )}>
                                                        Unlocks: {achievement.reward.label}
                                                    </Badge>
                                                )}
                                            </div>
                                        </motion.div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {achievement.isUnlocked
                                            ? `Unlocked! You earned the ${achievement.reward?.label || 'badge'}.`
                                            : `Complete: ${achievement.description} to unlock.`
                                        }
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </TooltipProvider>
                </div>
            </CardContent>
        </Card>
    );
};
