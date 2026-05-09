import { MessageSquare, Key, ArrowRight } from "lucide-react";
import { useChatStore } from "@/stores/chatStore";
import { useSettingsStore } from "@/stores/settingsStore";
import MessageList from "./MessageList";
import PromptComposer from "./PromptComposer";

export default function ChatPanel() {
  const sessionId = useChatStore((s) => s.sessionId);
  const mode = useChatStore((s) => s.mode);
  const isConfigured = useSettingsStore((s) => s.isConfigured);
  const loaded = useSettingsStore((s) => s.loaded);

  // Show config prompt when settings aren't configured
  if (!isConfigured && loaded) {
    return (
      <div className="flex flex-col h-full bg-[#0f1115]">
        {/* Panel header */}
        <div className="h-9 flex items-center px-3 gap-2 border-b border-[#2a2f3a] bg-[#171a21] flex-shrink-0 select-none">
          <MessageSquare size={14} className="text-[#ff6900]" />
          <span className="text-xs font-semibold text-[#e6e6e6] truncate tracking-tight">
            Chat
          </span>
        </div>

        {/* Config prompt */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#171a21] border border-[#2a2f3a] mb-5 animate-logo-pulse">
              <Key size={22} className="text-[#ff6900]" />
            </div>
            <p className="text-sm text-[#e6e6e6] font-semibold mb-2 tracking-tight">
              API Key Required
            </p>
            <p className="text-xs text-[#9ca3af] leading-relaxed mb-6">
              Configure your API key in Settings to start chatting with the
              assistant.
            </p>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.dispatchEvent(
                  new CustomEvent("navigate", { detail: { tab: "settings" } })
                );
              }}
              className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-[#ff6900] text-xs font-semibold text-white hover:bg-[#e55d00] transition-all duration-200 active:scale-95"
            >
              Open Settings
              <ArrowRight size={13} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0f1115]">
      {/* Panel header */}
      <div className="h-9 flex items-center px-3 gap-2 border-b border-[#2a2f3a] bg-[#171a21] flex-shrink-0 select-none">
        <MessageSquare size={14} className="text-[#ff6900]" />
        <span className="text-xs font-semibold text-[#e6e6e6] truncate tracking-tight">
          Chat
        </span>
        <span className="text-[11px] text-[#9ca3af]/70">
          &middot; {sessionId.slice(-8)}
        </span>
        <div className="flex-1" />
        <span className="text-[11px] text-[#9ca3af]">
          mode:{" "}
          <span className="capitalize text-[#ff6900] font-medium">{mode}</span>
        </span>
      </div>

      {/* Message list */}
      <MessageList />

      {/* Prompt composer */}
      <PromptComposer />
    </div>
  );
}
