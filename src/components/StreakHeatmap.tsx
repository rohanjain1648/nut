import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format, parseISO, getDay } from "date-fns";
import { ActivityData } from "@/hooks/useProgressStats";

interface StreakHeatmapProps {
    data: ActivityData[];
    isLoading?: boolean;
}

export const StreakHeatmap = ({ data, isLoading }: StreakHeatmapProps) => {
    if (isLoading) {
        return (
            <div className="flex gap-1 overflow-x-auto pb-2">
                {Array.from({ length: 52 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-1">
                        {Array.from({ length: 7 }).map((_, j) => (
                            <div key={j} className="w-3 h-3 rounded-[2px] bg-muted animate-pulse" />
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    // The simplified data array already comes in as 365 days in reverse chronological order (or we can assume logic in hook)
    // But for a calendar heatmap like GitHub's, we usually want column-major order (weeks) starting from Sunday/Monday.

    // Let's reorganize the linear 365 days of data into weeks for rendering.
    // The hook provides the last 365 days. 
    // We need to pad the start to align with the first day of the week if necessary.

    const weeks: ActivityData[][] = [];
    let currentWeek: ActivityData[] = [];

    // We need to reverse the data to start from the oldest date
    const chronologicalData = [...data].reverse();

    // Find the day of week of the first data point
    if (chronologicalData.length > 0) {
        const firstDate = parseISO(chronologicalData[0].date);
        const startDayOfWeek = getDay(firstDate); // 0 = Sunday

        // Add empty placeholders for days before the start date in the first week
        for (let i = 0; i < startDayOfWeek; i++) {
            // We use a dummy date or null marker, but matching the ActivityData shape with level 0 is easier
            // Just careful not to render tooltips for these
            currentWeek.push({ date: '', count: 0, level: 0 });
        }
    }

    chronologicalData.forEach((day, index) => {
        currentWeek.push(day);

        // If week is full (7 days) or it's the last item
        if (currentWeek.length === 7 || index === chronologicalData.length - 1) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });


    const getLevelColor = (level: number) => {
        switch (level) {
            case 0: return "bg-muted/40"; // No activity
            case 1: return "bg-green-200 dark:bg-green-900/50"; // Low
            case 2: return "bg-green-300 dark:bg-green-700/60";
            case 3: return "bg-green-400 dark:bg-green-500/80";
            case 4: return "bg-green-500 dark:bg-green-400"; // High (matching user request for green)
            default: return "bg-muted/40";
        }
    };

    return (
        <div className="w-full overflow-x-auto">
            <div className="flex gap-1 min-w-max pb-2">
                <TooltipProvider>
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                            {week.map((day, dayIndex) => (
                                day.date ? (
                                    <Tooltip key={`${weekIndex}-${dayIndex}`}>
                                        <TooltipTrigger asChild>
                                            <div
                                                className={cn(
                                                    "w-3 h-3 rounded-[2px] transition-colors hover:ring-2 hover:ring-ring hover:ring-offset-1",
                                                    getLevelColor(day.level)
                                                )}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs font-medium">
                                                {day.count} {day.count === 1 ? 'exercise' : 'exercises'} on {format(parseISO(day.date), 'MMM d, yyyy')}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                ) : (
                                    // Placeholder for empty start days
                                    <div key={`empty-${weekIndex}-${dayIndex}`} className="w-3 h-3" />
                                )
                            ))}
                        </div>
                    ))}
                </TooltipProvider>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-2">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-[2px] bg-muted/40" />
                    <div className="w-3 h-3 rounded-[2px] bg-green-200 dark:bg-green-900/50" />
                    <div className="w-3 h-3 rounded-[2px] bg-green-300 dark:bg-green-700/60" />
                    <div className="w-3 h-3 rounded-[2px] bg-green-400 dark:bg-green-500/80" />
                    <div className="w-3 h-3 rounded-[2px] bg-green-500 dark:bg-green-400" />
                </div>
                <span>More</span>
            </div>
        </div>
    );
};
