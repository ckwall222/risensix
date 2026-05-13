declare module 'soundtouchjs' {
  export interface PitchShifterPlayDetail {
    timePlayed: number
    sourcePosition: number
    formattedTimePlayed: string
    percentagePlayed: number
    formattedDuration: string
  }

  export class PitchShifter {
    constructor(
      context: AudioContext,
      buffer: AudioBuffer,
      bufferSize: number,
      onEnd?: () => void,
    )
    tempo: number
    pitch: number
    pitchSemitones: number
    rate: number
    percentagePlayed: number
    readonly duration: number
    readonly sampleRate: number
    readonly timePlayed: number
    readonly sourcePosition: number
    readonly formattedDuration: string
    readonly formattedTimePlayed: string
    readonly node: AudioNode
    connect(node: AudioNode): void
    disconnect(): void
    on(eventName: 'play', cb: (detail: PitchShifterPlayDetail) => void): void
    on(eventName: string, cb: (detail: unknown) => void): void
    off(eventName?: string): void
  }
}
