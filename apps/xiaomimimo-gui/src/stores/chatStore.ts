import { create } from "zustand";
import type { Message, ToolCall, ChatRequest, ChatResponse, Attachment } from "@/lib/types";
import { sendChatMessage } from "@/lib/tauri";
import { useSettingsStore } from "@/stores/settingsStore";

interface ChatState {
  sessionId: string;
  messages: Message[];
  isLoading: boolean;
  mode: "plan" | "agent" | "yolo";
  attachments: Attachment[];

  setMode: (mode: "plan" | "agent" | "yolo") => void;
  addAttachment: (att: Attachment) => void;
  removeAttachment: (id: string) => void;
  clearAttachments: () => void;
  sendMessage: (content: string, model?: string, tts?: boolean) => Promise<void>;
  addMessage: (msg: Message) => void;
  setSession: (id: string, msgs: Message[]) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessionId: "session-mock-001",
  messages: [],
  isLoading: false,
  mode: "agent",
  attachments: [],

  setMode: (mode) => set({ mode }),

  addAttachment: (att) => set((s) => ({ attachments: [...s.attachments, att] })),

  removeAttachment: (id) => set((s) => ({ attachments: s.attachments.filter((a) => a.id !== id) })),

  clearAttachments: () => set({ attachments: [] }),

  sendMessage: async (content, model, tts) => {
    const state = get();
    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    set((s) => ({
      messages: [...s.messages, userMsg],
      isLoading: true,
      attachments: [],
    }));

    try {
      const { apiKey, settings } = useSettingsStore.getState();
      const history = state.messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }));
      const req: ChatRequest = {
        sessionId: state.sessionId,
        message: content,
        history,
        attachments: state.attachments,
        mode: state.mode,
        model,
        ttsEnabled: tts,
        apiKey: apiKey ?? undefined,
        baseUrl: settings?.baseUrl,
      };
      const res: ChatResponse = await sendChatMessage(req);

      const assistantMsg: Message = {
        id: res.messageId,
        role: "assistant",
        content: res.content,
        reasoning: res.reasoning,
        toolCalls: res.toolCalls,
        artifactIds: res.artifacts?.map((a) => a.id),
        createdAt: new Date().toISOString(),
      };

      set((s) => ({
        messages: [...s.messages, assistantMsg],
        isLoading: false,
      }));
    } catch (err) {
      const errorMsg: Message = {
        id: `msg-${Date.now()}-error`,
        role: "error",
        content: `Error: ${err}`,
        createdAt: new Date().toISOString(),
      };
      set((s) => ({
        messages: [...s.messages, errorMsg],
        isLoading: false,
      }));
    }
  },

  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),

  setSession: (id, msgs) => set({ sessionId: id, messages: msgs }),
}));
