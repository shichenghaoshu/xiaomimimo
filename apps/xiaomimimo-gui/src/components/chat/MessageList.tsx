import { useRef, useEffect } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useChatStore } from "@/stores/chatStore";
import MessageBubble from "./MessageBubble";

export default function MessageList() {
  const messages = useChatStore((s) => s.messages);
  const isLoading = useChatStore((s) => s.isLoading);

  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Auto-scroll to bottom when new messages arrive or loading state changes */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  /* Empty state */
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-[#9ca3af] select-none">
        <div className="w-16 h-16 rounded-2xl bg-[#ff6900]/10 border border-[#ff6900]/20 flex items-center justify-center animate-logo-pulse">
          <Sparkles size={26} className="text-[#ff6900]" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-[#e6e6e6] tracking-tight">
            xiaomimimo
          </p>
          <p className="text-xs mt-1.5 text-[#9ca3af]/80">
            How can I help you today?
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto"
    >
      {/* Message list */}
      <div className="py-2">
        {messages.map((msg) => (
          <div key={msg.id} className="animate-msg-in">
            <MessageBubble message={msg} />
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center gap-2 px-6 py-3 animate-fade-in">
          <Loader2 size={14} className="animate-spin text-[#ff6900]" />
          <span className="text-xs text-[#9ca3af]">MiMo is thinking...</span>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
