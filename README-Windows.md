# Claude Antigravity Pro - Windows 指南

专为 **Windows 10 / 11** 量身打造的 Claude Minimal Awwwards 级设计系统方案。

---

### ✨ Windows 专属特性

1. **清晰字体渲染**：精选 `Segoe UI` + `微软雅黑 UI` + `Cascadia Code / Consolas`，解决 Windows 下的字偶距与清晰度问题。
2. **纯净后台运行 (Zero CMD Black Window)**：
   - 配备 `run-silent.vbs` 与桌面专用快捷方式。
   - 双击桌面图标直接静默启动，不弹出任何黑色 CMD 命令行窗口。
3. **资源管理器联动与上下文菜单**：
   - **左键单击**文件链接：直接使用系统默认程序即时打开。
   - **右键单击**文件链接：唤起 Windows 11 Fluent 风格毛玻璃菜单，支持**「在资源管理器中显示」**、**「复制完整路径」**、**「复制文件名」**。
4. **系统代理无缝注入**：
   - 自动读取注册表 `HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings` 中的 `ProxyServer` 并注入给 Go 内核，杜绝连接 Google 超时白屏。

---

### 🚀 极速安装

#### 1. 确认 Node.js 环境
在 CMD 或 PowerShell 中运行：
```cmd
node -v
```
若未安装，推荐通过 winget 快速安装：
```cmd
winget install OpenJS.NodeJS.LTS
```

#### 2. 一键安装并生成桌面图标
```cmd
git clone https://github.com/LAN1357/antigravity-claude-pro.git "%USERPROFILE%\claude-style"
cd /d "%USERPROFILE%\claude-style"
install.bat
```

---

### 🖥️ 日常启动方式

- **方式一（推荐）**：双击桌面上自动生成的 **`Claude Antigravity`** 快捷方式。
- **方式二**：在开始菜单搜索 `Claude Antigravity` 回车启动。
- **方式三**：双击目录下的 `start-claude-style.bat`。

---

### 🛠️ 故障排查与一键修复

如果遇到 Antigravity 僵尸进程卡死、系统代理切换或缓存死锁，只需双击运行：
```cmd
"%USERPROFILE%\claude-style\repair-antigravity.bat"
```
自动清理残留死锁，重新匹配代理并重新加载最新主题，**严格保留全部聊天记录与配置**。
