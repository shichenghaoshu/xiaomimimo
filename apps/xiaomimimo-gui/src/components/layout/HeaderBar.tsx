import { PanelRightOpen, PanelRightClose } from "lucide-react";

export default function HeaderBar({
  showArtifact,
  onToggleArtifact,
}: {
  showArtifact: boolean;
  onToggleArtifact: () => void;
}) {
  return (
    <header className="h-10 flex items-center px-3 gap-3 border-b border-[#2a2f3a] bg-gradient-to-r from-[#171a21] via-[#171a21] to-[#171a21] flex-shrink-0 select-none relative overflow-hidden">
      {/* Subtle bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-[#ff6900]/60 via-[#ff6900]/20 to-transparent" />

      <div className="flex items-center gap-2">
        <span className="text-[#ff6900] font-bold text-sm tracking-tight">
          xiaomimimo
        </span>
        <span className="text-[#9ca3af] text-xs font-medium">gui</span>
      </div>

      <div className="h-4 w-px bg-[#2a2f3a]" />

      <span className="text-xs text-[#9ca3af]">
        model: <span className="text-[#e6e6e6] font-medium">mimo-v2.5-pro</span>
      </span>

      <span className="text-xs text-[#9ca3af]">
        ctx: <span className="text-[#e6e6e6] font-medium">184K / 1M</span>
      </span>

      <span className="text-xs text-[#9ca3af]">
        cache:{" "}
        <span className="text-[#22c55e] font-medium">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#22c55e] mr-1 align-middle" />
          82%
        </span>
      </span>

      <div className="flex-1" />

      <button
        onClick={onToggleArtifact}
        className="relative w-7 h-7 flex items-center justify-center rounded-lg text-[#9ca3af] hover:text-[#e6e6e6] hover:bg-[#2a2f3a]/70 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#ff6900]"
        title={showArtifact ? "Hide Artifact panel" : "Show Artifact panel"}
      >
        {showArtifact ? <PanelRightOpen size={15} /> : <PanelRightClose size={15} />}
      </button>
    </header>
  );
}
