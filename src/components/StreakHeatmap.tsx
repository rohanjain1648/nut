import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { ActivityData } from "@/hooks/useProgressStats";
import { useMemo } from "react";

interface StreakHeatmapProps {
    data: ActivityData[];
    isLoading?: boolean;
}

export const StreakHeatmap = ({ data, isLoading }: StreakHeatmapProps) => {
    const today = new Date();

    // Generate calendar days for the current month
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);
        const startDate = startOfWeek(monthStart); // Default starts on Sunday
        const endDate = endOfWeek(monthEnd);

        return eachDayOfInterval({ start: startDate, end: endDate });
    }, []);

    if (isLoading) {
        return (
            <div className="w-full h-48 animate-pulse bg-muted/20 rounded-xl" />
        );
    }

    // Helper to find activity for a specific day
    const getActivityForDay = (day: Date) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        return data.find(d => d.date === dateStr);
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold font-display">
                    {format(today, 'MMMM yyyy')}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Streak
                    </span>
                    <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-muted" />
                        No Activity
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {/* Weekday headers */}
                {weekDays.map(day => (
                    <div key={day} className="text-center text-xs text-muted-foreground py-2">
                        {day}
                    </div>
                ))}

                {/* Calendar grid */}
                <TooltipProvider>
                    {calendarDays.map((date, i) => {
                        const activity = getActivityForDay(date);
                        const isCurrentMonth = isSameMonth(date, today);
                        const isToday = isSameDay(date, today);

                        // Determine styling based on activity
                        // If there is any count > 0, we treat it as part of the streak/active
                        const hasActivity = activity && activity.count > 0;

                        return (
                            <Tooltip key={i}>
                                <TooltipTrigger asChild>
                                    <div
                                        className={cn(
                                            "aspect-square rounded-md flex items-center justify-center text-sm transition-all",
                                            !isCurrentMonth && "opacity-30",
                                            isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background font-bold",
                                            hasActivity
                                                ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/50"
                                                : "bg-muted/30 text-muted-foreground hover:bg-muted/50",
                                            "cursor-default"
                                        )}
                                    >
                                        <div className="flex flex-col items-center">
                                            <span>{format(date, 'd')}</span>
                                            {hasActivity && (
                                                <div className="w-1 h-1 rounded-full bg-green-500 mt-1" />
                                            )}
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs font-medium">
                                        {format(date, 'MMM d, yyyy')}
                                    </p>
                                    {hasActivity ? (
                                        <p className="text-xs text-green-500">
                                            {activity.count} session{activity.count > 1 ? 's' : ''} completed
                                        </p>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">No activity</p>
                                    )}
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </TooltipProvider>
            </div>
        </div>
    );
};
