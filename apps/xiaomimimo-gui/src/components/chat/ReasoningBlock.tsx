import { useState } from "react";
import { Brain, ChevronDown } from "lucide-react";

interface ReasoningBlockProps {
  content: string;
  tokenCount?: number;
  durationMs?: number;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function ReasoningBlock({
  content,
  tokenCount,
  durationMs,
}: ReasoningBlockProps) {
  const [expanded, setExpanded] = useState(false);

  const wordCount = content.trim().split(/\s+/).length;

  return (
    <div className="my-2 border border-[#2a2f3a] rounded-xl bg-[#0f1115]/60 overflow-hidden transition-all duration-200 hover:border-[#3a4050]">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-[#2a2f3a]/30 transition-colors group"
      >
        <div className="w-6 h-6 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center flex-shrink-0">
          <Brain size={13} className="text-[#3b82f6]" />
        </div>
        <span className="text-xs text-[#9ca3af] flex-1">
          Reasoning
          {tokenCount !== undefined && (
            <span className="ml-1.5 text-[#9ca3af]/70">
              &middot; {tokenCount} tokens
            </span>
          )}
          {durationMs !== undefined && (
            <span className="ml-1.5 text-[#9ca3af]/70">&middot; {formatDuration(durationMs)}</span>
          )}
          {!tokenCount && !durationMs && (
            <span className="ml-1.5 text-[#9ca3af]/70">&middot; {wordCount} words</span>
          )}
        </span>
        <ChevronDown
          size={14}
          className={`text-[#9ca3af] transition-transform duration-200 group-hover:text-[#e6e6e6] ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`expandable-content ${expanded ? "expanded" : "collapsed"}`}
      >
        <div className="border-t border-[#2a2f3a] px-3 py-3 bg-[#0f1115]/40">
          <p className="text-xs text-[#9ca3af] leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
}
