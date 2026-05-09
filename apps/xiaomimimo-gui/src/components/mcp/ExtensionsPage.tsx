import { useState } from "react";
import {
  Puzzle,
  Plus,
  Power,
  PowerOff,
  Terminal,
  Shield,
  Globe,
  FileText,
  GitBranch,
} from "lucide-react";
import type { McpServerConfig } from "@/lib/types";

const mockServers: McpServerConfig[] = [
  {
    id: "mcp-1",
    name: "filesystem",
    command: "npx",
    args: ["-y", "@anthropic/mcp-filesystem"],
    env: {},
    enabled: true,
    permissions: ["read", "write"],
  },
  {
    id: "mcp-2",
    name: "github",
    command: "npx",
    args: ["-y", "@anthropic/mcp-github"],
    env: {},
    enabled: true,
    permissions: ["read"],
  },
  {
    id: "mcp-3",
    name: "browser",
    command: "npx",
    args: ["-y", "@anthropic/mcp-browser"],
    env: {},
    enabled: false,
    permissions: [],
  },
  {
    id: "mcp-4",
    name: "postgres",
    command: "npx",
    args: ["-y", "@anthropic/mcp-postgres"],
    env: { DATABASE_URL: "postgres://..." },
    enabled: true,
    permissions: ["read", "write"],
  },
  {
    id: "mcp-5",
    name: "slack",
    command: "npx",
    args: ["-y", "@anthropic/mcp-slack"],
    env: { SLACK_TOKEN: "xoxb-..." },
    enabled: false,
    permissions: ["read"],
  },
];

const permissionIcons: Record<string, typeof Globe> = {
  read: FileText,
  write: Terminal,
  network: Globe,
  git: GitBranch,
};

export default function ExtensionsPage() {
  const [servers, setServers] = useState<McpServerConfig[]>(mockServers);

  const toggleServer = (id: string) => {
    setServers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#171a21] overflow-auto">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a2f3a] flex-shrink-0">
        <Puzzle size={16} className="text-[#ff6900]" />
        <span className="text-sm font-semibold text-[#e6e6e6] tracking-tight">
          MCP Extensions
        </span>
        <span className="text-[10px] text-[#9ca3af]/70 ml-auto">
          {servers.filter((s) => s.enabled).length} / {servers.length} active
        </span>
      </div>

      {/* Add server button */}
      <div className="px-4 py-3 border-b border-[#2a2f3a] flex-shrink-0">
        <button
          disabled
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-[#2a2f3a] text-xs text-[#9ca3af] opacity-50 cursor-not-allowed hover:opacity-70 transition-opacity"
          title="Coming soon"
        >
          <Plus size={14} />
          Add Server
        </button>
      </div>

      {/* Server list */}
      <div className="flex-1 overflow-auto">
        {servers.map((server) => (
          <div
            key={server.id}
            className="border-b border-[#2a2f3a]/50 last:border-b-0 hover:bg-[#0f1115]/30 transition-colors"
          >
            <div className="flex items-center gap-3 px-4 py-3.5">
              {/* Toggle switch */}
              <button
                onClick={() => toggleServer(server.id)}
                className={`relative w-8 h-5 rounded-full transition-all duration-200 flex-shrink-0 ${
                  server.enabled
                    ? "bg-[#ff6900] shadow-sm shadow-[#ff6900]/30"
                    : "bg-[#2a2f3a]"
                } focus-visible:outline-2 focus-visible:outline-[#ff6900]`}
                role="switch"
                aria-checked={server.enabled}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    server.enabled ? "translate-x-3" : "translate-x-0"
                  }`}
                />
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#e6e6e6]">
                    {server.name}
                  </span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${
                      server.enabled ? "bg-[#22c55e]" : "bg-[#4a4f5a]"
                    }`}
                    title={server.enabled ? "Enabled" : "Disabled"}
                  />
                </div>

                <div className="flex items-center gap-1 mt-1">
                  <Terminal size={10} className="text-[#9ca3af] flex-shrink-0" />
                  <span className="text-[10px] text-[#9ca3af]/70 truncate font-mono">
                    {server.command} {server.args.join(" ")}
                  </span>
                </div>

                {/* Permissions badges */}
                {server.permissions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {server.permissions.map((perm) => {
                      const Icon = permissionIcons[perm] ?? Shield;
                      return (
                        <span
                          key={perm}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] bg-[#2a2f3a] text-[#9ca3af] uppercase tracking-wide"
                        >
                          <Icon size={9} />
                          {perm}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Status icon */}
              <div className="flex-shrink-0">
                {server.enabled ? (
                  <Power size={14} className="text-[#22c55e]" />
                ) : (
                  <PowerOff size={14} className="text-[#4a4f5a]" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {servers.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0f1115] border border-[#2a2f3a] mb-4">
              <Puzzle size={22} className="text-[#2a2f3a]" />
            </div>
            <p className="text-xs font-medium text-[#9ca3af]">
              No MCP servers configured
            </p>
            <p className="text-[10px] text-[#4a4f5a] mt-1.5">
              Click "Add Server" to connect a new MCP server.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
