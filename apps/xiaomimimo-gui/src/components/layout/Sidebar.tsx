import {
  MessageSquare,
  FolderOpen,
  BarChart3,
  Puzzle,
  Mic,
  Settings,
} from "lucide-react";
import type { SidebarTab } from "@/lib/types";

const tabs: { id: SidebarTab; icon: typeof MessageSquare; label: string }[] = [
  { id: "chat", icon: MessageSquare, label: "Chat" },
  { id: "workspace", icon: FolderOpen, label: "Workspace" },
  { id: "context", icon: BarChart3, label: "Context" },
  { id: "extensions", icon: Puzzle, label: "Extensions" },
  { id: "voice", icon: Mic, label: "Voice" },
  { id: "settings", icon: Settings, label: "Settings" },
];

export default function Sidebar({
  activeTab,
  onTabChange,
}: {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
}) {
  return (
    <aside className="w-14 flex flex-col items-center gap-0.5 py-3 border-r border-[#2a2f3a] bg-[#171a21] flex-shrink-0">
      {tabs.map(({ id, icon: Icon, label }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 group ${
              isActive
                ? "bg-[#ff6900]/15 text-[#ff6900]"
                : "text-[#9ca3af] hover:text-[#e6e6e6] hover:bg-[#2a2f3a]/70"
            } focus-visible:outline-2 focus-visible:outline-[#ff6900]`}
            title={label}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
          >
            {/* Active indicator dot */}
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#ff6900] rounded-r-full" />
            )}
            <Icon size={20} />
          </button>
        );
      })}
    </aside>
  );
}
