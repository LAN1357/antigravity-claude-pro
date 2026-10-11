# Claude Antigravity Pro (Awwwards & Apple Design Edition)

[中文说明](#-中文说明) | [English](#-english)

---

## 🇨🇳 中文说明

为 **Google Antigravity 2.x** 桌面客户端（macOS & Windows 双平台）量身定制的顶级设计系统方案。

融合 **Apple Design System（WWDC 物理动效与光学排版）** 与 **cursor.directory 高工设计标准（1px 深度阶梯与微交互）**，对标 **Awwwards Site of the Day / FWA 获奖品质**。

通过 Chromium 远程调试端口进行**纯无损内存注入**：**不修改任何应用本体文件、不解包 `app.asar`、不依赖第三方社区修补工具、不破坏代码签名**。随时可秒回官方原版。

---

### ✨ 核心设计亮点 (Award-Winning Highlights)

- **🎨 典雅纸白与黑曜石沉浸双模式 (Dual Mode)**：
  - **浅色模式**：采用 Claude 标志性温润中性暖调底色（`#FAF9F5`），纯白卡片（`#FFFFFF`）配合发丝级高光与双层环境漫反射阴影。
  - **深色模式**：炭黑黑曜石质感（`#151514`），发丝高光边框（`rgba(255, 255, 255, 0.075)`），沉浸专注。
- **🫧 悬浮晶透高能控制坞 (Floating Acrylic Dock)**：
  - 底部输入框重塑为 20px 大圆角悬浮浮动 Dock，配备 `backdrop-filter: blur(28px) saturate(190%)` 晶透毛玻璃。
  - 聚焦时触发细腻上浮微动效与柔和陶土橙光晕呼吸（`#DA7756`）。
- **🍎 Apple 原生物理微交互 (WWDC Fluid Interfaces)**：
  - **零延迟按压反馈**：在 `pointer-down` 瞬间即提供 `scale(0.97)` 物理压缩触感，无多余等待延迟。
  - **可打断弹性动效**：全部抽屉、浮层、手风琴折叠均基于真实弹簧阻尼参数运行。
- **👁️ 光学排版工程 (Optical Typography)**：
  - 标题启用负向字偶距光学紧缩（Negative Tracking），正文采用舒适黄金行高（1.72）。
  - 所有时间戳、计数器与数字指标严格启用等宽数字（`tabular-nums`），彻底消除布局抖动。
- **📄 文件极速交互与原质上下文菜单**：
  - **左键单击**：直接唤起系统默认关联程序秒开文件。
  - **右键单击**：唤起 macOS Tahoe / Windows 11 原质毛玻璃菜单，支持「在访达中显示 / 在资源管理器中显示」、「复制完整路径」、「复制文件名」。
- **🗂️ 侧边栏三段式折叠与 SPA 极速路由**：
  - 置顶 / 项目 / 最近 三段式收纳，支持平滑手风琴风琴折叠。
  - 全局「`+ 新建对话`」无刷新秒级跳转日常工作区。
- **⚡ 实时热重载 (Live Hot Reload)**：
  - 修改 `claude-style.css` 或 `claude-enhancer.js` 保存后，毫秒级推送到运行中的活动窗口，无需重启应用。

---

### 🚀 极速安装与使用指南

#### 🍎 macOS 用户 (Apple Silicon M1/M2/M3/M4 & Intel)

1. **环境准备**：已安装 [Node.js](https://nodejs.org/) (`brew install node`)
2. **一键安装**：
   ```bash
   git clone https://github.com/LAN1357/antigravity-claude-award.git ~/claude-style
   cd ~/claude-style
   chmod +x install.sh
   ./install.sh
   ```
   > `install.sh` 将自动安装轻量依赖、提取官方高分辨率图标，并在 `~/Applications` 下编译生成原生 **`Claude Antigravity.app`**。

3. **日常启动**：
   - 按 `Cmd + 空格` 搜索 **`Claude Antigravity`** 回车秒开；
   - 或双击运行 `~/claude-style/start-claude-style.command`。

---

#### 🪟 Windows 用户 (Windows 10 / 11)

1. **环境准备**：已安装 [Node.js](https://nodejs.org/)（或运行 `winget install OpenJS.NodeJS.LTS`）
2. **一键安装**：
   在 CMD 或 PowerShell 中运行：
   ```cmd
   git clone https://github.com/LAN1357/antigravity-claude-award.git "%USERPROFILE%\claude-style"
   cd /d "%USERPROFILE%\claude-style"
   install.bat
   ```
   > `install.bat` 会自动在桌面创建无控制台黑框的 **`Claude Antigravity`** 快捷方式。

3. **日常启动**：
   - 双击桌面上自动生成的 **`Claude Antigravity`** 快捷图标；
   - 或在开始菜单搜索 `Claude Antigravity` 回车启动。

---

### 🛠️ 故障排查与一键修复

如果 Antigravity 因僵尸进程、系统代理切换或缓存死锁打不开，可运行专属一键修复工具：
- **macOS**：双击运行 `repair-antigravity.command`
- **Windows**：双击运行 `repair-antigravity.bat`

自动清理死锁，重新嗅探代理并启动注入，**严格保护全部聊天记录与用户配置**。

---

## 🌐 English

An **Awwwards / FWA winning caliber** design system and interaction suite for **Google Antigravity 2.x** desktop client on macOS & Windows.

Built on **Apple Human Interface Guidelines (WWDC 2018/2020/2026)** and **cursor.directory high-craft standards**.

### ✨ Highlights

- **100% Non-Destructive**: Zero binary patching, zero `app.asar` unpacking, zero signature breakage. Fully reversible at any time.
- **Editorial Paper & Obsidian Modes**: Warm alabaster paper background (`#FAF9F5`) in light mode, deep obsidian slate (`#151514`) in dark mode.
- **Floating Acrylic Dock**: 20px rounded glassmorphic input dock with `backdrop-filter: blur(28px) saturate(190%)` and dual-layer ambient shadows.
- **WWDC Fluid Motion**: Zero-latency press feedback (`scale(0.97)` on pointer-down) and interruptible spring physics across all modals and drawers.
- **Native File Context Menu**: Left-click to open files directly in default apps; right-click for frosted glass menu with Reveal in Finder / File Explorer.
- **Cross-Platform**: Tailored scripts and native app bundles for macOS and Windows.

---

### 📁 Project Structure

```text
├── claude-style.css           # Core stylesheet (Apple typography, tokens, glassmorphism)
├── claude-enhancer.js         # Enhancer logic (Finder/Explorer context menu, accordion)
├── inject.js                  # Cross-platform Puppeteer CDP injector
├── install.sh                 # macOS one-click installer (generates native .app)
├── start-claude-style.command # macOS launcher (proxy sniffing & CDP injection)
├── repair-antigravity.command # macOS one-click diagnostic & repair tool
├── install.bat                # Windows one-click installer (creates desktop shortcut)
├── start-claude-style.bat     # Windows launcher
├── repair-antigravity.bat     # Windows one-click diagnostic & repair tool
├── run-silent.vbs             # Windows silent background runner
├── screenshots/               # High-fidelity visual captures
└── README.md                  # Comprehensive bilingual guide
```

---

### 📄 License

[MIT License](LICENSE) © 2026 LAN1357
