/**
 * Web Audio API Sensual Ambient Soundscape Generator.
 * Provides authentic, gentle background textures (Raindrops & Warm Midnight Pad)
 * that play softly behind female voice narration to eliminate machine-like silence.
 */

export type AmbientSoundType = 'none' | 'rain' | 'velvet'

class AmbientSoundEngine {
  private ctx: AudioContext | null = null
  private gainNode: GainNode | null = null
  private activeNodes: (AudioNode | { stop: () => void })[] = []
  private currentType: AmbientSoundType = 'none'
  private currentVolume: number = 0.25

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  public setVolume(vol: number) {
    this.currentVolume = Math.max(0, Math.min(1, vol))
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(this.currentVolume, this.ctx.currentTime, 0.1)
    }
  }

  public stop() {
    this.activeNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof node.stop === 'function') {
          node.stop()
        }
        if ('disconnect' in node && typeof node.disconnect === 'function') {
          node.disconnect()
        }
      } catch {
        // Safe disposal
      }
    })
    this.activeNodes = []
    this.currentType = 'none'
  }

  public play(type: AmbientSoundType, volume: number = this.currentVolume) {
    if (type === 'none') {
      this.stop()
      return
    }

    if (this.currentType === type && this.activeNodes.length > 0) {
      this.setVolume(volume)
      return
    }

    this.stop()
    const ctx = this.getContext()
    if (!ctx) return

    this.currentType = type
    this.currentVolume = volume

    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(this.currentVolume, ctx.currentTime)
    masterGain.connect(ctx.destination)
    this.gainNode = masterGain
    this.activeNodes.push(masterGain)

    if (type === 'rain') {
      this.buildRainSoundscape(ctx, masterGain)
    } else if (type === 'velvet') {
      this.buildVelvetPadSoundscape(ctx, masterGain)
    }
  }

  /**
   * Generates a soft, soothing rain patter using filtered pink noise.
   */
  private buildRainSoundscape(ctx: AudioContext, destination: GainNode) {
    const bufferSize = ctx.sampleRate * 2
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0

    // Pink noise filter approximation
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.96900 * b2 + white * 0.1538520
      b3 = 0.86650 * b3 + white * 0.3104856
      b4 = 0.55000 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.0168980
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08
      b6 = white * 0.115926
    }

    const whiteNoise = ctx.createBufferSource()
    whiteNoise.buffer = noiseBuffer
    whiteNoise.loop = true

    // Lowpass filter for warm indoor rain sound
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1100, ctx.currentTime)

    // Subtle gentle LFO for breeze variation
    const lfo = ctx.createOscillator()
    lfo.frequency.setValueAtTime(0.2, ctx.currentTime)
    const lfoGain = ctx.createGain()
    lfoGain.gain.setValueAtTime(150, ctx.currentTime)
    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)

    whiteNoise.connect(filter)
    filter.connect(destination)

    whiteNoise.start(0)
    lfo.start(0)

    this.activeNodes.push(whiteNoise, lfo, filter, lfoGain)
  }

  /**
   * Generates a warm, ambient romantic chord pad (A minor / C major warmth).
   */
  private buildVelvetPadSoundscape(ctx: AudioContext, destination: GainNode) {
    const freqs = [110, 164.81, 220, 329.63] // A2, E3, A3, E4 warm chords

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)

      // Slight detune for chorus warmth
      osc.detune.setValueAtTime((idx % 2 === 0 ? 3 : -3) + Math.random() * 2, ctx.currentTime)

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(420, ctx.currentTime)

      const noteGain = ctx.createGain()
      noteGain.gain.setValueAtTime(0.04 / freqs.length, ctx.currentTime)

      osc.connect(filter)
      filter.connect(noteGain)
      noteGain.connect(destination)

      osc.start(0)
      this.activeNodes.push(osc, filter, noteGain)
    })
  }
}

export const ambientSound = new AmbientSoundEngine()
