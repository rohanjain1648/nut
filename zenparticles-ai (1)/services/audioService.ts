
export class ZenAudioService {
  private ctx: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];
  private masterGainNode: GainNode | null = null;
  private droneGainNode: GainNode | null = null;
  private noiseGainNode: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private isInitialized = false;

  private droneLevel = 0.5;
  private noiseLevel = 0.3;

  private init() {
    if (this.isInitialized) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    this.masterGainNode = this.ctx.createGain();
    this.droneGainNode = this.ctx.createGain();
    this.noiseGainNode = this.ctx.createGain();
    this.filterNode = this.ctx.createBiquadFilter();
    
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(400, this.ctx.currentTime);
    this.filterNode.Q.setValueAtTime(1, this.ctx.currentTime);

    // Drones -> DroneGain -> Filter
    // Noise -> NoiseGain -> Filter
    // Filter -> MasterGain -> Destination
    
    this.droneGainNode.connect(this.filterNode);
    this.noiseGainNode.connect(this.filterNode);
    this.filterNode.connect(this.masterGainNode);
    this.masterGainNode.connect(this.ctx.destination);
    
    this.droneGainNode.gain.setValueAtTime(this.droneLevel, this.ctx.currentTime);
    this.noiseGainNode.gain.setValueAtTime(this.noiseLevel, this.ctx.currentTime);
    this.masterGainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    
    this.isInitialized = true;
  }

  private createDrone(freq: number, type: OscillatorType, gainValue: number) {
    if (!this.ctx || !this.droneGainNode) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    g.gain.setValueAtTime(gainValue, this.ctx.currentTime);
    osc.connect(g);
    g.connect(this.droneGainNode);
    
    osc.start();
    this.oscillators.push(osc);
  }

  public setDroneVolume(val: number) {
    this.droneLevel = val;
    if (this.droneGainNode && this.ctx) {
      this.droneGainNode.gain.setTargetAtTime(val, this.ctx.currentTime, 0.1);
    }
  }

  public setNoiseVolume(val: number) {
    this.noiseLevel = val;
    if (this.noiseGainNode && this.ctx) {
      this.noiseGainNode.gain.setTargetAtTime(val, this.ctx.currentTime, 0.1);
    }
  }

  public start() {
    this.init();
    if (!this.ctx || this.ctx.state === 'suspended') {
      this.ctx?.resume();
    }

    if (this.oscillators.length === 0) {
      // OM Frequency roughly 136.1 Hz (C#)
      this.createDrone(136.1, 'sine', 0.5);
      this.createDrone(136.1 * 0.5, 'sine', 0.3); // Octave down
      this.createDrone(136.1 * 1.5, 'sine', 0.15); // Perfect fifth
      this.createDrone(136.1 * 2, 'sine', 0.08); // Octave up
      
      // Add subtle noise for "air"
      const bufferSize = 2 * this.ctx!.sampleRate;
      const noiseBuffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx!.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;
      whiteNoise.connect(this.noiseGainNode!);
      whiteNoise.start();
    }

    this.masterGainNode?.gain.linearRampToValueAtTime(0.5, this.ctx!.currentTime + 2);
  }

  public stop() {
    if (this.masterGainNode && this.ctx) {
      this.masterGainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);
    }
  }

  public updateBreathing(scale: number) {
    if (this.filterNode && this.ctx) {
      // Modulate filter with breath
      const freq = 300 + (scale - 1) * 450;
      this.filterNode.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.1);
      
      if (this.masterGainNode) {
        // Subtle volume swell with breathing
        const volume = 0.4 + (scale - 1) * 0.2;
        this.masterGainNode.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.2);
      }
    }
  }
}

export const zenAudio = new ZenAudioService();
