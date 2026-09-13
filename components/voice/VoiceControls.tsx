"use client";

import React from "react";
import { Mic, MicOff, PhoneOff, Volume2 } from "lucide-react";
import { VoiceName } from "@/packages/voice/types";

interface VoiceControlsProps {
  isMuted: boolean;
  onToggleMute: () => void;
  selectedVoice: VoiceName;
  onChangeVoice: (voice: VoiceName) => void;
  onEndCall: () => void;
  durationSeconds: number;
  isConnected: boolean;
}

const AVAILABLE_VOICES: { name: VoiceName; label: string; desc: string }[] = [
  { name: "Puck", label: "Puck", desc: "Dynamic & Clear" },
  { name: "Charon", label: "Charon", desc: "Authoritative & Deep" },
  { name: "Kore", label: "Kore", desc: "Approachable & Warm" },
  { name: "Fenrir", label: "Fenrir", desc: "Bold & Direct" },
  { name: "Aoede", label: "Aoede", desc: "Professional & Melodic" },
];

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  isMuted,
  onToggleMute,
  selectedVoice,
  onChangeVoice,
  onEndCall,
  durationSeconds,
  isConnected,
}) => {
  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Top Bar: Timer and Voice Selector */}
      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {isConnected ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            )}
          </span>
          <span className="font-mono text-white text-xs font-semibold">
            {formatDuration(durationSeconds)}
          </span>
        </div>

        {/* Voice Selector */}
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
          <Volume2 className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={selectedVoice}
            onChange={(e) => onChangeVoice(e.target.value as VoiceName)}
            className="bg-transparent text-xs text-gray-200 outline-none cursor-pointer"
            aria-label="Select AI Spoken Voice"
          >
            {AVAILABLE_VOICES.map((v) => (
              <option key={v.name} value={v.name} className="bg-gray-900 text-white">
                Voice: {v.label} ({v.desc})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Buttons Bar */}
      <div className="flex items-center justify-center gap-4 py-2">
        {/* Mute/Unmute Toggle */}
        <button
          onClick={onToggleMute}
          disabled={!isConnected}
          className={`p-4 rounded-full transition-all duration-200 flex items-center justify-center ${
            isMuted
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30"
              : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
          } ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
          title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
          aria-label={isMuted ? "Unmute Microphone" : "Mute Microphone"}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* End Call Button */}
        <button
          onClick={onEndCall}
          className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg hover:shadow-red-600/50 transition-all duration-200 flex items-center justify-center"
          title="End Voice Call"
          aria-label="End Voice Call"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
