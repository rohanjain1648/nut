import { useProgressStats } from '@/hooks/useProgressStats';
import { useMemo } from 'react';
import { Trophy, Flame, Zap, Award, Star } from 'lucide-react';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: any;
    requiredStreak?: number;
    requiredTotal?: number;
    reward?: {
        type: 'theme' | 'skin';
        value: string;
        label: string;
    };
    isUnlocked: boolean;
}

export const ACHIEVEMENTS_DEF = [
    {
        id: 'first_step',
        title: 'First Step',
        description: 'Complete your first exercise',
        icon: Star,
        requiredTotal: 1,
        reward: { type: 'theme', value: 'mint', label: 'Mint Theme' }
    },
    {
        id: 'on_fire',
        title: 'On Fire',
        description: 'Reach a 3-day streak',
        icon: Flame,
        requiredStreak: 3,
        reward: { type: 'theme', value: 'sunset', label: 'Sunset Theme' }
    },
    {
        id: 'week_warrior',
        title: 'Week Warrior',
        description: 'Reach a 7-day streak',
        icon: Zap,
        requiredStreak: 7,
        reward: { type: 'theme', value: 'ocean', label: 'Ocean Theme' }
    },
    {
        id: 'zen_master',
        title: 'Zen Master',
        description: 'Reach a 30-day streak',
        icon: Trophy,
        requiredStreak: 30,
        reward: { type: 'theme', value: 'cosmic', label: 'Cosmic Theme' }
    },
    {
        id: 'century_club',
        title: 'Century Club',
        description: 'Complete 100 exercises',
        icon: Award,
        requiredTotal: 100
    }
] as const;

export const useAchievements = () => {
    const { currentStreak, activityData, isLoading } = useProgressStats();

    // Calculate total completions from activityData
    const totalCompletions = useMemo(() => {
        return activityData.reduce((sum, day) => sum + day.count, 0);
    }, [activityData]);

    const achievements: Achievement[] = useMemo(() => {
        return ACHIEVEMENTS_DEF.map(def => {
            let isUnlocked = false;

            // Cast to any to access optional properties safely in this context
            const d = def as any;

            if (d.requiredStreak) {
                isUnlocked = currentStreak >= d.requiredStreak;
            } else if (d.requiredTotal) {
                isUnlocked = totalCompletions >= d.requiredTotal;
            }

            return {
                ...def,
                isUnlocked,
                // For rewards types (narrowing the type slightly for the unified interface)
                reward: def.reward ? { ...def.reward, type: def.reward.type as 'theme' | 'skin' } : undefined
            };
        });
    }, [currentStreak, totalCompletions]);

    const unlockedThemes = useMemo(() => {
        return achievements
            .filter(a => a.isUnlocked && a.reward?.type === 'theme')
            .map(a => a.reward!.value);
    }, [achievements]);

    return {
        achievements,
        unlockedThemes,
        totalCompletions,
        currentStreak,
        isLoading
    };
};
