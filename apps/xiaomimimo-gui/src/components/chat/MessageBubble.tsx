import { User, Bot, Wrench, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "@/lib/types";
import ReasoningBlock from "./ReasoningBlock";
import ToolCallCard from "./ToolCallCard";

interface MessageBubbleProps {
  message: Message;
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none text-[#e6e6e6] leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre({ children, ...props }) {
            return (
              <pre
                className="bg-[#0f1115] border border-[#2a2f3a] rounded-xl px-4 py-3 overflow-x-auto text-sm font-mono leading-relaxed my-2"
                {...props}
              >
                {children}
              </pre>
            );
          },
          code({ className, children, ...props }) {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="bg-[#2a2f3a]/70 text-[#22c55e] px-1.5 py-0.5 rounded-md text-[0.82em] font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          p({ children }) {
            return <p className="my-1.5 leading-relaxed">{children}</p>;
          },
          ul({ children }) {
            return (
              <ul className="list-disc pl-5 my-1.5 space-y-0.5">{children}</ul>
            );
          },
          ol({ children }) {
            return (
              <ol className="list-decimal pl-5 my-1.5 space-y-0.5">{children}</ol>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-2 border-[#ff6900] pl-3 my-2 text-[#9ca3af] italic">
                {children}
              </blockquote>
            );
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                className="text-[#ff6900] hover:underline decoration-[#ff6900]/50 underline-offset-2 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/** Compact pill for system / tool messages */
function CompactPill({
  icon: Icon,
  label,
  content,
}: {
  icon: typeof Wrench;
  label: string;
  content: string;
}) {
  return (
    <div className="flex items-start gap-2 py-1.5 text-xs text-[#9ca3af]">
      <Icon size={13} className="text-[#9ca3af] mt-px flex-shrink-0" />
      <span className="text-[#9ca3af] font-medium flex-shrink-0">{label}</span>
      <span className="text-[#e6e6e6]/70">{content}</span>
    </div>
  );
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { role, content } = message;

  /* ── Error ── */
  if (role === "error") {
    return (
      <div className="flex items-start gap-2.5 px-3 py-2.5 mx-3 my-1 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20">
        <AlertCircle size={14} className="text-[#ef4444] mt-0.5 flex-shrink-0" />
        <span className="text-xs text-[#ef4444]/90 leading-relaxed">{content}</span>
      </div>
    );
  }

  /* ── System / Tool ── */
  if (role === "system" || role === "tool") {
    return (
      <div className="px-6 py-1">
        <CompactPill
          icon={Wrench}
          label={role === "system" ? "System" : "Tool"}
          content={content}
        />
      </div>
    );
  }

  /* ── User (right-aligned) ── */
  if (role === "user") {
    return (
      <div className="flex flex-col items-end my-2.5 mx-3">
        <div className="flex items-start gap-2.5 max-w-[85%] flex-row-reverse">
          <div className="rounded-2xl rounded-bl-md bg-[#22c55e]/15 border border-[#22c55e]/25 px-4 py-2.5 shadow-sm">
            <p className="text-sm text-[#e6e6e6] whitespace-pre-wrap leading-relaxed">
              {content}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#22c55e]/20 border border-[#22c55e]/25 flex items-center justify-center flex-shrink-0 mt-0.5">
            <User size={15} className="text-[#22c55e]" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Assistant (left-aligned with reasoning, tool calls, artifacts) ── */
  if (role === "assistant") {
    return (
      <div className="my-2.5 mx-3">
        <div className="flex items-start gap-2.5 max-w-[95%]">
          <div className="w-8 h-8 rounded-full bg-[#ff6900]/20 border border-[#ff6900]/25 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Bot size={15} className="text-[#ff6900]" />
          </div>
          <div className="min-w-0 flex-1">
            {/* Reasoning block */}
            {message.reasoning && (
              <ReasoningBlock
                content={message.reasoning}
              />
            )}

            {/* Tool calls */}
            {message.toolCalls && message.toolCalls.length > 0 && (
              <div className="space-y-1.5">
                {message.toolCalls.map((tc) => (
                  <ToolCallCard key={tc.id} toolCall={tc} />
                ))}
              </div>
            )}

            {/* Main content */}
            {content && (
              <div className="rounded-2xl rounded-tl-md bg-[#171a21] border border-[#2a2f3a] px-4 py-3 shadow-sm">
                <MarkdownContent content={content} />
              </div>
            )}

            {/* Artifact creation notice */}
            {message.artifactIds && message.artifactIds.length > 0 && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#9ca3af]">
                <Wrench size={11} />
                <span>
                  Created {message.artifactIds.length} artifact
                  {message.artifactIds.length > 1 ? "s" : ""}
                </span>
              </div>
            )}

            {/* Timestamp */}
            {message.createdAt && (
              <div className="mt-1.5 text-[11px] text-[#9ca3af]/50">
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* fallback */
  return (
    <div className="px-4 py-2 text-xs text-[#9ca3af]">
      {content}
    </div>
  );
}
