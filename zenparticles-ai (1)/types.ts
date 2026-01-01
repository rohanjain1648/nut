
export enum AppMode {
  FREE_ROAM = 'FREE_ROAM',
  BREATHING = 'BREATHING',
  MOOD_ANALYSIS = 'MOOD_ANALYSIS',
  LIBRARY = 'LIBRARY'
}

export interface ParticleConfig {
  colorPrimary: string;
  colorSecondary: string;
  size: number;
  count: number;
  speed: number;
  turbulence: number;
  interactionMode: 'attract' | 'repel' | 'drift';
  message?: string;
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
