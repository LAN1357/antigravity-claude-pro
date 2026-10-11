# Claude Antigravity Pro - macOS 指南

专为 **macOS (Apple Silicon M1/M2/M3/M4 及 Intel Mac)** 量身打造的 Claude Minimal Awwwards 级设计系统方案。

---

### ✨ macOS 专属特性

1. **原生系统字体渲染**：调用 macOS 官方最佳字体栈（`SF Pro Display` / `SF Pro Text` / `PingFang SC` / `SF Mono`），完美适配 Retina 视网膜高清屏。
2. **Apple 级毛玻璃材质与物理动效**：
   - 底部悬浮控制坞采用 `-webkit-backdrop-filter: blur(28px) saturate(190%)`。
   - 窗口所有折叠抽屉与按压反馈基于 WWDC Fluid Interfaces 弹簧物理（Spring Damping 1.0, Response 0.35s）。
3. **原生访达联动与上下文菜单**：
   - **左键单击**文件链接：直接使用 macOS 默认关联程序（如 Xcode、VS Code、Preview、Typora）秒开。
   - **右键单击**文件链接：弹出 macOS Tahoe 风格原生毛玻璃菜单，支持**「在访达中显示 (Reveal in Finder)」**、**「复制完整路径」**、**「复制文件名」**。
4. **原生 .app 快捷启动**：
   - 安装时自动提取 `/Applications/Antigravity.app` 原生图标。
   - 自动生成 `~/Applications/Claude Antigravity.app`。
   - 支持通过 **Spotlight (Cmd + 空格)** 或 **Raycast / Alfred** 键入 `Claude Antigravity` 回车秒开。
5. **系统代理智能穿透**：
   - 自动通过 `scutil --proxy` 嗅探 macOS 网络代理并注入给内核语言服务器，杜绝直连 Google 导致的 ERR_TIMED_OUT 白屏。

---

### 🚀 极速安装

#### 1. 确认 Node.js 环境
在终端运行：
```bash
node -v
```
若未安装，推荐通过 Homebrew 一键安装：
```bash
brew install node
```

#### 2. 一键安装并生成快捷应用
```bash
git clone https://github.com/LAN1357/antigravity-claude-pro.git ~/claude-style
cd ~/claude-style
chmod +x install.sh
./install.sh
```

---

### 🖥️ 日常启动方式

- **方式一（推荐）**：按 `Cmd + 空格` 调出 Spotlight 聚焦搜索，输入 `Claude Antigravity` 回车启动。
- **方式二**：将 `~/Applications/Claude Antigravity.app` 拖入系统程序坞 (Dock) 点按启动。
- **方式三**：双击运行项目根目录下的 `start-claude-style.command`。

---

### 🛠️ 故障排查与一键修复

如果遇到 Antigravity 僵尸进程卡死、系统代理切换或缓存异常，只需双击运行：
```bash
~/claude-style/repair-antigravity.command
```
该工具将自动：
- 释放 9223 端口与残留死锁
- 清理 Chromium `SingletonLock`、`SingletonSocket`、`GPUCache`
- 重新嗅探系统代理并重新加载最新主题
- **严格保护所有聊天记录与日常工作区配置**
