import { PitchShifter } from 'soundtouchjs'

export type PlayAlongStatus = {
  loaded: boolean
  fileName: string | null
  playing: boolean
  durationSec: number
  currentSec: number
  speed: number
  pitchSemitones: number
  volume: number
}

const INITIAL: PlayAlongStatus = {
  loaded: false,
  fileName: null,
  playing: false,
  durationSec: 0,
  currentSec: 0,
  speed: 1.0,
  pitchSemitones: 0,
  volume: 1.0,
}

type Listener = (s: PlayAlongStatus) => void

const TIME_EMIT_THROTTLE_MS = 50
const BUFFER_SIZE = 4096

export class PlayAlongEngine {
  private ctx: AudioContext | null = null
  private gain: GainNode | null = null
  private shifter: PitchShifter | null = null
  private buffer: AudioBuffer | null = null
  private listeners = new Set<Listener>()
  private status: PlayAlongStatus = { ...INITIAL }
  private connected = false
  private lastEmitMs = 0

  getStatus(): PlayAlongStatus {
    return { ...this.status }
  }

  subscribe(cb: Listener): () => void {
    this.listeners.add(cb)
    cb({ ...this.status })
    return () => {
      this.listeners.delete(cb)
    }
  }

  private emit(): void {
    const snapshot = { ...this.status }
    for (const cb of this.listeners) cb(snapshot)
  }

  async load(file: File): Promise<void> {
    this.tearDownShifter()
    if (!this.ctx) {
      this.ctx = new AudioContext()
      this.gain = this.ctx.createGain()
      this.gain.gain.value = this.status.volume
      this.gain.connect(this.ctx.destination)
    }
    const arrayBuffer = await file.arrayBuffer()
    const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer.slice(0))
    this.buffer = audioBuffer
    this.createShifter()
    this.status = {
      ...this.status,
      loaded: true,
      fileName: file.name,
      durationSec: audioBuffer.duration,
      currentSec: 0,
      playing: false,
    }
    this.emit()
  }

  private createShifter(): void {
    if (!this.ctx || !this.buffer) return
    const shifter = new PitchShifter(this.ctx, this.buffer, BUFFER_SIZE, () => {
      this.disconnectShifter()
      this.status = { ...this.status, playing: false, currentSec: 0 }
      this.createShifter()
      this.emit()
    })
    shifter.tempo = this.status.speed
    shifter.pitchSemitones = this.status.pitchSemitones
    shifter.on('play', (detail) => {
      if (!this.status.playing) return
      const now = performance.now()
      if (now - this.lastEmitMs < TIME_EMIT_THROTTLE_MS) return
      this.lastEmitMs = now
      this.status = { ...this.status, currentSec: detail.timePlayed }
      this.emit()
    })
    this.shifter = shifter
  }

  play(): void {
    if (!this.shifter || !this.gain || !this.ctx) return
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume()
    }
    if (!this.connected) {
      this.shifter.connect(this.gain)
      this.connected = true
    }
    this.status = { ...this.status, playing: true }
    this.emit()
  }

  pause(): void {
    this.disconnectShifter()
    this.status = { ...this.status, playing: false }
    this.emit()
  }

  toggle(): void {
    if (this.status.playing) this.pause()
    else this.play()
  }

  private disconnectShifter(): void {
    if (this.connected && this.shifter) {
      try {
        this.shifter.disconnect()
      } catch {
        // already disconnected — fine
      }
      this.connected = false
    }
  }

  seekPercent(pct: number): void {
    if (!this.shifter || !this.status.durationSec) return
    const clamped = Math.max(0, Math.min(1, pct))
    this.shifter.percentagePlayed = clamped * 100
    this.status = {
      ...this.status,
      currentSec: clamped * this.status.durationSec,
    }
    this.emit()
  }

  setSpeed(speed: number): void {
    const clamped = Math.max(0.25, Math.min(1.5, speed))
    this.status = { ...this.status, speed: clamped }
    if (this.shifter) this.shifter.tempo = clamped
    this.emit()
  }

  setPitchSemitones(semitones: number): void {
    const clamped = Math.max(-12, Math.min(12, semitones))
    this.status = { ...this.status, pitchSemitones: clamped }
    if (this.shifter) this.shifter.pitchSemitones = clamped
    this.emit()
  }

  setVolume(v: number): void {
    const clamped = Math.max(0, Math.min(1, v))
    this.status = { ...this.status, volume: clamped }
    if (this.gain && this.ctx) {
      this.gain.gain.setValueAtTime(clamped, this.ctx.currentTime)
    }
    this.emit()
  }

  resetSpeedAndPitch(): void {
    this.setSpeed(1.0)
    this.setPitchSemitones(0)
  }

  private tearDownShifter(): void {
    this.disconnectShifter()
    if (this.shifter) {
      try {
        this.shifter.off()
      } catch {
        // ignore
      }
      this.shifter = null
    }
  }

  dispose(): void {
    this.tearDownShifter()
    this.buffer = null
    this.listeners.clear()
    if (this.gain) {
      try {
        this.gain.disconnect()
      } catch {
        // ignore
      }
      this.gain = null
    }
    if (this.ctx) {
      void this.ctx.close().catch(() => {})
      this.ctx = null
    }
    this.status = { ...INITIAL }
  }
}

export function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
