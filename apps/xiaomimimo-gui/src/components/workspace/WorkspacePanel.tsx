import { useState } from "react";
import {
  FolderOpen,
  GitBranch,
  Terminal,
  File,
  Folder,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  Circle,
} from "lucide-react";
import type { FileNode } from "@/lib/types";

type TabId = "files" | "git" | "terminal";

const TABS: { id: TabId; icon: typeof FolderOpen; label: string }[] = [
  { id: "files", icon: FolderOpen, label: "Files" },
  { id: "git", icon: GitBranch, label: "Git Diff" },
  { id: "terminal", icon: Terminal, label: "Terminal" },
];

// ── Mock data ──

const mockFiles: FileNode[] = [
  {
    name: "src",
    path: "/project/src",
    isDir: true,
    children: [
      { name: "main.rs", path: "/project/src/main.rs", isDir: false, size: 4096 },
      { name: "lib.rs", path: "/project/src/lib.rs", isDir: false, size: 2048 },
      {
        name: "components",
        path: "/project/src/components",
        isDir: true,
        children: [
          { name: "mod.rs", path: "/project/src/components/mod.rs", isDir: false, size: 512 },
          { name: "button.rs", path: "/project/src/components/button.rs", isDir: false, size: 3072 },
        ],
      },
    ],
  },
  {
    name: "tests",
    path: "/project/tests",
    isDir: true,
    children: [
      { name: "integration.rs", path: "/project/tests/integration.rs", isDir: false, size: 8192 },
    ],
  },
  { name: "Cargo.toml", path: "/project/Cargo.toml", isDir: false, size: 1024 },
  { name: "README.md", path: "/project/README.md", isDir: false, size: 512 },
  { name: ".gitignore", path: "/project/.gitignore", isDir: false, size: 128 },
];

const mockBranch = "main";
const mockChangedFiles = [
  { path: "src/main.rs", status: "modified" as const },
  { path: "src/lib.rs", status: "modified" as const },
  { path: "Cargo.toml", status: "modified" as const },
];
const mockDiff = `diff --git a/src/main.rs b/src/main.rs
index 83db48f..bf372c1 100644
--- a/src/main.rs
+++ b/src/main.rs
@@ -1,5 +1,8 @@
 use std::env;

+use xiaomi::Config;
+use xiaomi::logger;
+
 fn main() {
+    logger::init();
     let args: Vec<String> = env::args().collect();
-    println!("Hello, world!");
+    let config = Config::from_args(&args);
+    println!("Starting {} v{}", config.name, config.version);
 }`;

const mockTerminalLines = [
  "$ cargo build --release",
  "   Compiling xiaomi-core v0.1.0",
  "   Compiling xiaomi-gui v0.1.0",
  "    Finished release [optimized] target(s) in 4.2s",
  "$ cargo test",
  "running 12 tests",
  "test result: ok. 12 passed; 0 failed; 0 ignored;",
  "$ ",
];

// ── FileTree ──

function FileTreeNode({
  node,
  depth = 0,
}: {
  node: FileNode;
  depth?: number;
}) {
  const [open, setOpen] = useState(depth < 1);

  if (node.isDir) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-1 py-0.5 text-xs text-[#9ca3af] hover:text-[#e6e6e6] hover:bg-[#2a2f3a]/50 rounded transition-colors"
          style={{ paddingLeft: 12 + depth * 14 }}
        >
          {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          <Folder size={12} className="text-[#f59e0b]" />
          <span className="truncate">{node.name}</span>
        </button>
        {open &&
          node.children?.map((child) => (
            <FileTreeNode key={child.path} node={child} depth={depth + 1} />
          ))}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1 py-0.5 text-xs text-[#e6e6e6] hover:bg-[#2a2f3a]/50 rounded transition-colors cursor-default"
      style={{ paddingLeft: 12 + depth * 14 }}
    >
      <File size={12} className="text-[#3b82f6] flex-shrink-0" />
      <span className="truncate">{node.name}</span>
      {node.size && (
        <span className="text-[10px] text-[#4a4f5a] ml-auto flex-shrink-0">
          {formatSize(node.size)}
        </span>
      )}
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

// ── LinesWithDiff ──

function LinesWithDiff({ diff }: { diff: string }) {
  const lines = diff.split("\n");
  return (
    <div className="p-3 overflow-auto font-mono text-xs leading-[1.7]">
      {lines.map((line, i) => {
        let colorClass = "text-[#e6e6e6]";
        if (line.startsWith("+") && !line.startsWith("+++")) colorClass = "text-[#22c55e]";
        else if (line.startsWith("-") && !line.startsWith("---")) colorClass = "text-[#ef4444]";
        else if (line.startsWith("@@")) colorClass = "text-[#3b82f6]";
        else if (line.startsWith("diff ") || line.startsWith("index ") || line.startsWith("---") || line.startsWith("+++"))
          colorClass = "text-[#f59e0b]";
        return (
          <div key={i} className={colorClass}>
            {line || " "}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ──

export default function WorkspacePanel() {
  const [activeTab, setActiveTab] = useState<TabId>("files");
  const [terminalInput, setTerminalInput] = useState("");

  return (
    <div className="h-full flex flex-col bg-[#171a21]">
      {/* Tab bar */}
      <div className="h-9 flex items-center border-b border-[#2a2f3a] flex-shrink-0">
        {TABS.map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`h-full flex items-center gap-1.5 px-3 text-xs font-medium transition-all duration-200 border-b-2 -mb-px ${
                isActive
                  ? "text-[#ff6900] border-[#ff6900]"
                  : "text-[#9ca3af] border-transparent hover:text-[#e6e6e6] hover:bg-[#0f1115]/40"
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-hidden" key={activeTab}>
        <div className="h-full tab-content-enter">
          {/* Files tab */}
          {activeTab === "files" && (
            <div className="h-full overflow-auto py-1">
              {mockFiles.map((file) => (
                <FileTreeNode key={file.path} node={file} />
              ))}
            </div>
          )}

          {/* Git Diff tab */}
          {activeTab === "git" && (
            <div className="h-full flex flex-col overflow-hidden">
              {/* Branch header */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-[#2a2f3a] flex-shrink-0">
                <GitBranch size={14} className="text-[#ff6900]" />
                <span className="text-xs font-semibold text-[#e6e6e6]">{mockBranch}</span>
                <span className="text-[10px] text-[#9ca3af] ml-auto">
                  {mockChangedFiles.length} changed
                </span>
              </div>

              {/* Changed files */}
              <div className="border-b border-[#2a2f3a] flex-shrink-0">
                {mockChangedFiles.map((file) => (
                  <div
                    key={file.path}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs border-t border-[#2a2f3a]/50 first:border-t-0 hover:bg-[#0f1115]/40 transition-colors"
                  >
                    {(() => { const s = file.status as string; return s === "modified" ? <Circle size={8} className="text-[#f59e0b] fill-[#f59e0b]" /> : null; })()}
                    {(() => { const s = file.status as string; return s === "added" ? <Plus size={10} className="text-[#22c55e]" /> : null; })()}
                    {(() => { const s = file.status as string; return s === "deleted" ? <Minus size={10} className="text-[#ef4444]" /> : null; })()}
                    <span className="text-[#e6e6e6]">{file.path}</span>
                    <span className="text-[10px] text-[#9ca3af] ml-auto uppercase tracking-wide">
                      {file.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Diff view */}
              <div className="flex-1 overflow-auto bg-[#0f1115]">
                <LinesWithDiff diff={mockDiff} />
              </div>
            </div>
          )}

          {/* Terminal tab */}
          {activeTab === "terminal" && (
            <div className="h-full flex flex-col overflow-hidden bg-[#0f1115]">
              {/* Terminal output */}
              <div className="flex-1 overflow-auto p-3 font-mono text-xs leading-[1.7]">
                {mockTerminalLines.map((line, i) => (
                  <div key={i} className="text-[#e6e6e6]">
                    {line.startsWith("$ ") ? (
                      <>
                        <span className="text-[#22c55e]">$ </span>
                        <span>{line.slice(2)}</span>
                      </>
                    ) : (
                      <span>{line}</span>
                    )}
                  </div>
                ))}
                <span className="inline-block w-2 h-3.5 bg-[#e6e6e6] animate-pulse ml-0.5 align-middle" />
              </div>

              {/* Command input */}
              <div className="flex items-center gap-2 px-3 py-2 border-t border-[#2a2f3a] bg-[#171a21] flex-shrink-0">
                <span className="text-xs text-[#22c55e] font-mono font-semibold">$</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder="Type a command..."
                  className="flex-1 bg-transparent text-xs text-[#e6e6e6] font-mono outline-none placeholder-[#4a4f5a]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && terminalInput.trim()) {
                      setTerminalInput("");
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
