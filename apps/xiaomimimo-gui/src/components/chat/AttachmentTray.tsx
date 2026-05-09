import { X, FileText, ImageIcon, File } from "lucide-react";
import type { Attachment } from "@/lib/types";

interface AttachmentTrayProps {
  attachments: Attachment[];
  onRemove: (id: string) => void;
}

function formatSize(bytes?: number): string {
  if (bytes === undefined) return "";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function attachmentIcon(type: Attachment["type"]) {
  switch (type) {
    case "image":
      return <ImageIcon size={14} className="text-[#f59e0b]" />;
    case "file":
      return <File size={14} className="text-[#3b82f6]" />;
    case "text":
      return <FileText size={14} className="text-[#9ca3af]" />;
    default:
      return <File size={14} className="text-[#9ca3af]" />;
  }
}

export default function AttachmentTray({
  attachments,
  onRemove,
}: AttachmentTrayProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-3 py-2 border-t border-[#2a2f3a] bg-[#0f1115]/60">
      {attachments.map((att, i) => (
        <div
          key={att.id}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#2a2f3a]/50 border border-[#2a2f3a] group hover:bg-[#2a2f3a] hover:border-[#3a4050] transition-all duration-200 animate-msg-in"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          {attachmentIcon(att.type)}
          <span className="text-xs text-[#e6e6e6] max-w-40 truncate">
            {att.name}
          </span>
          {att.size !== undefined && (
            <span className="text-[11px] text-[#9ca3af] flex-shrink-0 tabular-nums">
              {formatSize(att.size)}
            </span>
          )}
          <button
            onClick={() => onRemove(att.id)}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-md text-[#9ca3af] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-all duration-200"
            title="Remove attachment"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
