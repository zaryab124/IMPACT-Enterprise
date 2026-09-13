import { base64To16BitPCM, pcm16ToFloat32 } from "./pcmConverter";

export interface ScheduledAudioNode {
  stop(): void;
}

export class AudioBufferQueue {
  private queue: Float32Array[] = [];
  private isPlayingAudio = false;
  private currentSource: ScheduledAudioNode | null = null;
  private audioContext: any = null; // AudioContext in browser
  private nextPlayTime = 0;
  private outputSampleRate = 24000;
  private interruptionCount = 0;

  constructor(outputSampleRate = 24000, context?: any) {
    this.outputSampleRate = outputSampleRate;
    this.audioContext = context || null;
  }

  /**
   * Set or initialize the Web Audio context (browser-side)
   */
  public setContext(context: any) {
    this.audioContext = context;
  }

  /**
   * Enqueue a raw base64 PCM 24kHz chunk from Gemini Live API
   */
  public enqueueBase64Chunk(base64: string): void {
    const pcm16 = base64To16BitPCM(base64);
    const float32 = pcm16ToFloat32(pcm16);
    this.enqueueFloat32(float32);
  }

  /**
   * Enqueue Float32 PCM chunk
   */
  public enqueueFloat32(chunk: Float32Array): void {
    this.queue.push(chunk);
    this.scheduleNext();
  }

  /**
   * Immediate flush on interruption signal (Voice Activity Detection trigger)
   */
  public flush(): void {
    this.interruptionCount++;
    this.queue = [];
    this.isPlayingAudio = false;

    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch {
        // Source may already have ended
      }
      this.currentSource = null;
    }

    if (this.audioContext) {
      this.nextPlayTime = this.audioContext.currentTime || 0;
    } else {
      this.nextPlayTime = 0;
    }
  }

  /**
   * Schedule next audio chunk for playback
   */
  private scheduleNext(): void {
    if (this.queue.length === 0) {
      this.isPlayingAudio = false;
      return;
    }

    // In a browser Web Audio context
    if (this.audioContext && typeof this.audioContext.createBuffer === "function") {
      const chunk = this.queue.shift();
      if (!chunk) return;

      this.isPlayingAudio = true;
      const audioBuffer = this.audioContext.createBuffer(1, chunk.length, this.outputSampleRate);
      audioBuffer.copyToChannel(chunk, 0);

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);

      const currentTime = this.audioContext.currentTime || 0;
      const startTime = Math.max(currentTime, this.nextPlayTime);
      source.start(startTime);
      this.nextPlayTime = startTime + audioBuffer.duration;

      this.currentSource = source;

      source.onended = () => {
        if (this.currentSource === source) {
          this.currentSource = null;
        }
        this.scheduleNext();
      };
    } else {
      // In non-browser / headless test environment
      if (!this.isPlayingAudio) {
        this.isPlayingAudio = true;
        const chunk = this.queue.shift();
        if (chunk) {
          this.nextPlayTime += (chunk.length / this.outputSampleRate) * 1000;
        }
      }
    }
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  public isPlaying(): boolean {
    return this.isPlayingAudio || this.queue.length > 0;
  }

  public getInterruptionCount(): number {
    return this.interruptionCount;
  }

  public getEstimatedRemainingDurationMs(): number {
    let totalSamples = 0;
    for (const chunk of this.queue) {
      totalSamples += chunk.length;
    }
    return Math.round((totalSamples / this.outputSampleRate) * 1000);
  }
}
