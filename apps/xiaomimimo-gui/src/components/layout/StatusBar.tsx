import { useChatStore } from "@/stores/chatStore";

export default function StatusBar() {
  const isLoading = useChatStore((s) => s.isLoading);
  const mode = useChatStore((s) => s.mode);
  const msgCount = useChatStore((s) => s.messages.length);

  return (
    <footer className="h-7 flex items-center px-3 gap-4 border-t border-[#2a2f3a] bg-[#171a21] flex-shrink-0 select-none text-xs text-[#9ca3af]">
      {/* Status */}
      <span className="flex items-center gap-1.5">
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full ${
            isLoading ? "bg-[#3b82f6] animate-pulse" : "bg-[#22c55e]"
          }`}
        />
        <span className={isLoading ? "text-[#3b82f6]" : "text-[#22c55e]"}>
          {isLoading ? "Thinking..." : "Ready"}
        </span>
      </span>

      {/* Separator */}
      <span className="text-[#2a2f3a] select-none">&middot;</span>

      <span>
        Mode: <span className="text-[#e6e6e6] capitalize font-medium">{mode}</span>
      </span>

      <span className="text-[#2a2f3a] select-none">&middot;</span>

      <span>
        Tokens: <span className="text-[#e6e6e6] font-medium">184K / 1,048,576</span>
      </span>

      <span className="text-[#2a2f3a] select-none">&middot;</span>

      <span>
        Messages: <span className="text-[#e6e6e6] font-medium">{msgCount}</span>
      </span>

      <div className="flex-1" />

      <span className="flex items-center gap-1">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
        cache 82%
      </span>
    </footer>
  );
}
