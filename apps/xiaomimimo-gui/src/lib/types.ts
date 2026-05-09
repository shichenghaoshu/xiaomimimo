export interface ChatRequest {
  sessionId: string;
  message: string;
  history: { role: string; content: string }[];
  attachments: Attachment[];
  mode: "plan" | "agent" | "yolo";
  model?: string;
  ttsEnabled?: boolean;
  apiKey?: string;
  baseUrl?: string;
}

export interface ChatResponse {
  messageId: string;
  content: string;
  reasoning?: string;
  toolCalls?: ToolCall[];
  artifacts?: Artifact[];
  usage?: TokenUsage;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cacheHitTokens?: number;
  cacheMissTokens?: number;
  estimatedCost?: number;
}

export interface ToolCall {
  id: string;
  name: string;
  status: "pending" | "running" | "success" | "failed" | "rejected";
  argsPreview: string;
  resultPreview?: string;
  requiresApproval: boolean;
}

export interface Attachment {
  id: string;
  type: "file" | "image" | "text";
  name: string;
  path?: string;
  mime?: string;
  size?: number;
}

export interface SessionSummary {
  id: string;
  title: string;
  model: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  title: string;
  model: string;
  messages: Message[];
  artifacts: Artifact[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system" | "tool" | "error";
  content: string;
  reasoning?: string;
  toolCalls?: ToolCall[];
  artifactIds?: string[];
  createdAt: string;
}

export interface ContextStats {
  totalTokens: number;
  limitTokens: number;
  remainingTokens: number;
  layers: ContextLayer[];
  cache: CacheStats;
}

export interface ContextLayer {
  name: string;
  tokens: number;
  stable: boolean;
}

export interface CacheStats {
  stablePrefixTokens: number;
  estimatedHitRate: number;
  risk: "low" | "medium" | "high";
  recommendation: string;
}

export interface FileNode {
  name: string;
  path: string;
  isDir: boolean;
  children?: FileNode[];
  size?: number;
}

export interface GitStatus {
  branch: string;
  changes: GitChange[];
}

export interface GitChange {
  path: string;
  status: "modified" | "added" | "deleted" | "renamed";
}

export interface ShellCommandRequest {
  command: string;
  cwd: string;
  timeoutMs?: number;
}

export interface ShellCommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
}

export interface McpServerConfig {
  id: string;
  name: string;
  command: string;
  args: string[];
  env: Record<string, string>;
  enabled: boolean;
  permissions: string[];
}

export interface AudioOutput {
  id: string;
  format: string;
  duration: number;
  data?: number[];
  url?: string;
}

export interface AppSettings {
  provider: string;
  baseUrl: string;
  defaultModel: string;
  codingModel: string;
  visionModel: string;
  ttsModel: string;
  requireApprovalForFiles: boolean;
  requireApprovalForShell: boolean;
  requireApprovalForGit: boolean;
  requireApprovalForMcp: boolean;
  allowYolo: boolean;
  artifactSandbox: string;
  ttsEnabled: boolean;
  ttsVoice: string;
  ttsSpeed: number;
  apiKeyPreview?: string;
  connectionStatus?: string;
}

export type SidebarTab =
  | "chat"
  | "workspace"
  | "context"
  | "extensions"
  | "voice"
  | "settings";

export type ArtifactType =
  | "markdown"
  | "code"
  | "react"
  | "html"
  | "svg"
  | "mermaid"
  | "json"
  | "document"
  | "spreadsheet"
  | "presentation"
  | "image"
  | "audio";

export interface Artifact {
  id: string;
  sessionId: string;
  title: string;
  type: ArtifactType;
  language?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  versions: ArtifactVersion[];
}

export interface ArtifactVersion {
  id: string;
  content: string;
  createdAt: string;
  label?: string;
}
