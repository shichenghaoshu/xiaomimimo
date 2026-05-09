import { useState } from "react";
import {
  Mic,
  Volume2,
  Play,
  AudioLines,
} from "lucide-react";

const VOICES = [
  { value: "professional_cn", label: "Professional CN" },
  { value: "energetic_presenter", label: "Energetic Presenter" },
  { value: "calm_assistant", label: "Calm Assistant" },
  { value: "customer_service", label: "Customer Service" },
  { value: "football_commentary", label: "Football Commentary" },
  { value: "teacher_explainer", label: "Teacher Explainer" },
];

interface AudioHistoryItem {
  id: string;
  text: string;
  voice: string;
  speed: number;
  createdAt: string;
}

export default function VoicePanel() {
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [voice, setVoice] = useState("professional_cn");
  const [speed, setSpeed] = useState(1.0);
  const [history, _setHistory] = useState<AudioHistoryItem[]>([]);

  const handleTest = () => {
    // In mock mode, this would call ttsSpeak
  };

  return (
    <div className="h-full flex flex-col bg-[#171a21] overflow-auto">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a2f3a] flex-shrink-0">
        <Mic size={16} className="text-[#ff6900]" />
        <span className="text-sm font-semibold text-[#e6e6e6] tracking-tight">
          Text-to-Speech
        </span>
      </div>

      <div className="p-4 space-y-6">
        {/* TTS master toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0f1115] border border-[#2a2f3a] flex items-center justify-center flex-shrink-0">
              <Volume2 size={15} className="text-[#9ca3af]" />
            </div>
            <div>
              <span className="text-sm font-medium text-[#e6e6e6]">TTS Enabled</span>
              <p className="text-[10px] text-[#9ca3af]/70 mt-0.5">
                Automatically speak assistant responses
              </p>
            </div>
          </div>
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0 ${
              ttsEnabled
                ? "bg-[#ff6900] shadow-sm shadow-[#ff6900]/30"
                : "bg-[#2a2f3a]"
            } focus-visible:outline-2 focus-visible:outline-[#ff6900]`}
            role="switch"
            aria-checked={ttsEnabled}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                ttsEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Voice style selector */}
        <div>
          <label className="text-xs font-semibold text-[#9ca3af] block mb-2.5 tracking-tight">
            Voice Style
          </label>
          <div className="space-y-1.5">
            {VOICES.map(({ value, label }) => (
              <label
                key={value}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                  voice === value
                    ? "border-[#ff6900]/50 bg-[#ff6900]/5 text-[#e6e6e6]"
                    : "border-[#2a2f3a] bg-[#0f1115] text-[#9ca3af] hover:border-[#3a4050] hover:bg-[#0f1115]/80"
                }`}
              >
                <input
                  type="radio"
                  name="voice"
                  value={value}
                  checked={voice === value}
                  onChange={(e) => setVoice(e.target.value)}
                  className="sr-only"
                />
                <span
                  className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    voice === value
                      ? "border-[#ff6900]"
                      : "border-[#2a2f3a]"
                  }`}
                >
                  {voice === value && (
                    <span className="w-2 h-2 rounded-full bg-[#ff6900]" />
                  )}
                </span>
                <span className="text-xs font-medium">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Speed slider */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-semibold text-[#9ca3af] tracking-tight">Speed</label>
            <span className="text-xs text-[#e6e6e6] font-mono font-medium">
              {speed.toFixed(1)}x
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] text-[#4a4f5a] font-medium">0.5x</span>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-[#2a2f3a] rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-[#ff6900]
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-sm
                [&::-webkit-slider-thumb]:shadow-[#ff6900]/20
                [&::-webkit-slider-thumb]:transition-transform
                [&::-webkit-slider-thumb]:hover:scale-110
              "
            />
            <span className="text-[10px] text-[#4a4f5a] font-medium">2.0x</span>
          </div>
        </div>

        {/* Test button */}
        <button
          onClick={handleTest}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-[#2a2f3a] bg-[#0f1115] text-xs font-medium text-[#e6e6e6] hover:bg-[#2a2f3a] hover:border-[#3a4050] transition-all duration-200 active:scale-[0.99]"
        >
          <Play size={14} className="text-[#ff6900]" />
          Speak "Hello World"
        </button>

        {/* Audio history */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <AudioLines size={14} className="text-[#9ca3af]" />
            <span className="text-xs font-semibold text-[#e6e6e6] tracking-tight">
              Audio History
            </span>
          </div>

          {history.length === 0 ? (
            <div className="border border-[#2a2f3a] rounded-xl p-6 bg-[#0f1115] text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#2a2f3a]/30 mb-3">
                <Mic size={18} className="text-[#2a2f3a]" />
              </div>
              <p className="text-xs font-medium text-[#9ca3af]">
                No audio generated yet
              </p>
              <p className="text-[10px] text-[#4a4f5a] mt-1.5 leading-relaxed">
                Enable TTS and send a message to generate spoken responses.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 border border-[#2a2f3a] rounded-xl p-3 bg-[#0f1115] hover:border-[#3a4050] transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#ff6900]/10 flex items-center justify-center flex-shrink-0">
                    <Play size={13} className="text-[#ff6900]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#e6e6e6] truncate font-medium">
                      {item.text}
                    </p>
                    <p className="text-[10px] text-[#9ca3af]/70 mt-0.5">
                      {item.voice} &middot; {item.speed.toFixed(1)}x &middot;{" "}
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
