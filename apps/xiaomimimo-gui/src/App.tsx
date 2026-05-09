import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import HeaderBar from "@/components/layout/HeaderBar";
import StatusBar from "@/components/layout/StatusBar";
import ChatPanel from "@/components/chat/ChatPanel";
import ArtifactPanel from "@/components/artifacts/ArtifactPanel";
import WorkspacePanel from "@/components/workspace/WorkspacePanel";
import ContextDashboard from "@/components/context/ContextDashboard";
import ExtensionsPage from "@/components/mcp/ExtensionsPage";
import VoicePanel from "@/components/voice/VoicePanel";
import SettingsPage from "@/components/settings/SettingsPage";
import Onboarding from "@/components/Onboarding";
import { useSettingsStore } from "@/stores/settingsStore";
import type { SidebarTab } from "@/lib/types";

function TabContent({ activeTab }: { activeTab: SidebarTab }) {
  return (
    <div className="flex-1 overflow-hidden" key={activeTab}>
      <div className="tab-content-enter h-full">
        {activeTab === "chat" && <ChatPanel />}
        {activeTab === "workspace" && <WorkspacePanel />}
        {activeTab === "context" && <ContextDashboard />}
        {activeTab === "extensions" && <ExtensionsPage />}
        {activeTab === "voice" && <VoicePanel />}
        {activeTab === "settings" && <SettingsPage />}
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<SidebarTab>("chat");
  const [showArtifact, setShowArtifact] = useState(true);

  const isConfigured = useSettingsStore((s) => s.isConfigured);
  const loaded = useSettingsStore((s) => s.loaded);
  const load = useSettingsStore((s) => s.load);

  // Load settings on mount
  useEffect(() => {
    load();
  }, [load]);

  // Listen for navigation events (e.g., from ChatPanel "Open Settings" link)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.tab) {
        setActiveTab(detail.tab as SidebarTab);
      }
    };
    window.addEventListener("navigate", handler);
    return () => window.removeEventListener("navigate", handler);
  }, []);

  // Show onboarding only when we know settings aren't configured
  // Don't flash onboarding while loading
  if (loaded && !isConfigured) {
    return <Onboarding />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#0f1115] text-[#e6e6e6]">
      <HeaderBar showArtifact={showArtifact} onToggleArtifact={() => setShowArtifact(!showArtifact)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden border-r border-[#2a2f3a]">
            <TabContent activeTab={activeTab} />
          </div>

          {showArtifact && (
            <div className="w-[420px] flex-shrink-0 overflow-hidden transition-all duration-300">
              <ArtifactPanel />
            </div>
          )}
        </main>
      </div>

      <StatusBar />
    </div>
  );
}
