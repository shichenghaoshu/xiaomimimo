import { useState } from "react";
import { Wrench, Loader2, Check, X, ChevronDown, ChevronRight, AlertTriangle, Ban } from "lucide-react";
import type { ToolCall } from "@/lib/types";

interface ToolCallCardProps {
  toolCall: ToolCall;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const statusConfig: Record<ToolCall["status"], { icon: typeof Check; color: string; bg: string; label: string }> = {
  pending:   { icon: Loader2, color: "text-[#3b82f6]", bg: "bg-[#3b82f6]/10", label: "Pending" },
  running:   { icon: Loader2, color: "text-[#3b82f6]", bg: "bg-[#3b82f6]/10", label: "Running" },
  success:   { icon: Check,    color: "text-[#22c55e]", bg: "bg-[#22c55e]/10", label: "Success" },
  failed:    { icon: X,        color: "text-[#ef4444]", bg: "bg-[#ef4444]/10", label: "Failed" },
  rejected:  { icon: Ban,      color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10", label: "Rejected" },
};

function formatArgs(args: string): string {
  try {
    return JSON.stringify(JSON.parse(args), null, 2);
  } catch {
    return args;
  }
}

export default function ToolCallCard({ toolCall, onApprove, onReject }: ToolCallCardProps) {
  const [showArgs, setShowArgs] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const config = statusConfig[toolCall.status];
  const isSpinning = toolCall.status === "pending" || toolCall.status === "running";

  return (
    <div className="my-2 border border-[#2a2f3a] rounded-xl bg-[#0f1115]/60 overflow-hidden transition-all duration-200 hover:border-[#3a4050]">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2">
        <Wrench size={14} className="text-[#9ca3af] flex-shrink-0" />
        <span className="text-xs font-medium text-[#e6e6e6] flex-shrink-0">
          {toolCall.name}
        </span>

        {/* Status badge */}
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${config.color} ${config.bg} flex-shrink-0`}>
          <config.icon size={10} className={isSpinning ? "animate-spin" : ""} />
          {config.label}
        </span>

        <div className="flex-1" />

        {toolCall.argsPreview && (
          <button
            onClick={() => setShowArgs((v) => !v)}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[#9ca3af] hover:text-[#e6e6e6] hover:bg-[#2a2f3a]/60 transition-all duration-200"
          >
            <span className="text-[11px]">args</span>
            <span className={`transition-transform duration-200 ${showArgs ? "rotate-180" : ""}`}>
              <ChevronDown size={12} />
            </span>
          </button>
        )}

        {toolCall.resultPreview && (
          <button
            onClick={() => setShowResult((v) => !v)}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[#9ca3af] hover:text-[#e6e6e6] hover:bg-[#2a2f3a]/60 transition-all duration-200 ml-1"
          >
            <span className="text-[11px]">result</span>
            <span className={`transition-transform duration-200 ${showResult ? "rotate-180" : ""}`}>
              <ChevronDown size={12} />
            </span>
          </button>
        )}

        {/* Approval buttons */}
        {toolCall.requiresApproval && toolCall.status === "pending" && (
          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={() => onApprove?.(toolCall.id)}
              className="px-2.5 h-5.5 flex items-center gap-1 rounded-md text-[11px] font-medium bg-[#22c55e]/15 text-[#22c55e] hover:bg-[#22c55e]/25 transition-all duration-200 active:scale-95"
            >
              <Check size={10} /> Approve
            </button>
            <button
              onClick={() => onReject?.(toolCall.id)}
              className="px-2.5 h-5.5 flex items-center gap-1 rounded-md text-[11px] font-medium bg-[#ef4444]/15 text-[#ef4444] hover:bg-[#ef4444]/25 transition-all duration-200 active:scale-95"
            >
              <X size={10} /> Reject
            </button>
          </div>
        )}
      </div>

      {/* Args preview */}
      {showArgs && toolCall.argsPreview && (
        <div className="border-t border-[#2a2f3a] px-3 py-2.5 bg-[#0f1115]/40 animate-fade-in">
          <pre className="text-xs text-[#9ca3af] overflow-x-auto whitespace-pre font-mono leading-relaxed max-h-36 overflow-y-auto">
            {formatArgs(toolCall.argsPreview)}
          </pre>
        </div>
      )}

      {/* Result preview */}
      {showResult && toolCall.resultPreview && (
        <div className="border-t border-[#2a2f3a] px-3 py-2.5 bg-[#0f1115]/40 animate-fade-in">
          <pre className="text-xs text-[#e6e6e6] overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto">
            {toolCall.resultPreview}
          </pre>
        </div>
      )}
    </div>
  );
}
