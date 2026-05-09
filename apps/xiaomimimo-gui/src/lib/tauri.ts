import type {
  ChatRequest,
  ChatResponse,
  SessionSummary,
  Session,
  ContextStats,
  FileNode,
  GitStatus,
  ShellCommandRequest,
  ShellCommandResult,
  McpServerConfig,
  AudioOutput,
  AppSettings,
  Artifact,
} from "./types";

// In development without Tauri, fall back to mock implementations.
const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (!isTauri) {
    const mock = getMock(cmd, args);
    if (mock !== undefined) return mock as T;
    throw new Error(`Mock not implemented for: ${cmd}`);
  }
  const { invoke: tauriInvoke } = await import("@tauri-apps/api/core");
  return tauriInvoke<T>(cmd, args);
}

// ── Mock data for development without Tauri ──

const mockMessages: import("./types").Message[] = [];
let mockSessionId = "session-mock-001";

const mockContext: ContextStats = {
  totalTokens: 184000,
  limitTokens: 1048576,
  remainingTokens: 864576,
  layers: [
    { name: "L0 Stable System Prefix", tokens: 24000, stable: true },
    { name: "L1 Project Memory", tokens: 78000, stable: true },
    { name: "L2 Active Working Set", tokens: 64000, stable: false },
    { name: "L3 Tool Output", tokens: 18000, stable: false },
  ],
  cache: {
    stablePrefixTokens: 102000,
    estimatedHitRate: 0.82,
    risk: "low",
    recommendation: "Reuse project index; avoid rewriting system prompt",
  },
};

const mockFiles: FileNode[] = [
  { name: "src", path: "/project/src", isDir: true, children: [
    { name: "main.rs", path: "/project/src/main.rs", isDir: false, size: 4096 },
    { name: "lib.rs", path: "/project/src/lib.rs", isDir: false, size: 2048 },
  ]},
  { name: "Cargo.toml", path: "/project/Cargo.toml", isDir: false, size: 1024 },
  { name: "README.md", path: "/project/README.md", isDir: false, size: 512 },
];

const mockMcpServers: McpServerConfig[] = [
  { id: "mcp-1", name: "filesystem", command: "npx", args: ["-y", "@anthropic/mcp-filesystem"], env: {}, enabled: true, permissions: ["read", "write"] },
  { id: "mcp-2", name: "github", command: "npx", args: ["-y", "@anthropic/mcp-github"], env: {}, enabled: true, permissions: ["read"] },
  { id: "mcp-3", name: "browser", command: "npx", args: ["-y", "@anthropic/mcp-browser"], env: {}, enabled: false, permissions: [] },
];

const mockSettings: AppSettings = {
  provider: "xiaomi",
  baseUrl: "https://api.xiaomimimo.com/v1",
  defaultModel: "mimo-v2.5-pro",
  codingModel: "mimo-v2.5-pro",
  visionModel: "mimo-v2-omni",
  ttsModel: "mimo-v2.5-tts",
  requireApprovalForFiles: true,
  requireApprovalForShell: true,
  requireApprovalForGit: true,
  requireApprovalForMcp: true,
  allowYolo: false,
  artifactSandbox: "strict",
  ttsEnabled: true,
  ttsVoice: "professional_cn",
  ttsSpeed: 1.0,
};

function getMock(cmd: string, args?: Record<string, unknown>): unknown {
  switch (cmd) {
    case "send_chat_message": {
      const req = args?.req as ChatRequest;
      const userMsg: import("./types").Message = {
        id: `msg-${Date.now()}-user`,
        role: "user",
        content: req.message,
        createdAt: new Date().toISOString(),
      };
      const assistantMsg: import("./types").Message = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: `Thanks for your message! This is a mock response.\n\n\`\`\`rust\nfn main() {\n    println!("Hello from MiMo!");\n}\n\`\`\`\n\nI can help you with code, answer questions, and create artifacts.`,
        reasoning: "The user sent a message. I should respond helpfully and demonstrate markdown rendering capabilities including code blocks.",
        toolCalls: [
          { id: "tc-1", name: "read_file", status: "success", argsPreview: '{"path": "src/main.rs"}', resultPreview: "12 lines read", requiresApproval: false },
        ],
        createdAt: new Date().toISOString(),
      };
      mockMessages.push(userMsg, assistantMsg);
      return {
        messageId: assistantMsg.id,
        content: assistantMsg.content,
        reasoning: assistantMsg.reasoning,
        toolCalls: assistantMsg.toolCalls,
        usage: { inputTokens: 500, outputTokens: 200, totalTokens: 700, cacheHitTokens: 300, cacheMissTokens: 200, estimatedCost: 0.001 },
      } satisfies ChatResponse;
    }

    case "list_sessions":
      return [{ id: mockSessionId, title: "Mock Session", model: "mimo-v2.5-pro", messageCount: mockMessages.length, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }] satisfies SessionSummary[];

    case "load_session":
      return { id: mockSessionId, title: "Mock Session", model: "mimo-v2.5-pro", messages: mockMessages, artifacts: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } satisfies Session;

    case "get_context_stats":
      return mockContext;

    case "list_workspace_files":
      return mockFiles;

    case "get_git_status":
      return { branch: "main", changes: [{ path: "src/main.rs", status: "modified" }] } satisfies GitStatus;

    case "get_git_diff":
      return "diff --git a/src/main.rs b/src/main.rs\n@@ -1,3 +1,5 @@\n+// New line added\n+// Another line\n fn main() {\n     println!(\"Hello\");\n }";

    case "run_shell_command":
      return { stdout: "Build successful\n", stderr: "", exitCode: 0, durationMs: 250 } satisfies ShellCommandResult;

    case "list_mcp_servers":
      return mockMcpServers;

    case "test_mcp_server":
      return { ok: true, message: "Connection successful" };

    case "tts_speak":
      return { id: `audio-${Date.now()}`, format: "mp3", duration: 2.5 } satisfies AudioOutput;

    case "get_settings":
      return mockSettings;

    case "update_settings":
      return null;

    case "create_artifact":
      return { id: `artifact-${Date.now()}`, sessionId: mockSessionId, title: "New Artifact", type: "code", language: "rust", content: "// code", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), versions: [] } satisfies Artifact;

    case "list_artifacts":
      return [] as Artifact[];

    case "stream_chat_message":
      return "This is a streaming mock response.";

    case "save_api_key":
      return null;

    case "delete_api_key":
      return null;

    case "test_connection":
      return { ok: true, message: "Connection successful. API key is valid." };

    default:
      return undefined;
  }
}

// ── Public API ──

export async function sendChatMessage(req: ChatRequest): Promise<ChatResponse> {
  return invoke<ChatResponse>("send_chat_message", { req });
}

export async function listSessions(): Promise<SessionSummary[]> {
  return invoke<SessionSummary[]>("list_sessions");
}

export async function loadSession(sessionId: string): Promise<Session> {
  return invoke<Session>("load_session", { sessionId });
}

export async function getContextStats(sessionId: string): Promise<ContextStats> {
  return invoke<ContextStats>("get_context_stats", { sessionId });
}

export async function listWorkspaceFiles(path: string): Promise<FileNode[]> {
  return invoke<FileNode[]>("list_workspace_files", { path });
}

export async function getGitStatus(path: string): Promise<GitStatus> {
  return invoke<GitStatus>("get_git_status", { path });
}

export async function getGitDiff(path: string): Promise<string> {
  return invoke<string>("get_git_diff", { path });
}

export async function runShellCommand(req: ShellCommandRequest): Promise<ShellCommandResult> {
  return invoke<ShellCommandResult>("run_shell_command", { req });
}

export async function listMcpServers(): Promise<McpServerConfig[]> {
  return invoke<McpServerConfig[]>("list_mcp_servers");
}

export async function testMcpServer(id: string): Promise<{ ok: boolean; message: string }> {
  return invoke<{ ok: boolean; message: string }>("test_mcp_server", { id });
}

export async function ttsSpeak(text: string, voice: string, speed: number): Promise<AudioOutput> {
  return invoke<AudioOutput>("tts_speak", { text, voice, speed });
}

export async function getSettings(): Promise<AppSettings> {
  return invoke<AppSettings>("get_settings");
}

export async function updateSettings(settings: AppSettings): Promise<void> {
  return invoke<void>("update_settings", { settings });
}

export async function createArtifact(req: { sessionId: string; title: string; type: string; content: string; language?: string }): Promise<Artifact> {
  return invoke<Artifact>("create_artifact", { req });
}

export async function listArtifacts(sessionId: string): Promise<Artifact[]> {
  return invoke<Artifact[]>("list_artifacts", { sessionId });
}

export async function saveApiKey(provider: string, key: string, baseUrl: string): Promise<void> {
  return invoke<void>("save_api_key", { req: { provider, apiKey: key, baseUrl } });
}

export async function deleteApiKey(provider: string): Promise<void> {
  return invoke<void>("delete_api_key", { req: { provider } });
}

export async function testConnection(provider: string, apiKey: string, baseUrl: string): Promise<{ ok: boolean; message: string }> {
  return invoke<{ ok: boolean; message: string }>("test_connection", {
    req: { provider, apiKey, baseUrl },
  });
}
