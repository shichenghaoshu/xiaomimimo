import { useState } from "react";
import {
  BarChart3,
  Layers,
  Cpu,
  Zap,
  Shield,
  AlertTriangle,
} from "lucide-react";
import type { ContextStats } from "@/lib/types";

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
    recommendation:
      "Reuse project index; avoid rewriting system prompt to maintain high cache hit rate.",
  },
};

export default function ContextDashboard() {
  const [stats, _setStats] = useState<ContextStats>(mockContext);

  const usedPercent = (stats.totalTokens / stats.limitTokens) * 100;
  const usedK = Math.round(stats.totalTokens / 1000);
  const limitK = Math.round(stats.limitTokens / 1000);
  const remainingK = Math.round(stats.remainingTokens / 1000);

  return (
    <div className="h-full flex flex-col bg-[#171a21] overflow-auto">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2a2f3a] flex-shrink-0">
        <BarChart3 size={16} className="text-[#ff6900]" />
        <span className="text-sm font-semibold text-[#e6e6e6] tracking-tight">
          Context Dashboard
        </span>
        <span className="text-[10px] text-[#9ca3af]/70 ml-auto">1M limit</span>
      </div>

      <div className="p-4 space-y-5">
        {/* Big number card */}
        <div className="border border-[#2a2f3a] rounded-xl p-5 bg-[#0f1115] hover:border-[#3a4050] transition-colors duration-200">
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-[#e6e6e6] tracking-tight">
              {usedK}K
              <span className="text-lg text-[#9ca3af] font-normal">
                {" "}/{" "}
              </span>
              <span className="text-lg text-[#9ca3af] font-normal">
                {Number(limitK).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-[#9ca3af]/80 mt-1.5">
              {Number(remainingK).toLocaleString()} tokens remaining
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-[#2a2f3a] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#ff6900]/80 to-[#ff6900] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(usedPercent, 100)}%` }}
            />
          </div>

          <div className="flex justify-between mt-1.5 text-[10px] text-[#4a4f5a]">
            <span>0</span>
            <span>{limitK}K</span>
          </div>
        </div>

        {/* Layer breakdown */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <Layers size={14} className="text-[#9ca3af]" />
            <span className="text-xs font-semibold text-[#e6e6e6] tracking-tight">
              Layer Breakdown
            </span>
          </div>

          <div className="space-y-2">
            {stats.layers.map((layer) => {
              const layerPercent = (layer.tokens / stats.totalTokens) * 100;
              const layerK = Math.round(layer.tokens / 1000);
              return (
                <div
                  key={layer.name}
                  className="border border-[#2a2f3a] rounded-xl p-3.5 bg-[#0f1115] hover:border-[#3a4050] transition-colors duration-200"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-[#e6e6e6]">
                        {layer.name}
                      </span>
                      {layer.stable && (
                        <Shield
                          size={10}
                          className="text-[#22c55e]"
                          aria-label="Stable (cached)"
                        />
                      )}
                      {!layer.stable && (
                        <AlertTriangle
                          size={10}
                          className="text-[#f59e0b]"
                          aria-label="Volatile"
                        />
                      )}
                    </div>
                    <span className="text-xs text-[#e6e6e6] font-mono">
                      {layerK}K
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-[#2a2f3a] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        layer.stable ? "bg-[#22c55e]" : "bg-[#f59e0b]"
                      }`}
                      style={{ width: `${layerPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cache card */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <Zap size={14} className="text-[#9ca3af]" />
            <span className="text-xs font-semibold text-[#e6e6e6] tracking-tight">
              Cache Status
            </span>
          </div>

          <div className="border border-[#2a2f3a] rounded-xl p-4 bg-[#0f1115] space-y-3 hover:border-[#3a4050] transition-colors duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#9ca3af]">Estimated cache hit</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                <span className="text-sm font-bold text-[#22c55e]">
                  {(stats.cache.estimatedHitRate * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-[#9ca3af]">Cached prefix</span>
              <span className="text-xs text-[#e6e6e6] font-mono">
                {Math.round(stats.cache.stablePrefixTokens / 1000)}K tokens
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-[#9ca3af]">Risk</span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                  stats.cache.risk === "low"
                    ? "bg-[#22c55e]/10 text-[#22c55e]"
                    : stats.cache.risk === "medium"
                      ? "bg-[#f59e0b]/10 text-[#f59e0b]"
                      : "bg-[#ef4444]/10 text-[#ef4444]"
                }`}
              >
                {stats.cache.risk.toUpperCase()}
              </span>
            </div>

            <div className="pt-2.5 border-t border-[#2a2f3a]">
              <p className="text-[11px] text-[#9ca3af] leading-relaxed">
                <Cpu size={10} className="inline mr-1.5 text-[#ff6900]" />
                {stats.cache.recommendation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
