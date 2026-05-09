import { useRef, useEffect, useCallback, useState } from "react";
import { Send, AtSign } from "lucide-react";
import { useChatStore } from "@/stores/chatStore";
import AttachmentTray from "./AttachmentTray";

const MODES = ["plan", "agent", "yolo"] as const;

export default function PromptComposer() {
  const mode = useChatStore((s) => s.mode);
  const setMode = useChatStore((s) => s.setMode);
  const isLoading = useChatStore((s) => s.isLoading);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const attachments = useChatStore((s) => s.attachments);
  const removeAttachment = useChatStore((s) => s.removeAttachment);

  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* Auto-resize the textarea */
  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxH = 200;
    el.style.height = `${Math.min(el.scrollHeight, maxH)}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [value, resize]);

  /* Enter to send (unless Shift held), Shift+Enter for newline */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        sendMessage(value.trim());
        setValue("");
      }
    }
  };

  const handleSend = () => {
    if (value.trim() && !isLoading) {
      sendMessage(value.trim());
      setValue("");
    }
  };

  const charCount = value.length;
  const canSend = value.trim().length > 0 && !isLoading;

  return (
    <div className="border-t border-[#2a2f3a] bg-[#171a21] flex-shrink-0">
      {/* Attachment tray */}
      <AttachmentTray
        attachments={attachments}
        onRemove={removeAttachment}
      />

      {/* Mode selector */}
      <div className="flex items-center gap-2 px-3 pt-2">
        <span className="text-[11px] text-[#9ca3af] font-medium">Mode</span>
        {MODES.map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-0.5 rounded-full text-[11px] font-medium transition-all duration-200 ${
              mode === m
                ? "bg-[#ff6900]/20 text-[#ff6900] border border-[#ff6900]/30 shadow-sm"
                : "text-[#9ca3af] border border-transparent hover:text-[#e6e6e6] hover:bg-[#2a2f3a]/60 hover:border-[#3a4050]"
            } focus-visible:outline-2 focus-visible:outline-[#ff6900]`}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="flex items-end gap-2 px-3 py-2.5">
        {/* @-mention button */}
        <button
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-[#9ca3af] hover:text-[#e6e6e6] hover:bg-[#2a2f3a]/70 transition-all duration-200 mb-0.5"
          title="Mention a file (@)"
        >
          <AtSign size={16} />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask MiMo anything...  (Shift + Enter for newline)"
          rows={1}
          disabled={isLoading}
          className="flex-1 resize-none bg-transparent text-sm text-[#e6e6e6] placeholder-[#9ca3af]/50 outline-none leading-relaxed max-h-[200px] py-1 transition-colors"
        />

        {/* Character count */}
        <span
          className={`flex-shrink-0 text-[11px] min-w-[3ch] text-right tabular-nums transition-colors ${
            charCount > 4000 ? "text-[#ef4444]" : "text-[#9ca3af]/60"
          }`}
        >
          {charCount > 0 ? charCount.toLocaleString() : ""}
        </span>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 mb-0.5 ${
            canSend
              ? "bg-[#ff6900] text-white hover:bg-[#ff6900]/85 active:scale-95 animate-send-pulse"
              : "bg-[#2a2f3a] text-[#9ca3af] cursor-not-allowed"
          } focus-visible:outline-2 focus-visible:outline-[#ff6900]`}
          title="Send message (Enter)"
        >
          {isLoading ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send size={14} />
          )}
        </button>
      </div>
    </div>
  );
}
