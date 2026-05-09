# xiaomimimo · Native AI Agent Client for Xiaomi MiMo

> **Rust-native · 1M context · TUI + GUI · Deeply adapted for the Xiaomi MiMo API**

**xiaomimimo** is a Rust-native AI Agent client optimized for [Xiaomi MiMo](https://api.xiaomimimo.com/v1).  
It provides both a terminal-based TUI and a desktop GUI experience, with support for long-context reasoning, project workspaces, MCP extensions, artifacts, TTS interaction, session persistence, and Xiaomi MiMo API routing.

[中文 README](README.zh-CN.md)

---

## 🎉 Xiaomi MiMo 100T Free Token Plan

Xiaomi MiMo is offering a limited-time free token campaign for global users, with a total allocation of **100 trillion tokens** within 30 days, available while supplies last.

| Item | Details |
|---|---|
| Campaign period | April 28, 2026 00:00 to May 28, 2026 00:00, Beijing Time |
| Application website | [100t.xiaomimimo.com](https://100t.xiaomimimo.com) |
| Maximum plan | Max Token Plan with 1.6 billion credits |
| Token Plan key prefix | `tp-` |

After receiving a Token Plan key starting with `tp-`, you can use it directly:

```bash
export XIAOMI_API_KEY="tp-xxxxxxxx"
xiaomimimo
```

The client automatically detects the `tp-` prefix and routes requests to the Token Plan endpoint. No manual base URL configuration is required.

> Note: This campaign is time-limited and subject to Xiaomi MiMo's official terms.

---

## ✨ Features

* 🦀 **Rust-native** — Single-binary distribution with no runtime dependency for the TUI
* 🖥️ **TUI + GUI** — Terminal mode for developers and a Tauri-based desktop GUI
* 🧠 **1M context support** — Designed for MiMo-V2.5-Pro's 1,048,576-token context window
* 💬 **Streaming reasoning display** — Shows model reasoning streams in real time, with collapse/expand support
* 📊 **Context Meter** — Displays token usage, cache hit rate, and estimated cost
* 🎨 **Artifacts panel** — Claude Desktop-style side panel for Markdown, code, HTML, SVG, and JSON outputs
* 🔌 **MCP extensions** — Connect local files, Git, browsers, databases, and other MCP tools
* 🎤 **TTS voice interaction** — Adapted for MiMo-V2.5-TTS with multiple voice styles
* 🔐 **Approval-based safety model** — Configurable approval policies for file writes, shell commands, and Git operations
* 📦 **Project workspace** — File tree, Git diff, terminal, and patch preview
* 🗄️ **Session persistence** — SQLite-backed chat history with restore, fork, and archive support
* 🔑 **Keychain integration** — Store API keys in the system credential store instead of plaintext files

---

## 📥 Installation

```bash
cargo install --git https://github.com/shichenghaoshu/xiaomimimo xiaomimimo-cli xiaomimimo-tui
```

### Build from source

```bash
git clone https://github.com/shichenghaoshu/xiaomimimo
cd xiaomimimo
cargo build --release

# Binary:
./target/release/xiaomimimo
```

### Run the GUI

The GUI requires Node.js 18+ and pnpm.

```bash
cd apps/xiaomimimo-gui
pnpm install
pnpm tauri dev
```

---

## 🚀 Quick Start

### 1. Set your Xiaomi MiMo API key

```bash
xiaomimimo auth set --provider xiaomi --api-key "tp-xxxxxxxx"
```

### 2. Start interactive TUI mode

```bash
xiaomimimo
```

### 3. Ask a one-shot question

```bash
xiaomimimo -p "Write a simple HTTP server in Rust"
```

### 4. Run the GUI

```bash
cd apps/xiaomimimo-gui
pnpm tauri dev
```

---

## 🤖 Supported Xiaomi MiMo Models

| Model             |          Context | Best for                           |
| ----------------- | ---------------: | ---------------------------------- |
| `mimo-v2.5-pro` ⭐ | 1,048,576 tokens | Deep reasoning, coding, long tasks |
| `mimo-v2.5`       |   262,144 tokens | Fast response, general chat        |
| `mimo-v2-omni`    |   262,144 tokens | Multimodal understanding           |
| `mimo-v2.5-tts`   |     8,192 tokens | Text-to-speech                     |

After `XIAOMI_API_KEY` is set, the client automatically detects the Xiaomi provider.

* Keys starting with `tp-` are routed to the Token Plan endpoint.
* Keys starting with `sk-` are routed to the subscription API endpoint.

---

## 🧭 Agent Modes

xiaomimimo supports three execution modes:

| Mode    | Description                                                              |
| ------- | ------------------------------------------------------------------------ |
| `Plan`  | Read-only analysis. No file changes are made.                            |
| `Agent` | File changes require user approval.                                      |
| `YOLO`  | Executes automatically with snapshots for rollback. Disabled by default. |

In the TUI, use `/model` or related slash commands to switch models and modes.
In the GUI, use the Settings panel.

---

## 🧪 Feature Status

| Feature              | Status                      |
| -------------------- | --------------------------- |
| TUI chat             | Stable / active development |
| Xiaomi MiMo provider | Beta                        |
| Long-context support | Beta                        |
| GUI                  | Experimental                |
| MCP integration      | Beta                        |
| TTS                  | Experimental                |
| Artifacts            | Experimental                |
| Session persistence  | Beta                        |

---

## 🔧 Configuration

```toml
# ~/.xiaomimimo/config.toml
provider = "xiaomi"
model = "mimo-v2.5-pro"

[providers.xiaomi]
api_key = "tp-xxxxxxxx"
base_url = "https://api.xiaomimimo.com/v1"
model = "mimo-v2.5-pro"
```

For more options, see [config.example.toml](config.example.toml).

---

## 📜 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

The initial codebase is based on [Hmbown/DeepSeek-TUI](https://github.com/Hmbown/DeepSeek-TUI). Thanks to the original author and the open-source community.

---

## 🙏 Acknowledgements

* **Xiaomi MiMo Team** — for providing the MiMo API and the 100T Token Plan
* **DeepSeek-TUI Community** — for the original Rust AI Agent TUI foundation
* **Tauri Team** — for the cross-platform desktop application framework
* **All contributors** — for testing, feedback, and code contributions

---

<p align="center">
  <img src="assets/poster.png" alt="Xiaomi MiMo 100T Token Plan" width="600" />
</p>

<p align="center">
  <sub>Made with 🦀 Rust · Powered by Xiaomi MiMo</sub>
</p>
