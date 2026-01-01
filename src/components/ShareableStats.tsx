import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Star, Trophy } from 'lucide-react';

interface ShareableStatsProps {
    streak: number;
    totalExercises: number;
    displayName?: string;
}

export const ShareableStats = ({ streak, totalExercises, displayName = "Mindful Echo User" }: ShareableStatsProps) => {
    return (
        <div id="shareable-stats-card" className="bg-gradient-to-br from-primary/10 to-accent/20 p-8 rounded-3xl w-[400px] mx-auto border-4 border-white shadow-xl">
            <div className="flex flex-col items-center text-center space-y-6">

                {/* Logo / Header */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
                    </div>
                    <h3 className="font-bold text-xl tracking-tight">Mindful Echo</h3>
                </div>

                {/* Main Stat: Streak */}
                <div className="relative">
                    <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full" />
                    <div className="relative flex flex-col items-center">
                        <Flame className="w-24 h-24 text-orange-500 fill-orange-500 drop-shadow-lg" />
                        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-orange-600 leading-none mt-2">
                            {streak}
                        </h1>
                        <p className="text-xl font-bold text-muted-foreground uppercase tracking-wider mt-2">
                            Day Streak
                        </p>
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-2 gap-4 w-full mt-4">
                    <Card className="bg-white/50 backdrop-blur-sm border-none shadow-sm">
                        <CardContent className="p-4 flex flex-col items-center">
                            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500 mb-1" />
                            <span className="text-2xl font-bold">{totalExercises}</span>
                            <span className="text-xs text-muted-foreground">Exercises</span>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/50 backdrop-blur-sm border-none shadow-sm">
                        <CardContent className="p-4 flex flex-col items-center">
                            <Trophy className="w-6 h-6 text-purple-500 fill-purple-500 mb-1" />
                            <span className="text-2xl font-bold">Top 1%</span>
                            <span className="text-xs text-muted-foreground">Consistency</span>
                        </CardContent>
                    </Card>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-black/5 w-full">
                    <p className="text-sm font-medium text-muted-foreground/80 italic">
                        "Finding peace, one voice at a time."
                    </p>
                </div>

            </div>
        </div>
    );
};
