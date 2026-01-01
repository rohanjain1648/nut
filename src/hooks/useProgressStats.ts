import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  subWeeks,
  subMonths,
  isWithinInterval,
  parseISO,
  subDays,
  isSameDay,
  differenceInCalendarDays,
  startOfDay
} from 'date-fns';

export interface DailyStats {
  date: string;
  completions: number;
  label: string;
}

export interface WeeklyStats {
  weekLabel: string;
  completions: number;
}

export interface ActivityData {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // 0=none, 4=high
}

export interface ProgressData {
  dailyStats: DailyStats[];
  weeklyStats: WeeklyStats[];
  activityData: ActivityData[];
  thisWeekTotal: number;
  lastWeekTotal: number;
  thisMonthTotal: number;
  lastMonthTotal: number;
  weekOverWeekChange: number;
  monthOverMonthChange: number;
  currentStreak: number;
  isLoading: boolean;
}

const getSessionId = (): string => {
  return localStorage.getItem('exercise_session_id') || '';
};

export const useProgressStats = (): ProgressData => {
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const sessionId = getSessionId();

  useEffect(() => {
    const fetchProgressData = async () => {
      if (!sessionId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const now = new Date();
        const oneYearAgo = subDays(now, 365); // Fetch full year for heatmap
        const fourWeeksAgo = subWeeks(now, 4);

        // Fetch all completions from the last year
        const { data: completions, error } = await supabase
          .from('exercise_completions')
          .select('completed_at, exercise_id')
          .eq('session_id', sessionId)
          .gte('completed_at', oneYearAgo.toISOString())
          .order('completed_at', { ascending: true });

        if (error) throw error;

        // --- Calculate Streak ---
        // Get unique dates of completion
        const uniqueDates = Array.from(new Set(completions?.map(c =>
          format(parseISO(c.completed_at), 'yyyy-MM-dd')
        ) || [])).sort().reverse(); // Descending order

        let streak = 0;
        if (uniqueDates.length > 0) {
          const today = format(now, 'yyyy-MM-dd');
          const yesterday = format(subDays(now, 1), 'yyyy-MM-dd');

          // Check if streak is active (completed today or yesterday)
          const lastCompletion = uniqueDates[0];

          if (lastCompletion === today || lastCompletion === yesterday) {
            streak = 1;
            let currentDate = parseISO(lastCompletion);

            // Iterate backwards to count consecutive days
            for (let i = 1; i < uniqueDates.length; i++) {
              const prevDate = parseISO(uniqueDates[i]);
              const diff = differenceInCalendarDays(currentDate, prevDate);

              if (diff === 1) {
                streak++;
                currentDate = prevDate;
              } else {
                break;
              }
            }
          }
        }
        setCurrentStreak(streak);

        // --- Generate Activity Data for Heatmap ---
        // Map of date -> count
        const activityMap = new Map<string, number>();
        completions?.forEach(c => {
          const dateStr = format(parseISO(c.completed_at), 'yyyy-MM-dd');
          activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1);
        });

        // Fill in expected date range (365 days) is usually handled by the heatmap component,
        // but passing raw data is often cleaner. 
        // We'll prepare an array of *active* days for simpler processing, 
        // or a full year array if the component expects it.
        // Let's generate a full year array to make rendering easier.
        const heatmapData: ActivityData[] = [];
        for (let i = 365; i >= 0; i--) {
          const d = subDays(now, i);
          const dateStr = format(d, 'yyyy-MM-dd');
          const count = activityMap.get(dateStr) || 0;

          // Determine level based on count (simple heuristic)
          let level: 0 | 1 | 2 | 3 | 4 = 0;
          if (count === 0) level = 0;
          else if (count === 1) level = 1;
          else if (count <= 3) level = 2;
          else if (count <= 5) level = 3;
          else level = 4;

          heatmapData.push({ date: dateStr, count, level });
        }
        setActivityData(heatmapData);


        // --- Existing Stats Logic (Daily/Weekly) ---
        // Generate daily stats for current week
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

        const daily: DailyStats[] = daysInWeek.map(day => {
          const dayStr = format(day, 'yyyy-MM-dd');
          return {
            date: dayStr,
            completions: activityMap.get(dayStr) || 0,
            label: format(day, 'EEE'),
          };
        });
        setDailyStats(daily);

        // Generate weekly stats for last 4 weeks
        const weekly: WeeklyStats[] = [];
        for (let i = 3; i >= 0; i--) {
          const weekStartDate = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
          const weekEndDate = endOfWeek(subWeeks(now, i), { weekStartsOn: 1 });

          let weekCount = 0;
          completions?.forEach(c => {
            const d = parseISO(c.completed_at);
            if (isWithinInterval(d, { start: weekStartDate, end: weekEndDate })) {
              weekCount++;
            }
          });

          weekly.push({
            weekLabel: i === 0 ? 'This Week' : i === 1 ? 'Last Week' : `${i} weeks ago`,
            completions: weekCount,
          });
        }
        setWeeklyStats(weekly);

      } catch (error) {
        console.error('Error fetching progress data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgressData();
  }, [sessionId]);

  // Calculate totals
  const now = new Date();

  // Re-use calculation logic or just pick from the stats we already generated
  // Note: Previous logic calculated these from 'weeklyStats' which is fine
  // We just need to make sure 'weeklyStats' is populated correctly above.

  const thisWeekTotal = weeklyStats.find(w => w.weekLabel === 'This Week')?.completions || 0;
  const lastWeekTotal = weeklyStats.find(w => w.weekLabel === 'Last Week')?.completions || 0;

  const thisMonthTotal = weeklyStats.slice(-2).reduce((sum, w) => sum + w.completions, 0); // Approx
  const lastMonthTotal = weeklyStats.slice(0, 2).reduce((sum, w) => sum + w.completions, 0); // Approx

  const weekOverWeekChange = lastWeekTotal > 0
    ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100)
    : thisWeekTotal > 0 ? 100 : 0;

  const monthOverMonthChange = lastMonthTotal > 0
    ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
    : thisMonthTotal > 0 ? 100 : 0;

  return {
    dailyStats,
    weeklyStats,
    activityData,
    thisWeekTotal,
    lastWeekTotal,
    thisMonthTotal,
    lastMonthTotal,
    weekOverWeekChange,
    monthOverMonthChange,
    currentStreak,
    isLoading,
  };
};
