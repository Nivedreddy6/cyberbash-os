<p align="center" id="top">
  <a href="#top">
    <img src="assets/banner.jpg" alt="CyberBash OS Banner" width="100%" />
  </a>
</p>

<br/>

<p align="center">
  <a href="#top">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=22&duration=3000&pause=1200&color=00F0FF&background=0A0C1400&center=true&vCenter=true&width=900&height=50&lines=%E2%9A%A1+CYBERBASH+OS+%3A%3A+RETRO-FUTURISTIC+WEB+LINUX+DESKTOP;%F0%9F%9B%A1%EF%B8%8F+10-LEVEL+HACKER+QUEST+ENGINE+%2B+AUTHENTIC+BASH+SHELL;%F0%9F%8E%A8+6+NEON+THEMES+%7C+SYNTHETIC+AUDIO+%7C+NAUTILUS+GUI" alt="CyberBash Typing Banner" />
  </a>
</p>

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/⚡_OS-CyberBash_Linux_v2.5-00f0ff?style=for-the-badge&logo=linux&logoColor=000" alt="Linux OS" />
  &nbsp;
  <img src="https://img.shields.io/badge/🔮_Engine-Vanilla_ES6_%2B_VFS-ff007f?style=for-the-badge&logo=javascript&logoColor=fff" alt="Engine" />
  &nbsp;
  <img src="https://img.shields.io/badge/🔊_Audio-Web_Audio_Synth-00ff66?style=for-the-badge&logo=audiomack&logoColor=000" alt="Audio" />
</p>
<p align="center">
  <img src="https://img.shields.io/badge/🎮_Missions-10_Levels_Active-fcee0a?style=for-the-badge&logo=target&logoColor=000" alt="Missions" />
  &nbsp;
  <img src="https://img.shields.io/badge/🛡️_Security-Root_Escalation-9d4edd?style=for-the-badge&logo=hack-the-box&logoColor=fff" alt="Security" />
  &nbsp;
  <img src="https://img.shields.io/badge/📜_License-MIT-3b82f6?style=for-the-badge&logo=open-source-initiative&logoColor=fff" alt="License" />
</p>

<br/>

<p align="center">
  <a href="https://nivedreddy6.github.io/cyberbash-os/" target="_blank" rel="noopener noreferrer"><img src="assets/btn_demo.svg" alt="Live Demo" height="34" /></a>
  &nbsp;
  <a href="#overview"><img src="assets/btn_overview.svg" alt="Overview" height="34" /></a>
  &nbsp;
  <a href="#features"><img src="assets/btn_features.svg" alt="Features" height="34" /></a>
  &nbsp;
  <a href="#quests"><img src="assets/btn_quests.svg" alt="Quests" height="34" /></a>
</p>
<p align="center">
  <a href="#commands"><img src="assets/btn_commands.svg" alt="Commands" height="34" /></a>
  &nbsp;
  <a href="#architecture"><img src="assets/btn_architecture.svg" alt="Architecture" height="34" /></a>
  &nbsp;
  <a href="#shortcuts"><img src="assets/btn_shortcuts.svg" alt="Shortcuts" height="34" /></a>
</p>

<p align="center">
  <a href="#top"><img src="assets/neon_divider.svg" width="100%" /></a>
</p>

> [!TIP]
> ### ⚡ Live Web Deployment Ready!
> **Experience CyberBash OS directly in your browser with zero installation:**  
> 👉 **[https://nivedreddy6.github.io/cyberbash-os/](https://nivedreddy6.github.io/cyberbash-os/)**

---

<a id="overview"></a>
## 🌌 System Overview

> [!IMPORTANT]
> **CyberBash OS** is a gamified, retro-futuristic **Linux GUI Desktop Environment**, **Interactive Unix Shell**, and **Cyber Security Simulator**. Built with **zero framework overhead** (Vanilla ES6 Modules, Hardware-Accelerated CSS3, Dynamic Canvas Digital Rain, and Web Audio Synthesizers), it runs completely client-side in any modern browser.

<p align="center">
  <a href="#top"><img src="assets/neon_divider.svg" width="100%" /></a>
</p>

<a id="features"></a>
## ⚡ Core Feature Matrix

<p align="center">
  <a href="#top">
    <img src="assets/feature_showcase.svg" alt="CyberBash Feature Matrix" width="100%" />
  </a>
</p>

<p align="center">
  <a href="#top"><img src="assets/neon_divider.svg" width="100%" /></a>
</p>

<a id="themes"></a>
## 🎨 6 Neon Aesthetic Themes

<p align="center">
  <a href="#top">
    <img src="assets/themes_banner.svg" alt="CyberBash Themes" width="100%" />
  </a>
</p>

<p align="center">
  <a href="#top"><img src="assets/neon_divider.svg" width="100%" /></a>
</p>

<a id="quests"></a>
## 🎯 10-Level Hacker Quest Manifest

<p align="center">
  <a href="#top">
    <img src="assets/mission_manifest.svg" alt="Operation Linux Guardian Mission Manifest" width="100%" />
  </a>
</p>

<p align="center">
  <a href="#top"><img src="assets/neon_divider.svg" width="100%" /></a>
</p>

<a id="commands"></a>
## 📖 Full Command Lab Reference

<p align="center">
  <a href="#top">
    <img src="assets/command_lab.svg" alt="CyberBash Full Command Lab Reference" width="100%" />
  </a>
</p>

<p align="center">
  <a href="#top"><img src="assets/neon_divider.svg" width="100%" /></a>
</p>

<a id="architecture"></a>
## 🏗️ Architecture & Data Flow

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#00f0ff', 'edgeLabelBackground':'#121526', 'tertiaryColor': '#1a1e36', 'lineColor': '#ff007f'}}}%%
graph TD
    classDef ui fill:#121526,stroke:#00f0ff,stroke-width:2px,color:#00f0ff;
    classDef core fill:#1a1e36,stroke:#ff007f,stroke-width:2px,color:#ff007f;
    classDef vfs fill:#051408,stroke:#00ff66,stroke-width:2px,color:#00ff66;
    classDef audio fill:#241400,stroke:#fcee0a,stroke-width:2px,color:#fcee0a;

    subgraph UI ["🖥️ CyberGNOME Desktop GUI Layer"]
        WM["🪟 WindowManager"]:::ui
        Dock["🚀 Ubuntu / Kali Dock"]:::ui
        TopBar["⚡ System Panel & Live Clock"]:::ui
        Nautilus["📁 Nautilus Files App"]:::ui
        TermView["💻 Terminal ANSI Screen"]:::ui
        SysMon["📊 System Monitor (htop)"]:::ui
    end

    subgraph Core ["⚙️ CyberBash Execution Engine"]
        Shell["🐚 Shell Lexer & Interpreter"]:::core
        Quests["🎯 Quest Engine & XP Matrix"]:::core
        AudioSynth["🔊 Web Audio API Synth"]:::audio
        VFS["💾 Virtual File System (VFS)"]:::vfs
    end

    Dock -->|Open / Focus| WM
    TopBar -->|Theme / Audio / Launcher| WM
    WM -->|Z-Index / Drag / Resize| TermView
    WM -->|Z-Index / Drag / Resize| Nautilus
    WM -->|Z-Index / Drag / Resize| SysMon

    TermView -->|Raw Input Stream| Shell
    Shell -->|Pipes / Redirection / CRUD| VFS
    Shell -->|Command Interception| Quests
    Nautilus -->|Live Path Browsing| VFS
    Quests -->|Level Up Fanfare / Audio Cues| AudioSynth
    VFS -->|Auto-Sanitize & Sync| LocalStorage[("💽 Browser LocalStorage")]:::vfs
```

<p align="center">
  <a href="#top"><img src="assets/neon_divider.svg" width="100%" /></a>
</p>

<a id="shortcuts"></a>
## ⌨️ Desktop Keyboard Shortcuts

<p align="center">
  <a href="#top">
    <img src="assets/shortcuts_matrix.svg" alt="CyberBash Shortcuts Matrix" width="100%" />
  </a>
</p>

<p align="center">
  <a href="#top"><img src="assets/neon_divider.svg" width="100%" /></a>
</p>

## 🚀 Quick Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/Nivedreddy6/cyberbash-os.git
cd cyberbash-os

# 2. Start the lightweight Node server
node server.js

# 3. Open in your browser:
# http://localhost:3000
```

---

<p align="center">
  <img src="https://img.shields.io/badge/⚡_Engineered_by-Nivedreddy6-00f0ff?style=for-the-badge&logo=github&logoColor=white" />
  <img src="https://img.shields.io/badge/MIT_License-Open_Source-00ff66?style=for-the-badge" />
</p>
