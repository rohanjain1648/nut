
import React, { useState, useEffect } from 'react';
import { AppMode, ParticleConfig, SavedMood } from '../components/zen/types';
import ParticleScene from '../components/zen/ParticleScene';
import { analyzeMood } from '../services/zenMoodService';
import { zenAudio } from '../services/zenAudioService';
import { Sparkles, Wind, BrainCircuit, Send, RefreshCw, Volume2, VolumeX, Save, Library, Trash2, X, ChevronRight, Check, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const DEFAULT_CONFIG: ParticleConfig = {
    colorPrimary: '#3b82f6',
    colorSecondary: '#8b5cf6',
    size: 0.04,
    count: 1500,
    speed: 1.0,
    turbulence: 1.0,
    interactionMode: 'drift'
};

const ZenBreathingPage: React.FC = () => {
    const [mode, setMode] = useState<AppMode>(AppMode.FREE_ROAM);
    const [baseConfig, setBaseConfig] = useState<ParticleConfig>(DEFAULT_CONFIG);
    const [userInput, setUserInput] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [insight, setInsight] = useState<string | null>(null);
    const [breathingScale, setBreathingScale] = useState(1);
    const [breathingText, setBreathingText] = useState('');
    const [isMuted, setIsMuted] = useState(true);
    const [savedMoods, setSavedMoods] = useState<SavedMood[]>([]);
    const [isNamingMood, setIsNamingMood] = useState(false);
    const [customName, setCustomName] = useState('');

    // Audio Mixer State
    const [isMixerOpen, setIsMixerOpen] = useState(false);
    const [chantVolume, setChantVolume] = useState(0.5);
    const [airVolume, setAirVolume] = useState(0.3);

    // Load saved moods from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('zen_saved_moods');
        if (stored) {
            try {
                setSavedMoods(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse saved moods", e);
            }
        }
    }, []);

    // Sync saved moods to localStorage
    useEffect(() => {
        localStorage.setItem('zen_saved_moods', JSON.stringify(savedMoods));
    }, [savedMoods]);

    // Audio Control
    useEffect(() => {
        if (!isMuted) {
            zenAudio.start();
        } else {
            zenAudio.stop();
        }
    }, [isMuted]);

    // Handle Mixer Adjustments
    useEffect(() => {
        zenAudio.setDroneVolume(chantVolume);
    }, [chantVolume]);

    useEffect(() => {
        zenAudio.setNoiseVolume(airVolume);
    }, [airVolume]);

    // Breathing logic & Audio modulation
    useEffect(() => {
        if (mode !== AppMode.BREATHING) {
            setBreathingScale(1);
            if (!isMuted) zenAudio.updateBreathing(1);
            return;
        }

        // Natural breathing cycle: 4s inhale, 4s hold, 8s exhale (16s total)
        const INHALE_DUR = 4000;
        const HOLD_DUR = 4000;
        const EXHALE_DUR = 8000;
        const CYCLE_DUR = INHALE_DUR + HOLD_DUR + EXHALE_DUR;

        let startTime = Date.now();

        const interval = setInterval(() => {
            const elapsed = (Date.now() - startTime) % CYCLE_DUR;
            let currentScale = 1;

            if (elapsed < INHALE_DUR) {
                const t = elapsed / INHALE_DUR;
                const ease = 1 - Math.pow(1 - t, 3);
                currentScale = 1 + ease * 1.2;
                setBreathingText('Inhale...');
            } else if (elapsed < INHALE_DUR + HOLD_DUR) {
                currentScale = 2.2;
                setBreathingText('Hold...');
            } else {
                const t = (elapsed - (INHALE_DUR + HOLD_DUR)) / EXHALE_DUR;
                currentScale = 2.2 - (1 - Math.pow(1 - t, 3)) * 1.2;
                setBreathingText('Exhale...');
            }

            setBreathingScale(currentScale);
            if (!isMuted) zenAudio.updateBreathing(currentScale);
        }, 16);

        return () => clearInterval(interval);
    }, [mode, isMuted]);

    const handleMoodSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim()) return;

        setIsAnalyzing(true);
        try {
            const response = await analyzeMood(userInput);
            setBaseConfig(response.config);
            setInsight(response.insight);
            setMode(AppMode.MOOD_ANALYSIS);
            setIsNamingMood(false);
            setCustomName('');
        } catch (error) {
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const saveCurrentMood = () => {
        if (!insight) return;
        const newSaved: SavedMood = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            config: baseConfig,
            insight: insight,
            name: customName.trim() || undefined
        };
        setSavedMoods(prev => [newSaved, ...prev]);
        setIsNamingMood(false);
        setCustomName('');
    };

    const deleteSavedMood = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSavedMoods(prev => prev.filter(m => m.id !== id));
    };

    const loadSavedMood = (mood: SavedMood) => {
        setBaseConfig(mood.config);
        setInsight(mood.insight);
        setMode(AppMode.MOOD_ANALYSIS);
        setIsNamingMood(false);
        setCustomName('');
    };

    const resetToDefault = () => {
        setBaseConfig(DEFAULT_CONFIG);
        setInsight(null);
        setMode(AppMode.FREE_ROAM);
        setUserInput('');
        setIsNamingMood(false);
        setCustomName('');
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    return (
        <div className="relative w-full h-screen text-white select-none overflow-hidden bg-black font-sans">
            <ParticleScene config={baseConfig} breathingScale={breathingScale} />

            {/* Navigation Overlay */}
            <nav className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-30 pointer-events-none">
                <div className="flex items-center gap-4 pointer-events-auto">
                    <Link to="/toolkit" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </Link>
                    <div
                        className="flex items-center space-x-2 pointer-events-auto cursor-pointer"
                        onClick={resetToDefault}
                        title="Reset to default experience"
                    >
                        <div className="p-2 bg-blue-500 rounded-lg shadow-lg shadow-blue-500/20">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">ZenParticles AI</h1>
                    </div>
                </div>

                <div className="flex space-x-3 pointer-events-auto">
                    <button
                        onClick={() => setMode(AppMode.FREE_ROAM)}
                        className={`px-4 py-2 rounded-full flex items-center space-x-2 transition-all ${mode === AppMode.FREE_ROAM ? 'bg-white/20 backdrop-blur-md' : 'hover:bg-white/10'}`}
                        title="Explore and interact with particles using your cursor"
                    >
                        <BrainCircuit className="w-4 h-4" />
                        <span className="text-sm font-medium hidden md:inline">Free Roam</span>
                    </button>
                    <button
                        onClick={() => setMode(AppMode.BREATHING)}
                        className={`px-4 py-2 rounded-full flex items-center space-x-2 transition-all ${mode === AppMode.BREATHING ? 'bg-white/20 backdrop-blur-md border border-white/10' : 'hover:bg-white/10'}`}
                        title="Guided Breathing: Synchronize your breath with the visual pulse (4s Inhale, 4s Hold, 8s Exhale) to lower stress and regulate your nervous system."
                    >
                        <Wind className="w-4 h-4" />
                        <span className="text-sm font-medium hidden md:inline">Breathing</span>
                    </button>
                    <button
                        onClick={() => setMode(mode === AppMode.LIBRARY ? AppMode.FREE_ROAM : AppMode.LIBRARY)}
                        className={`px-4 py-2 rounded-full flex items-center space-x-2 transition-all ${mode === AppMode.LIBRARY ? 'bg-white/20 backdrop-blur-md' : 'hover:bg-white/10'}`}
                        title="Access your collection of saved emotional visualizations"
                    >
                        <Library className="w-4 h-4" />
                        <span className="text-sm font-medium hidden md:inline">Library</span>
                    </button>

                    <div className="relative flex space-x-2">
                        <button
                            onClick={() => setIsMixerOpen(!isMixerOpen)}
                            className={`p-2 rounded-full transition-all ${isMixerOpen ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}`}
                            title="Adjust ambient sound layers"
                        >
                            <SlidersHorizontal className="w-5 h-5" />
                        </button>
                        <button
                            onClick={toggleMute}
                            className={`p-2 rounded-full transition-all flex items-center space-x-2 px-3 ${!isMuted ? 'bg-blue-500/40 border border-blue-400/50' : 'bg-white/5 hover:bg-white/10'}`}
                            title={isMuted ? "Turn on ambient sound" : "Mute ambient sound"}
                        >
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 animate-pulse" />}
                            {!isMuted && <span className="text-[10px] font-bold uppercase tracking-tighter">OM</span>}
                        </button>

                        {/* Mixer Popover */}
                        {isMixerOpen && (
                            <div className="absolute top-12 right-0 w-64 bg-black/60 backdrop-blur-2xl p-6 rounded-2xl border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200 z-50 pointer-events-auto">
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-[10px] uppercase tracking-widest text-white/40">OM Chant</label>
                                            <span className="text-[10px] text-blue-400 font-mono">{Math.round(chantVolume * 100)}%</span>
                                        </div>
                                        <input
                                            type="range" min="0" max="1" step="0.01"
                                            value={chantVolume}
                                            onChange={(e) => setChantVolume(parseFloat(e.target.value))}
                                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                            title="Volume of the meditative OM chant"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-[10px] uppercase tracking-widest text-white/40">Wind & Air</label>
                                            <span className="text-[10px] text-blue-400 font-mono">{Math.round(airVolume * 100)}%</span>
                                        </div>
                                        <input
                                            type="range" min="0" max="1" step="0.01"
                                            value={airVolume}
                                            onChange={(e) => setAirVolume(parseFloat(e.target.value))}
                                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                            title="Volume of the ambient air texture"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10 pointer-events-none">

                {/* Breathing Guide UI */}
                {mode === AppMode.BREATHING && (
                    <div className="text-center transition-all duration-1000">
                        <h2 className="text-7xl font-light tracking-[0.25em] uppercase mb-6 text-white/90 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">{breathingText}</h2>
                        <p className="text-white/40 text-sm tracking-[0.4em] uppercase animate-pulse">Deep slow breaths</p>
                    </div>
                )}

                {/* AI Insight Overlay */}
                {mode === AppMode.MOOD_ANALYSIS && insight && (
                    <div className="max-w-md w-full bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 animate-in fade-in zoom-in duration-500 pointer-events-auto shadow-2xl">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                            <Sparkles className="w-5 h-5 text-blue-400" />
                        </div>

                        <p className="text-lg text-white/90 font-light leading-relaxed mb-8 italic">
                            "{insight}"
                        </p>

                        <div className="flex flex-col space-y-3">
                            {isNamingMood ? (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <input
                                        type="text"
                                        value={customName}
                                        onChange={(e) => setCustomName(e.target.value)}
                                        placeholder="Give this space a name..."
                                        autoFocus
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-blue-500/50 transition-all text-sm"
                                        title="Enter a name for this visualization"
                                    />
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={saveCurrentMood}
                                            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-all flex items-center justify-center space-x-2 shadow-lg"
                                            title="Confirm name and save to library"
                                        >
                                            <Check className="w-4 h-4" />
                                            <span>Confirm Save</span>
                                        </button>
                                        <button
                                            onClick={() => setIsNamingMood(false)}
                                            className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-all"
                                            title="Cancel naming"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setIsNamingMood(true)}
                                        className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-all flex items-center justify-center space-x-2 shadow-lg active:scale-95"
                                        title="Save this unique visualization and insight to your library"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>Save to Library</span>
                                    </button>
                                    <button
                                        onClick={resetToDefault}
                                        className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                                        title="Clear current mood and start over"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Library View */}
                {mode === AppMode.LIBRARY && (
                    <div className="w-full max-w-2xl bg-black/60 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/10 animate-in slide-in-from-bottom-8 duration-500 pointer-events-auto shadow-2xl flex flex-col max-h-[70vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold flex items-center space-x-3">
                                <Library className="w-6 h-6 text-blue-400" />
                                <span>Your Calm Library</span>
                            </h2>
                            <button
                                onClick={() => setMode(AppMode.FREE_ROAM)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                title="Close library"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {savedMoods.length === 0 ? (
                                <div className="text-center py-20 text-white/30 italic">
                                    Your saved moods will appear here. Try sharing how you feel.
                                </div>
                            ) : (
                                savedMoods.map((mood) => (
                                    <div
                                        key={mood.id}
                                        onClick={() => loadSavedMood(mood)}
                                        className="group relative p-5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-2xl transition-all cursor-pointer flex items-center space-x-4"
                                        title="Restore this mood and insight"
                                    >
                                        <div
                                            className="w-12 h-12 rounded-full border border-white/20 shadow-inner overflow-hidden shrink-0"
                                            style={{ background: `linear-gradient(135deg, ${mood.config.colorPrimary}, ${mood.config.colorSecondary})` }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white/90 text-sm font-medium truncate mb-1">
                                                {mood.name || "Untitled Mood"}
                                            </p>
                                            <p className="text-white/40 text-[10px] uppercase tracking-wider truncate">
                                                {mood.insight}
                                            </p>
                                            <p className="text-white/20 text-[9px] uppercase tracking-[0.1em] mt-1">
                                                {new Date(mood.timestamp).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => deleteSavedMood(mood.id, e)}
                                                className="p-2 text-white/30 hover:text-red-400 transition-colors"
                                                title="Remove from library"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <ChevronRight className="w-5 h-5 text-white/20" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Loading Overlay */}
                {isAnalyzing && (
                    <div className="flex flex-col items-center space-y-6 animate-pulse">
                        <div className="relative">
                            <div className="w-16 h-16 border-2 border-blue-500/20 rounded-full"></div>
                            <div className="absolute inset-0 w-16 h-16 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                        </div>
                        <p className="text-blue-400 font-medium tracking-[0.2em] uppercase text-xs">Aligning particles to your frequency</p>
                    </div>
                )}
            </main>

            {/* Bottom Interface - Sentiment Input */}
            <footer className="absolute bottom-0 left-0 right-0 p-8 flex justify-center z-20">
                {mode !== AppMode.BREATHING && !isAnalyzing && mode !== AppMode.MOOD_ANALYSIS && mode !== AppMode.LIBRARY && (
                    <div className="w-full max-w-xl animate-in slide-in-from-bottom-10 duration-700">
                        <form onSubmit={handleMoodSubmit} className="relative group">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="How are you feeling right now?"
                                className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 backdrop-blur-2xl border border-white/10 focus:border-blue-500/50 rounded-2xl py-5 px-6 outline-none transition-all text-lg placeholder:text-white/30 shadow-2xl"
                                title="Describe your current feelings to generate a unique particle system"
                            />
                            <button
                                type="submit"
                                disabled={!userInput.trim()}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-white/10 rounded-xl transition-all shadow-lg active:scale-90"
                                title="Analyze your mood and create a visualization"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                        <p className="text-center mt-4 text-white/20 text-[10px] tracking-[0.3em] uppercase">
                            Move mouse to touch the flow
                        </p>
                    </div>
                )}
            </footer>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
      `}</style>
        </div>
    );
};

export default ZenBreathingPage;
