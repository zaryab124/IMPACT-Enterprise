/**
 * Audio PCM Conversion and Formatting Utilities for Gemini Live API
 * Standards:
 * - Input: 16-bit Linear PCM, 16000Hz, Mono, Little-Endian
 * - Output: 16-bit Linear PCM, 24000Hz, Mono, Little-Endian
 */

/**
 * Convert Web Audio Float32 samples (-1.0 to 1.0) into 16-bit PCM (Int16Array)
 */
export function floatTo16BitPCM(float32Array: Float32Array): Int16Array {
  const pcm16 = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return pcm16;
}

/**
 * Convert 16-bit PCM (Int16Array) into Float32Array (-1.0 to 1.0) for Web Audio playback
 */
export function pcm16ToFloat32(pcm16: Int16Array): Float32Array {
  const float32 = new Float32Array(pcm16.length);
  for (let i = 0; i < pcm16.length; i++) {
    float32[i] = pcm16[i] / (pcm16[i] < 0 ? 0x8000 : 0x7fff);
  }
  return float32;
}

/**
 * Convert PCM Int16Array or raw bytes to a base64 encoded string
 */
export function pcmToBase64(pcm: Int16Array | Uint8Array): string {
  const buffer = pcm instanceof Uint8Array ? pcm.buffer : pcm.buffer;
  const uint8 = new Uint8Array(buffer);
  
  if (typeof Buffer !== "undefined") {
    return Buffer.from(uint8).toString("base64");
  }

  let binary = "";
  for (let i = 0; i < uint8.byteLength; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string to 16-bit PCM (Int16Array)
 */
export function base64To16BitPCM(base64: string): Int16Array {
  let uint8: Uint8Array;
  if (typeof Buffer !== "undefined") {
    const buf = Buffer.from(base64, "base64");
    uint8 = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  } else {
    const binary = atob(base64);
    uint8 = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      uint8[i] = binary.charCodeAt(i);
    }
  }

  return new Int16Array(uint8.buffer, uint8.byteOffset, uint8.byteLength / 2);
}

/**
 * Resample Float32 audio buffer from inputRate (e.g. 44100/48000) to outputRate (16000)
 */
export function downsampleBuffer(
  buffer: Float32Array,
  inputRate: number,
  outputRate = 16000
): Float32Array {
  if (inputRate === outputRate) {
    return buffer;
  }
  if (inputRate < outputRate) {
    return buffer; // Do not upsample
  }

  const sampleRatio = inputRate / outputRate;
  const newLength = Math.round(buffer.length / sampleRatio);
  const result = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const originalIndex = Math.floor(i * sampleRatio);
    result[i] = buffer[originalIndex];
  }

  return result;
}

/**
 * Calculate Root Mean Square (RMS) energy for audio level visualization
 */
export function calculateAudioEnergy(pcm: Int16Array): number {
  if (pcm.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < pcm.length; i++) {
    sum += pcm[i] * pcm[i];
  }
  const mean = sum / pcm.length;
  const rms = Math.sqrt(mean);
  return Math.min(1, rms / 10000);
}

/**
 * Generate synthetic 16-bit PCM sine wave for mock simulator & testing
 */
export function generateSyntheticSineWavePCM(
  durationMs: number,
  frequency = 440,
  sampleRate = 24000
): Int16Array {
  const totalSamples = Math.floor((sampleRate * durationMs) / 1000);
  const pcm = new Int16Array(totalSamples);
  const amplitude = 0.5 * 32767;

  for (let i = 0; i < totalSamples; i++) {
    const time = i / sampleRate;
    pcm[i] = Math.round(amplitude * Math.sin(2 * Math.PI * frequency * time));
  }

  return pcm;
}
