export enum AppMode {
    FREE_ROAM = 'FREE_ROAM',
    BREATHING = 'BREATHING',
    MOOD_ANALYSIS = 'MOOD_ANALYSIS',
    LIBRARY = 'LIBRARY'
}

export interface ParticleConfig {
    colorPrimary: string;
    colorSecondary: string;
    size: number; // 0.01 - 0.2
    count: number; // 100 - 5000
    speed: number; // 0.1 - 3.0
    turbulence: number; // 0.0 - 5.0
    interactionMode: 'attract' | 'repel' | 'drift';
}

export interface MoodResponse {
    config: ParticleConfig;
    insight: string;
}

export interface SavedMood {
    id: string;
    timestamp: number;
    config: ParticleConfig;
    insight: string;
    name?: string;
}
