import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Artifact } from "@/lib/types";

interface ArtifactRendererProps {
  artifact: Artifact;
}

export default function ArtifactRenderer({ artifact }: ArtifactRendererProps) {
  const { type, content, language } = artifact;

  switch (type) {
    case "markdown":
      return (
        <div className="prose prose-invert prose-sm max-w-none text-[#e6e6e6]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      );

    case "code": {
      return (
        <div className="border border-[#2a2f3a] rounded-lg overflow-hidden bg-[#0f1115]">
          {language && (
            <div className="flex items-center px-3 py-1.5 border-b border-[#2a2f3a] bg-[#171a21]">
              <span className="text-[10px] uppercase text-[#9ca3af] tracking-wider">
                {language}
              </span>
            </div>
          )}
          <pre className="p-4 text-xs text-[#e6e6e6] font-mono overflow-auto">
            <code>{content}</code>
          </pre>
        </div>
      );
    }

    case "react":
      return (
        <div className="border border-[#2a2f3a] rounded-lg p-6 bg-[#0f1115] text-center">
          <div className="w-8 h-8 mx-auto mb-2 rounded bg-[#ff6900]/10 flex items-center justify-center">
            <span className="text-[#ff6900] text-xs font-bold">JSX</span>
          </div>
          <p className="text-xs text-[#9ca3af]">React Preview (sandboxed)</p>
        </div>
      );

    case "html":
      return (
        <div className="border border-[#2a2f3a] rounded-lg p-6 bg-[#0f1115] text-center">
          <div className="w-8 h-8 mx-auto mb-2 rounded bg-[#3b82f6]/10 flex items-center justify-center">
            <span className="text-[#3b82f6] text-xs font-bold">HTML</span>
          </div>
          <p className="text-xs text-[#9ca3af]">
            HTML preview requires a sandboxed iframe. Open in browser to view.
          </p>
        </div>
      );

    case "svg":
      return (
        <div className="border border-[#2a2f3a] rounded-lg overflow-hidden bg-[#0f1115]">
          <div className="flex items-center px-3 py-1.5 border-b border-[#2a2f3a] bg-[#171a21]">
            <span className="text-[10px] uppercase text-[#9ca3af] tracking-wider">
              SVG
            </span>
          </div>
          <pre className="p-4 text-xs text-[#e6e6e6] font-mono overflow-auto max-h-96">
            {content}
          </pre>
        </div>
      );

    case "json":
      try {
        const parsed = JSON.parse(content);
        const formatted = JSON.stringify(parsed, null, 2);
        return (
          <pre className="text-xs text-[#e6e6e6] font-mono whitespace-pre-wrap break-words overflow-auto">
            {formatted}
          </pre>
        );
      } catch {
        return (
          <pre className="text-xs text-[#ef4444] font-mono">{content}</pre>
        );
      }

    case "document":
    case "spreadsheet":
    case "presentation": {
      const labels: Record<string, string> = {
        document: "Document",
        spreadsheet: "Spreadsheet",
        presentation: "Presentation",
      };
      return (
        <div className="border border-[#2a2f3a] rounded-lg p-6 bg-[#0f1115] text-center">
          <div className="w-8 h-8 mx-auto mb-2 rounded bg-[#f59e0b]/10 flex items-center justify-center">
            <span className="text-[#f59e0b] text-xs font-bold">
              {labels[type]}
            </span>
          </div>
          <p className="text-xs text-[#9ca3af]">
            {labels[type]} preview is not yet available.
          </p>
        </div>
      );
    }

    case "image":
      return (
        <div className="border border-[#2a2f3a] rounded-lg p-6 bg-[#0f1115] text-center">
          <p className="text-xs text-[#9ca3af]">
            Image rendering not yet supported.
          </p>
        </div>
      );

    case "audio":
      return (
        <div className="border border-[#2a2f3a] rounded-lg p-6 bg-[#0f1115] text-center">
          <p className="text-xs text-[#9ca3af]">
            Audio playback not yet supported.
          </p>
        </div>
      );

    default:
      return (
        <div className="text-xs text-[#9ca3af] text-center py-8">
          Unsupported artifact type: {type}
        </div>
      );
  }
}
