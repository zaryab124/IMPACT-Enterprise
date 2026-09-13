"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { AudioVisualizer } from "./AudioVisualizer";
import { VoiceControls } from "./VoiceControls";
import { VoiceName, EphemeralTokenSession } from "@/packages/voice/types";
import { floatTo16BitPCM, pcmToBase64, generateSyntheticSineWavePCM, pcm16ToFloat32 } from "@/packages/voice/audio/pcmConverter";
import { AudioBufferQueue } from "@/packages/voice/audio/audioBufferQueue";

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId?: string;
  customerId?: string;
}

interface TranscriptLine {
  id: string;
  role: "user" | "model";
  text: string;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  conversationId,
  customerId,
}) => {
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>("Puck");
  const [voiceState, setVoiceState] = useState<
    "idle" | "connecting" | "listening" | "thinking" | "speaking" | "interrupted" | "ended" | "error"
  >("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [session, setSession] = useState<EphemeralTokenSession | null>(null);
  const [transcripts, setTranscripts] = useState<TranscriptLine[]>([]);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0.2);

  // References
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioBufferQueue | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll transcript container
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [transcripts]);

  // Clean up all audio and network resources
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
      } catch {}
      scriptProcessorRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (socketRef.current) {
      try {
        socketRef.current.close();
      } catch {}
      socketRef.current = null;
    }

    if (audioQueueRef.current) {
      audioQueueRef.current.flush();
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
  }, []);

  // Post transcript turn to database
  const saveTranscriptToDatabase = useCallback(
    async (role: "user" | "model", text: string, isInterrupted = false) => {
      if (!session?.sessionId) return;
      try {
        await fetch("/api/voice/transcript", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: session.sessionId,
            conversationId,
            role,
            text,
            isInterrupted,
          }),
        });
      } catch {
        // Silent catch for telemetry
      }
    },
    [session?.sessionId, conversationId]
  );

  // Finalize call and persist metrics
  const endCall = useCallback(async () => {
    setVoiceState("ended");
    if (session?.sessionId) {
      try {
        await fetch("/api/voice/transcript", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: session.sessionId,
            endCall: true,
            durationSeconds,
          }),
        });
      } catch {}
    }
    cleanup();
    setTimeout(() => {
      onClose();
    }, 1200);
  }, [session?.sessionId, durationSeconds, cleanup, onClose]);

  // Simulated Mock Conversation Pipeline for Development & Offline Mode
  const runMockSpokenTurn = useCallback(
    async (userUtterance: string, aiReply: string) => {
      // 1. User utterance
      setVoiceState("listening");
      setAudioLevel(0.7);
      setTranscripts((prev) => [
        ...prev,
        { id: `user-${Date.now()}`, role: "user", text: userUtterance },
      ]);
      await saveTranscriptToDatabase("user", userUtterance);

      // 2. AI Thinking
      await new Promise((r) => setTimeout(r, 600));
      setVoiceState("thinking");
      setAudioLevel(0.3);

      // 3. AI Speaking
      await new Promise((r) => setTimeout(r, 700));
      setVoiceState("speaking");
      setAudioLevel(0.9);
      setTranscripts((prev) => [
        ...prev,
        { id: `ai-${Date.now()}`, role: "model", text: aiReply },
      ]);
      await saveTranscriptToDatabase("model", aiReply);

      // Synthetic audio beep/tone for realistic feedback if AudioContext available
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        if (ctx && ctx.state !== "closed") {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        }
      } catch {}

      // 4. Return to Listening
      await new Promise((r) => setTimeout(r, 1400));
      setVoiceState("listening");
      setAudioLevel(0.2);
    },
    [saveTranscriptToDatabase]
  );

  // Start Realtime Voice Call
  const startCall = useCallback(async () => {
    setVoiceState("connecting");
    setErrorMessage(null);
    setDurationSeconds(0);

    try {
      // 1. Obtain ephemeral session token from backend
      const res = await fetch("/api/voice/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voiceName: selectedVoice,
          conversationId,
          customerId,
        }),
      });

      const data = await res.json();
      if (!data.success || !data.session) {
        const errorText =
          typeof data.error === "string"
            ? data.error
            : data.error?.message || data.details || "Failed to acquire real-time voice session";
        throw new Error(errorText);
      }

      const activeSession: EphemeralTokenSession = data.session;
      setSession(activeSession);

      // Initialize audio queue
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
      audioContextRef.current = audioCtx;
      audioQueueRef.current = new AudioBufferQueue(24000, audioCtx);

      // Start duration timer
      timerRef.current = setInterval(() => {
        setDurationSeconds((sec) => sec + 1);
      }, 1000);

      // Handle Mock Simulator vs Live API
      if (activeSession.isMock) {
        setVoiceState("listening");
        // Greet user in simulator
        setTimeout(() => {
          runMockSpokenTurn(
            "Hello, I'd like to learn more about IMPACT Enterprise's AI automation.",
            "Hello! I am IMPACT AI. We engineer autonomous agents and enterprise automation. What project are you looking to build?"
          );
        }, 800);
        return;
      }

      // Live WebSocket Gemini Live API
      const ws = new WebSocket(activeSession.webSocketUrl);
      socketRef.current = ws;

      ws.onopen = async () => {
        setVoiceState("listening");

        // Request user microphone
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              channelCount: 1,
              sampleRate: 16000,
              echoCancellation: true,
              noiseSuppression: true,
            },
          });
          mediaStreamRef.current = stream;

          const recordCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 16000,
          });
          const source = recordCtx.createMediaStreamSource(stream);
          const processor = recordCtx.createScriptProcessor(4096, 1, 1);
          scriptProcessorRef.current = processor;

          processor.onaudioprocess = (e) => {
            if (isMuted || ws.readyState !== WebSocket.OPEN) return;
            const inputData = e.inputBuffer.getChannelData(0);
            const pcm16 = floatTo16BitPCM(inputData);
            const base64Audio = pcmToBase64(pcm16);

            // Stream realtime input chunk
            ws.send(
              JSON.stringify({
                realtimeInput: {
                  mediaChunks: [
                    {
                      mimeType: "audio/pcm;rate=16000",
                      data: base64Audio,
                    },
                  ],
                },
              })
            );
          };

          source.connect(processor);
          processor.connect(recordCtx.destination);
        } catch (micErr: any) {
          setErrorMessage("Microphone access denied. Please grant microphone permission to use voice.");
          setVoiceState("error");
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          const serverContent = msg.serverContent;

          if (!serverContent) return;

          // Check for interruption signal
          if (serverContent.interrupted) {
            setVoiceState("interrupted");
            if (audioQueueRef.current) {
              audioQueueRef.current.flush();
            }
            setTimeout(() => setVoiceState("listening"), 500);
            return;
          }

          // Handle audio modelTurn parts
          if (serverContent.modelTurn?.parts) {
            setVoiceState("speaking");
            setAudioLevel(0.85);

            for (const part of serverContent.modelTurn.parts) {
              if (part.inlineData?.data) {
                audioQueueRef.current?.enqueueBase64Chunk(part.inlineData.data);
              }
            }
          }

          // Handle transcripts
          if (serverContent.inputTranscription?.text) {
            const userText = serverContent.inputTranscription.text;
            setTranscripts((prev) => [
              ...prev,
              { id: `user-${Date.now()}`, role: "user", text: userText },
            ]);
            saveTranscriptToDatabase("user", userText);
          }

          if (serverContent.outputTranscription?.text) {
            const aiText = serverContent.outputTranscription.text;
            setTranscripts((prev) => [
              ...prev,
              { id: `ai-${Date.now()}`, role: "model", text: aiText },
            ]);
            saveTranscriptToDatabase("model", aiText);
          }
        } catch {}
      };

      ws.onerror = (err) => {
        setErrorMessage("Live WebSocket error occurred. Reconnecting or falling back.");
        setVoiceState("error");
      };

      ws.onclose = () => {
        if (voiceState !== "ended") {
          setVoiceState("idle");
        }
      };
    } catch (err: any) {
      const errMsg =
        typeof err === "string"
          ? err
          : err?.message && err.message !== "[object Object]"
          ? err.message
          : "Unable to start voice session. Please verify connection.";
      setErrorMessage(errMsg);
      setVoiceState("error");
    }
  }, [
    selectedVoice,
    conversationId,
    customerId,
    isMuted,
    runMockSpokenTurn,
    saveTranscriptToDatabase,
  ]);

  // Handle open / close lifecycle
  useEffect(() => {
    if (isOpen) {
      startCall();
    } else {
      cleanup();
    }
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-modal-title"
    >
      <div className="relative w-full max-w-lg bg-[#0D1117] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-accent/20 border border-brand-accent/30 text-brand-accent">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="voice-modal-title" className="text-sm font-bold text-white tracking-tight">
                IMPACT AI Realtime Voice
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <span>Model: {session?.model || "gemini-3.1-flash-live-preview"}</span>
                {session?.isMock && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px]">
                    SIMULATOR
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={endCall}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            aria-label="Close voice call"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Animated Harmonic Audio Wave Visualizer */}
        <AudioVisualizer
          isActive={voiceState !== "idle" && voiceState !== "ended"}
          state={voiceState}
          audioLevel={audioLevel}
        />

        {/* Live Streaming Speech Transcript Cards */}
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 flex items-center justify-between">
            <span>Live Speech Transcript</span>
            {session?.isMock && (
              <button
                onClick={() =>
                  runMockSpokenTurn(
                    "Can you tell me your team's availability for a consultation?",
                    "Certainly! Our engineering leads are available Monday through Friday from 9 AM to 6 PM UTC for discovery sessions."
                  )
                }
                className="flex items-center gap-1 text-[10px] text-brand-accent hover:underline lowercase"
                title="Test simulated voice turn"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>Simulate prompt</span>
              </button>
            )}
          </div>

          <div
            ref={transcriptContainerRef}
            className="h-36 overflow-y-auto space-y-2 p-3 rounded-xl bg-black/30 border border-white/5 text-xs"
          >
            {transcripts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 italic text-center text-xs">
                Speak into your microphone to start talking with IMPACT AI...
              </div>
            ) : (
              transcripts.map((t) => (
                <div
                  key={t.id}
                  className={`flex flex-col ${
                    t.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <span className="text-[9px] uppercase font-bold text-gray-500 mb-0.5">
                    {t.role === "user" ? "You" : `IMPACT AI (${selectedVoice})`}
                  </span>
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-2xl ${
                      t.role === "user"
                        ? "bg-brand-accent text-white rounded-tr-none"
                        : "bg-white/10 text-gray-200 rounded-tl-none border border-white/10"
                    }`}
                  >
                    {t.text}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Voice Controls: Mute, Voice Switcher, Timer, End Call */}
        <VoiceControls
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(!isMuted)}
          selectedVoice={selectedVoice}
          onChangeVoice={(voice) => setSelectedVoice(voice)}
          onEndCall={endCall}
          durationSeconds={durationSeconds}
          isConnected={voiceState !== "connecting" && voiceState !== "ended" && voiceState !== "error"}
        />
      </div>
    </div>
  );
};
