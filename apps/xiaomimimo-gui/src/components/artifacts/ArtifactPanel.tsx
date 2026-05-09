import { useState } from "react";
import {
  Eye,
  Code2,
  History,
  Download,
  FileText,
  Sparkles,
} from "lucide-react";
import type { Artifact } from "@/lib/types";
import ArtifactRenderer from "./ArtifactRenderer";

type TabId = "preview" | "code" | "versions" | "export";

const TABS: { id: TabId; icon: typeof Eye; label: string }[] = [
  { id: "preview", icon: Eye, label: "Preview" },
  { id: "code", icon: Code2, label: "Code" },
  { id: "versions", icon: History, label: "Versions" },
  { id: "export", icon: Download, label: "Export" },
];

interface ArtifactPanelProps {
  artifact?: Artifact | null;
}

export default function ArtifactPanel({ artifact }: ArtifactPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("preview");

  if (!artifact) {
    return (
      <div className="h-full flex flex-col bg-[#171a21] border-l border-[#2a2f3a]">
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="text-center max-w-xs">
            <FileText
              size={40}
              className="mx-auto mb-4 text-[#2a2f3a]"
            />
            <p className="text-[#9ca3af] text-sm leading-relaxed">
              No artifact selected
            </p>
            <p className="text-[#4a4f5a] text-xs mt-2 leading-relaxed">
              Create one by asking the assistant to generate content.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#171a21] border-l border-[#2a2f3a]">
      {/* Tab bar */}
      <div className="h-9 flex items-center border-b border-[#2a2f3a] flex-shrink-0">
        {TABS.map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              disabled={id === "export"}
              className={`h-full flex items-center gap-1.5 px-3 text-xs font-medium transition-all duration-200 border-b-2 -mb-px ${
                isActive
                  ? "text-[#ff6900] border-[#ff6900]"
                  : "text-[#9ca3af] border-transparent hover:text-[#e6e6e6] hover:bg-[#0f1115]/40"
              } ${id === "export" ? "opacity-40 cursor-not-allowed" : ""}`}
              title={id === "export" ? "Coming soon" : ""}
            >
              <Icon size={13} />
              {label}
            </button>
          );
        })}

        <div className="flex-1" />
      </div>

      {/* Panel header */}
      <div className="px-3 py-2 border-b border-[#2a2f3a] flex items-center gap-2 flex-shrink-0">
        <Sparkles size={12} className="text-[#ff6900] flex-shrink-0" />
        <span className="text-xs font-semibold text-[#e6e6e6] truncate">
          {artifact.title}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#2a2f3a] text-[#9ca3af] uppercase flex-shrink-0 font-medium tracking-wide">
          {artifact.type}
        </span>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden" key={activeTab}>
        <div className="h-full tab-content-enter">
          {activeTab === "preview" && (
            <div className="h-full overflow-auto p-4">
              <ArtifactRenderer artifact={artifact} />
            </div>
          )}

          {activeTab === "code" && (
            <div className="h-full overflow-auto">
              <pre className="p-4 text-xs text-[#e6e6e6] font-mono whitespace-pre-wrap break-all leading-relaxed">
                {artifact.content}
              </pre>
            </div>
          )}

          {activeTab === "versions" && (
            <div className="h-full overflow-auto p-4">
              {artifact.versions.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-xs text-[#9ca3af]">
                    No version history yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {artifact.versions.map((v) => (
                    <div
                      key={v.id}
                      className="border border-[#2a2f3a] rounded-xl p-3.5 bg-[#0f1115] hover:border-[#3a4050] transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-[#e6e6e6]">
                          {v.label ?? "Untitled version"}
                        </span>
                        <span className="text-[10px] text-[#9ca3af]/70">
                          {new Date(v.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <pre className="text-xs text-[#9ca3af] font-mono line-clamp-3 leading-relaxed">
                        {v.content}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "export" && (
            <div className="h-full flex items-center justify-center px-6">
              <p className="text-xs text-[#9ca3af] text-center">
                Export functionality coming soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
