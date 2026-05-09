import { useState } from "react";
import {
  Sparkles,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  Zap,
  Globe,
} from "lucide-react";
import { useSettingsStore } from "@/stores/settingsStore";

type KeyType = "token" | "subscription" | null;

export default function Onboarding() {
  const configureKey = useSettingsStore((s) => s.configureKey);

  const [keyType, setKeyType] = useState<KeyType>(null);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  const prefix = keyType === "token" ? "tp-" : "sk-";

  const isValid = apiKey.trim().length > 0 && apiKey.trim().startsWith(prefix);

  const handleSaveAndConnect = async () => {
    if (!isValid || !keyType) return;
    setSaving(true);
    setError(null);
    try {
      const provider = "xiaomi";
      const baseUrl = prefix === "tp-"
        ? "https://token-plan-cn.xiaomimimo.com/v1"
        : "https://api.xiaomimimo.com/v1";
      await configureKey(provider, apiKey.trim(), baseUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save API key");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    setKeyType(null);
    setApiKey("");
    setShowKey(false);
    setError(null);
    setStep(1);
  };

  const handleSelectType = (type: KeyType) => {
    setKeyType(type);
    setStep(2);
  };

  // Step 1: Choose key type
  if (step === 1) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0f1115]">
        <div className="w-full max-w-md px-6">
          {/* Logo / Title */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#171a21] border border-[#2a2f3a] mb-6 animate-logo-pulse">
              <Sparkles size={30} className="text-[#ff6900]" />
            </div>
            <h1 className="text-xl font-bold text-[#e6e6e6] tracking-tight">
              Welcome to xiaomimimo-gui
            </h1>
            <p className="text-xs text-[#9ca3af] mt-3 leading-relaxed max-w-xs mx-auto">
              Choose how you want to connect to start using the assistant.
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3.5">
            {/* Token Plan */}
            <button
              onClick={() => handleSelectType("token")}
              className="w-full flex items-start gap-4 p-4 rounded-xl border border-[#2a2f3a] bg-[#171a21] hover:border-[#ff6900]/50 hover:bg-[#1d212b] hover:shadow-lg hover:shadow-[#ff6900]/5 transition-all duration-200 text-left group active:scale-[0.99]"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#ff6900]/10 flex items-center justify-center mt-0.5 transition-colors group-hover:bg-[#ff6900]/15">
                <Zap size={18} className="text-[#ff6900]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-[#e6e6e6] block tracking-tight">
                  Use Token Plan
                </span>
                <span className="text-[11px] text-[#9ca3af] mt-1 block leading-relaxed">
                  Free token plan key (tp- prefix)
                </span>
              </div>
              <ArrowRight
                size={16}
                className="flex-shrink-0 text-[#2a2f3a] group-hover:text-[#ff6900] group-hover:translate-x-0.5 transition-all duration-200 mt-1"
              />
            </button>

            {/* API Subscription */}
            <button
              onClick={() => handleSelectType("subscription")}
              className="w-full flex items-start gap-4 p-4 rounded-xl border border-[#2a2f3a] bg-[#171a21] hover:border-[#3b82f6]/50 hover:bg-[#1d212b] hover:shadow-lg hover:shadow-[#3b82f6]/5 transition-all duration-200 text-left group active:scale-[0.99]"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center mt-0.5 transition-colors group-hover:bg-[#3b82f6]/15">
                <Globe size={18} className="text-[#3b82f6]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-[#e6e6e6] block tracking-tight">
                  Use API Subscription
                </span>
                <span className="text-[11px] text-[#9ca3af] mt-1 block leading-relaxed">
                  Regular API key (sk- prefix)
                </span>
              </div>
              <ArrowRight
                size={16}
                className="flex-shrink-0 text-[#2a2f3a] group-hover:text-[#3b82f6] group-hover:translate-x-0.5 transition-all duration-200 mt-1"
              />
            </button>
          </div>

          {/* Hint */}
          <p className="text-center text-[10px] text-[#9ca3af]/70 mt-8">
            You can also configure this later in{" "}
            <span className="text-[#ff6900] font-medium">Settings</span>
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Enter key
  const title =
    keyType === "token" ? "Token Plan Key" : "API Subscription Key";
  const description =
    keyType === "token"
      ? "Enter your token plan key to activate the free tier."
      : "Enter your API subscription key to connect.";

  return (
    <div className="h-screen flex items-center justify-center bg-[#0f1115]">
      <div className="w-full max-w-md px-6" key={keyType}>
        {/* Header */}
        <div className="text-center mb-8 animate-step-in">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#171a21] border border-[#2a2f3a] mb-5 animate-logo-pulse">
            <Key size={22} className="text-[#ff6900]" />
          </div>
          <h2 className="text-lg font-bold text-[#e6e6e6] tracking-tight">{title}</h2>
          <p className="text-xs text-[#9ca3af] mt-2">{description}</p>
        </div>

        {/* Key Input */}
        <div className="space-y-4 animate-step-in" style={{ animationDelay: "0.1s" }}>
          <div className="relative">
            <label className="text-[10px] text-[#9ca3af] uppercase tracking-wider mb-2 block font-medium">
              API Key (starts with {prefix})
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setError(null);
                }}
                placeholder={`${prefix}...`}
                autoFocus
                className="w-full bg-[#171a21] border border-[#2a2f3a] rounded-xl px-4 py-3 pr-10 text-sm text-[#e6e6e6] placeholder:text-[#4a505a] outline-none focus:border-[#ff6900]/50 focus:ring-2 focus:ring-[#ff6900]/15 transition-all duration-200 font-mono"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isValid) {
                    handleSaveAndConnect();
                  }
                }}
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#e6e6e6] transition-colors"
                title={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 animate-fade-in">
              <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-red-400 leading-relaxed">{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            <button
              onClick={handleBack}
              className="flex-1 py-2.5 rounded-xl border border-[#2a2f3a] text-xs font-medium text-[#9ca3af] hover:text-[#e6e6e6] hover:border-[#3a4050] hover:bg-[#2a2f3a]/30 transition-all duration-200"
            >
              Back
            </button>

            <button
              onClick={handleSaveAndConnect}
              disabled={!isValid || saving}
              className="flex items-center justify-center gap-2 flex-[2] py-2.5 rounded-xl bg-[#ff6900] text-xs font-semibold text-white hover:bg-[#e55d00] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] shadow-sm shadow-[#ff6900]/20"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ArrowRight size={14} />
              )}
              Save &amp; Enter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
