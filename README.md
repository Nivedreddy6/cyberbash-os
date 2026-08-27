# ⚡ CyberBash // Linux CLI Simulator & Hacker Quest OS

<p align="center">
  <img src="https://img.shields.io/badge/OS-Linux%20Simulator-00f0ff?style=for-the-badge&logo=linux&logoColor=white" alt="Linux OS" />
  <img src="https://img.shields.io/badge/Engine-Vanilla%20ES6%20%2B%20WebAudio-ff007f?style=for-the-badge&logo=javascript&logoColor=white" alt="Engine" />
  <img src="https://img.shields.io/badge/License-MIT-00ff66?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/Deploy-GitHub%20Pages-fcee0a?style=for-the-badge&logo=githubactions&logoColor=black" alt="Deploy" />
</p>

---

## 🌌 Overview

**CyberBash** is a gamified, retro-futuristic **Linux CLI Simulator**, **Hacker Quest Game**, and **Visual File Explorer** built with modern web technologies (HTML5, Vanilla CSS3, ES6 Modules, and Web Audio API).

It provides an authentic Unix shell experience running directly in your browser with persistent in-memory storage, rich command pipelines, an interactive `nano` text editor, and a 10-level cyber quest: **"Operation: Linux Guardian"**.

---

## ✨ Key Features

### 💻 1. Authentic Unix Terminal & Shell
- **Virtual File System (VFS)**: Complete persistent `/bin`, `/etc`, `/home/guest`, `/var/log`, `/secrets` directory hierarchy with real metadata, timestamps, and permissions (`chmod 755`).
- **Pipes & Redirection**: Chain streams effortlessly (e.g., `cat /var/log/syslog | grep CRITICAL | wc -l`, `echo "hello" > test.txt`, `>>`).
- **Interactive Full-Screen Nano Editor**: Launch `nano filename.txt` with real keyboard shortcuts (`Ctrl+O` to write out, `Ctrl+X` to exit).
- **Process Management**: View running daemons with `ps aux` and `top`, or terminate rogue background miners with `kill <PID>`.
- **Smart Autocompletion**: Press <kbd>Tab</kbd> for command and path autocomplete, and navigate previous commands with <kbd>↑</kbd> and <kbd>↓</kbd>.

### 🛡️ 2. "Operation: Linux Guardian" (10-Level Hacker Quest)
Gamified progressive missions to learn and test your Linux mastery:
1. **Level 1**: Reconnaissance (`pwd`, `ls -la`)
2. **Level 2**: Deciphering Hidden Briefs (`cat .mission_brief.txt`)
3. **Level 3**: Forensic Log Analysis (`grep CRITICAL /var/log/syslog`)
4. **Level 4**: Neutralizing Rogue Crypto Daemon (`kill 7392`)
5. **Level 5**: Security Patch Crafting (`nano notes/security_patch.txt`)
6. **Level 6**: Directory Architect (`mkdir -p backups/secure_logs && tree`)
7. **Level 7**: Permission Hardening (`chmod 700 .bashrc`)
8. **Level 8**: Stream Pipelines (`cat /etc/passwd | wc -l`)
9. **Level 9**: Root Escalation Protocol (`sudo su`)
10. **Level 10**: Matrix Awakening (`neofetch` & `matrix`)

### 🌳 3. Dual-Pane Visual VFS Tree & File Inspector
- Real-time reactive visual tree displaying file icons, executable flags, folder expanders, and file sizes.
- Click any file to inspect permissions, paths, modified timestamps, and live content previews.

### 🎨 4. Retro-Futuristic Themes & Synthetic Audio
- **6 Cyber Themes**: Cyberpunk Neon, Matrix Green, Dracula Dark, Nord Frost, Retro CRT Amber, and Ubuntu Classic.
- **Audio Engine**: Procedural Web Audio API mechanical keystroke clatter, terminal bells, and quest fanfare chimes.
- **CRT Phosphor Screen Overlay**: Real-time scanlines and phosphor bloom toggles.

---

## 🚀 Supported Commands

| Category | Commands |
|---|---|
| **Navigation & Files** | `ls`, `cd`, `pwd`, `mkdir`, `touch`, `rm`, `tree`, `find`, `chmod` |
| **Text Processing** | `cat`, `head`, `tail`, `grep`, `wc`, `echo`, `nano` |
| **System & Processes** | `ps`, `top`, `kill`, `uptime`, `whoami`, `hostname`, `uname`, `free`, `sudo` |
| **Shell Features** | `export`, `alias`, `history`, `clear`, `help`, `reset`, `date`, `man` |
| **Easter Eggs & ASCII** | `neofetch`, `cowsay`, `fortune`, `matrix`, `sl`, `weather` |

---

## 🛠️ Quick Start & Local Preview

Simply open `index.html` in any modern web browser or start a local server:

```bash
# Using Python
python -m http.server 8080

# Using Node.js npx
npx serve .
```

Open `http://localhost:8080` in your browser.

---

## 📤 Push to GitHub & Deploy to GitHub Pages

To host this project on your GitHub profile (`Nivedreddy6`):

1. **Create a new repository** on GitHub (e.g., `linux-cyberbash` or `cyberbash-os`):
   - Go to [https://github.com/new](https://github.com/new)
   - Repository name: `linux-cyberbash`
   - Leave it public and click **Create repository**.

2. **Run these commands in your terminal**:
   ```bash
   git remote add origin https://github.com/Nivedreddy6/linux-cyberbash.git
   git branch -M main
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - Go to your repository on GitHub -> **Settings** -> **Pages**.
   - Under **Build and deployment** -> **Source**, select **GitHub Actions**.
   - Your site will automatically deploy to `https://nivedreddy6.github.io/linux-cyberbash/`!

---

## 📜 License

Distributed under the [MIT License](LICENSE). Built with ❤️ by [Nivedreddy6](https://github.com/Nivedreddy6).
