"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Sparkles, AlertCircle, RefreshCw, Mic, MessageSquare, PhoneOff } from "lucide-react";
import { AudioVisualizer } from "./AudioVisualizer";
import { VoiceControls } from "./VoiceControls";
import { VoiceName, EphemeralTokenSession } from "@/packages/voice/types";
import { floatTo16BitPCM, pcmToBase64 } from "@/packages/voice/audio/pcmConverter";
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
  const recognitionRef = useRef<any>(null);
  const voiceStateRef = useRef(voiceState);
  voiceStateRef.current = voiceState;

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

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
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
        // Silent telemetry
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
    }, 600);
  }, [session?.sessionId, durationSeconds, cleanup, onClose]);

  // Global Escape key listener to close voice modal
  useEffect(() => {
    const handleVoiceKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        endCall();
      }
    };
    window.addEventListener("keydown", handleVoiceKeyDown);
    return () => window.removeEventListener("keydown", handleVoiceKeyDown);
  }, [endCall]);

  // Spoken Conversation Handler (Dual-Mode: Speech Recognition + Live Server Intelligence)
  const handleSpokenTurn = useCallback(
    async (userUtterance: string) => {
      if (!userUtterance.trim()) return;

      // 1. User utterance registered
      setVoiceState("listening");
      setAudioLevel(0.75);
      setTranscripts((prev) => [
        ...prev,
        { id: `user-${Date.now()}`, role: "user", text: userUtterance },
      ]);
      await saveTranscriptToDatabase("user", userUtterance);

      // 2. AI Thinking
      setVoiceState("thinking");
      setAudioLevel(0.35);

      try {
        // Call chat API (powered by live Gemini 2.5 Flash + dynamic knowledge grounding)
        const res = await fetch("/api/chat/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userUtterance,
            conversationId,
            customerId,
            channel: "voice",
          }),
        });

        let aiReply =
          "Welcome to IMPACT Enterprise. We engineer custom AI agents, automated workflows, and enterprise software. How can we accelerate your business?";

        if (res.ok) {
          const data = await res.json();
          if (data.data?.reply) {
            aiReply = data.data.reply.replace(/^\[DEVELOPMENT MOCK:[^\]]+\]\s*/i, "");
          }
        }

        // 3. AI Speaking
        setVoiceState("speaking");
        setAudioLevel(0.9);
        setTranscripts((prev) => [
          ...prev,
          { id: `ai-${Date.now()}`, role: "model", text: aiReply },
        ]);
        await saveTranscriptToDatabase("model", aiReply);

        // Synthesize spoken voice using browser SpeechSynthesis
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(aiReply);
          utterance.rate = 1.02;
          utterance.pitch = 1.0;

          const voices = window.speechSynthesis.getVoices();
          const preferred =
            voices.find(
              (v) =>
                v.lang.startsWith("en") &&
                (v.name.includes("Natural") ||
                  v.name.includes("Google") ||
                  v.name.includes("Samantha") ||
                  v.name.includes("Alex"))
            ) || voices.find((v) => v.lang.startsWith("en"));

          if (preferred) {
            utterance.voice = preferred;
          }

          utterance.onend = () => {
            setVoiceState("listening");
            setAudioLevel(0.2);
            // Resume listening if recognition is active
            if (recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch {}
            }
          };

          utterance.onerror = () => {
            setVoiceState("listening");
            setAudioLevel(0.2);
          };

          window.speechSynthesis.speak(utterance);
        } else {
          await new Promise((r) => setTimeout(r, 2000));
          setVoiceState("listening");
          setAudioLevel(0.2);
        }
      } catch (err) {
        console.error("Spoken turn error:", err);
        setVoiceState("listening");
        setAudioLevel(0.2);
      }
    },
    [conversationId, customerId, saveTranscriptToDatabase]
  );

  // Activate Browser-Native Speech Recognition Engine
  const startInteractiveSpeechRecognition = useCallback(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceState("listening");
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setVoiceState("listening");
        setAudioLevel(0.4);
      };

      recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const spokenText = lastResult[0].transcript.trim();
          if (spokenText) {
            handleSpokenTurn(spokenText);
          }
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error !== "no-speech") {
          console.warn("Speech recognition notice:", e.error);
        }
      };

      recognition.onend = () => {
        if (voiceStateRef.current === "listening") {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Interactive speech initialization:", err);
      setVoiceState("listening");
    }
  }, [handleSpokenTurn]);

  // Start Realtime Voice Call
  const startCall = useCallback(async () => {
    setVoiceState("connecting");
    setErrorMessage(null);
    setDurationSeconds(0);

    try {
      // 1. Obtain session configuration from backend
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

      // Start duration timer
      timerRef.current = setInterval(() => {
        setDurationSeconds((sec) => sec + 1);
      }, 1000);

      // 2. Check if Mock/Simulator or if WebSocket is available
      if (activeSession.isMock || !activeSession.webSocketUrl.startsWith("wss://")) {
        // Run initial welcome greeting
        setVoiceState("speaking");
        const greeting =
          "Hello! I am IMPACT AI, your Senior Technical Consultant for IMPACT Enterprise. How can we help scale your business today?";
        setTranscripts([
          { id: `ai-${Date.now()}`, role: "model", text: greeting },
        ]);
        await saveTranscriptToDatabase("model", greeting);

        if (typeof window !== "undefined" && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(greeting);
          utterance.onend = () => {
            setVoiceState("listening");
            startInteractiveSpeechRecognition();
          };
          window.speechSynthesis.speak(utterance);
        } else {
          setVoiceState("listening");
          startInteractiveSpeechRecognition();
        }
        return;
      }

      // 3. Live Google Gemini Live WebSocket Stream
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
        audioContextRef.current = audioCtx;
        audioQueueRef.current = new AudioBufferQueue(24000, audioCtx);

        const ws = new WebSocket(activeSession.webSocketUrl);
        socketRef.current = ws;

        ws.onopen = async () => {
          setVoiceState("listening");

          // Step A: Send mandatory BidiGenerateContentSetup frame
          const setupMessage = {
            setup: {
              model: `models/${activeSession.model || "gemini-3.1-flash-live-preview"}`,
              generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: {
                      voiceName: selectedVoice,
                    },
                  },
                },
              },
              systemInstruction: {
                parts: [
                  {
                    text:
                      activeSession.systemInstructionPreview ||
                      "You are IMPACT AI, elite Voice Consultant for IMPACT Enterprise.",
                  },
                ],
              },
            },
          };
          ws.send(JSON.stringify(setupMessage));

          // Step B: Stream microphone PCM
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
          } catch {
            // If mic access denied, fall back to interactive recognition
            startInteractiveSpeechRecognition();
          }
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            const serverContent = msg.serverContent;
            if (!serverContent) return;

            if (serverContent.interrupted) {
              setVoiceState("interrupted");
              if (audioQueueRef.current) {
                audioQueueRef.current.flush();
              }
              setTimeout(() => setVoiceState("listening"), 500);
              return;
            }

            if (serverContent.modelTurn?.parts) {
              setVoiceState("speaking");
              setAudioLevel(0.85);

              for (const part of serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                  audioQueueRef.current?.enqueueBase64Chunk(part.inlineData.data);
                }
              }
            }

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

        ws.onerror = () => {
          // Graceful switch to interactive speech mode rather than fatal error
          startInteractiveSpeechRecognition();
        };

        ws.onclose = () => {
          if (voiceStateRef.current !== "ended") {
            startInteractiveSpeechRecognition();
          }
        };
      } catch {
        // Fall back seamlessly to browser speech mode
        startInteractiveSpeechRecognition();
      }
    } catch (err: any) {
      const errMsg =
        typeof err === "string"
          ? err
          : err?.message && err.message !== "[object Object]"
          ? err.message
          : "Unable to start voice session.";
      setErrorMessage(errMsg);
      // Even on session fetch error, engage interactive speech mode
      startInteractiveSpeechRecognition();
    }
  }, [
    selectedVoice,
    conversationId,
    customerId,
    isMuted,
    saveTranscriptToDatabase,
    startInteractiveSpeechRecognition,
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

  const quickVoicePrompts = [
    "What AI agents do you build?",
    "Tell me about the Restaurant Platform",
    "What is your pricing model?",
    "Can I book a discovery consultation?",
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-modal-title"
    >
      <div className="relative w-full max-w-lg bg-[#0D1117] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-accent/20 border border-brand-accent/30 text-brand-accent">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="voice-modal-title" className="text-sm font-bold text-white tracking-tight">
                IMPACT AI Realtime Voice
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Gemini Live Voice • Interactive Audio</span>
              </div>
            </div>
          </div>

          {/* High-Contrast Close Voice Call Button */}
          <button
            type="button"
            onClick={endCall}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-white border border-red-500/30 font-bold text-xs transition-colors cursor-pointer shadow-xs"
            aria-label="Close voice call and return to website"
            title="Close voice call (Esc)"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>End Call</span>
          </button>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage} (Engaged interactive audio fallback)</span>
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
            <span className="flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-brand-accent" />
              <span>Live Spoken Dialogue</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono lowercase">
              speak into your mic or click a prompt
            </span>
          </div>

          <div
            ref={transcriptContainerRef}
            className="h-36 overflow-y-auto space-y-2.5 p-3 rounded-xl bg-black/40 border border-white/5 text-xs"
          >
            {transcripts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center gap-2">
                <Mic className="w-6 h-6 text-brand-accent/60 animate-pulse" />
                <p className="text-xs font-medium">
                  Listening... Speak into your microphone to converse with IMPACT AI.
                </p>
              </div>
            ) : (
              transcripts.map((t) => (
                <div
                  key={t.id}
                  className={`flex flex-col ${
                    t.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <span className="text-[9px] uppercase font-bold text-gray-400 mb-0.5">
                    {t.role === "user" ? "You" : `IMPACT AI`}
                  </span>
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl ${
                      t.role === "user"
                        ? "bg-brand-accent text-white rounded-tr-none"
                        : "bg-white/10 text-gray-100 rounded-tl-none border border-white/10"
                    }`}
                  >
                    {t.text}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Suggested Voice Question Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {quickVoicePrompts.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handleSpokenTurn(p)}
              disabled={voiceState === "thinking" || voiceState === "speaking"}
              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-[10px] font-medium text-gray-300 hover:text-white whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
              title={`Ask: "${p}"`}
            >
              💬 {p}
            </button>
          ))}
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

        {/* Secondary Return to Website Link */}
        <div className="text-center pt-1 border-t border-white/5">
          <button
            type="button"
            onClick={endCall}
            className="text-[11px] text-gray-400 hover:text-white underline transition-colors cursor-pointer"
          >
            Close voice call and explore website
          </button>
        </div>
      </div>
    </div>
  );
};
