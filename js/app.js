/**
 * CYBERBASH // MAIN APPLICATION INITIALIZER & DESKTOP ORCHESTRATOR
 */

import { vfs } from './vfs/filesystem.js';
import { ShellInterpreter } from './shell/interpreter.js';
import { registerCoreCommands } from './shell/commands.js';
import { registerFunCommands } from './shell/funCommands.js';
import { AutocompleteController } from './shell/autocomplete.js';
import { NanoEditor } from './editors/nano.js';
import { QuestEngine } from './quests/questEngine.js';
import { TerminalView } from './ui/terminalView.js';
import { WindowManager } from './ui/windowManager.js';
import { DesktopEnvironment } from './ui/desktop.js';
import { FileManagerApp } from './ui/fileManagerApp.js';
import { SysMonitorApp } from './ui/sysMonitorApp.js';
import { CheatsheetModal } from './ui/cheatsheet.js';
import { sound } from './ui/sound.js';
import { showToast } from './utils/helpers.js';

class CommandRegistry {
  constructor() {
    this.commands = new Map();
  }

  register(name, handler) {
    this.commands.set(name, handler);
  }

  get(name) {
    return this.commands.get(name);
  }
}

class App {
  constructor() {
    this.registry = new CommandRegistry();
    registerCoreCommands(this.registry);
    registerFunCommands(this.registry);

    this.shell = new ShellInterpreter(vfs, this.registry);
    this.autocomplete = new AutocompleteController(vfs, this.registry);
    this.nano = new NanoEditor(vfs);
    this.quests = new QuestEngine(vfs, this.shell);
    this.terminal = new TerminalView(vfs, this.shell, this.autocomplete, this.nano, this.quests);

    // Initialize Window Manager
    this.wm = new WindowManager();
    this.initWindows();

    // Initialize Desktop Apps
    this.fileManager = new FileManagerApp(vfs, this.wm, this.nano);
    this.sysMonitor = new SysMonitorApp();
    this.desktop = new DesktopEnvironment(this.wm);
    this.cheatsheet = new CheatsheetModal(this.terminal);

    // Hook VFS changes to update File Manager live
    const origExecute = this.shell.execute.bind(this.shell);
    this.shell.execute = async (cmdLine) => {
      const res = await origExecute(cmdLine);
      if (this.fileManager) {
        this.fileManager.render();
      }
      return res;
    };

    this.initGlobalControls();
    this.initMatrixCanvas();
    this.initClock();
    this.quests.updateUI();

    // Open terminal window by default on boot
    setTimeout(() => {
      this.wm.open('terminal');
    }, 100);
  }

  initWindows() {
    // Window 1: Terminal
    this.wm.registerWindow('terminal', {
      element: document.getElementById('winTerminal'),
      title: 'bash - Terminal',
      icon: 'fa-solid fa-terminal',
      defaultBounds: {
        x: Math.max(80, Math.floor(window.innerWidth * 0.08)),
        y: 50,
        width: Math.min(820, window.innerWidth - 120),
        height: Math.min(520, window.innerHeight - 80)
      }
    });

    // Window 2: Files (Nautilus)
    this.wm.registerWindow('files', {
      element: document.getElementById('winFiles'),
      title: 'Files (Nautilus)',
      icon: 'fa-solid fa-folder-open',
      defaultBounds: {
        x: Math.max(100, Math.floor(window.innerWidth * 0.14)),
        y: 70,
        width: Math.min(760, window.innerWidth - 140),
        height: Math.min(480, window.innerHeight - 100)
      },
      onFocus: () => {
        if (this.fileManager) this.fileManager.render();
      }
    });

    // Window 3: Quests (Operation: Linux Guardian)
    this.wm.registerWindow('quests', {
      element: document.getElementById('winQuests'),
      title: 'Operation: Linux Guardian',
      icon: 'fa-solid fa-crosshairs',
      defaultBounds: {
        x: Math.max(120, Math.floor(window.innerWidth * 0.18)),
        y: 60,
        width: Math.min(620, window.innerWidth - 160),
        height: Math.min(560, window.innerHeight - 90)
      },
      onFocus: () => {
        if (this.quests) this.quests.updateUI();
      }
    });

    // Window 4: Cheatsheet
    this.wm.registerWindow('cheatsheet', {
      element: document.getElementById('winCheatsheet'),
      title: 'Linux Cheatsheet Lab',
      icon: 'fa-solid fa-book-bookmark',
      defaultBounds: {
        x: Math.max(110, Math.floor(window.innerWidth * 0.12)),
        y: 65,
        width: Math.min(800, window.innerWidth - 130),
        height: Math.min(520, window.innerHeight - 95)
      },
      onFocus: () => {
        if (this.cheatsheet) this.cheatsheet.render();
      }
    });

    // Window 5: System Monitor (htop)
    this.wm.registerWindow('sysmon', {
      element: document.getElementById('winSysmon'),
      title: 'System Monitor (htop)',
      icon: 'fa-solid fa-chart-line',
      defaultBounds: {
        x: Math.max(140, Math.floor(window.innerWidth * 0.2)),
        y: 80,
        width: Math.min(700, window.innerWidth - 160),
        height: Math.min(460, window.innerHeight - 110)
      }
    });

    // Window 6: Settings
    this.wm.registerWindow('settings', {
      element: document.getElementById('winSettings'),
      title: 'Desktop Settings',
      icon: 'fa-solid fa-gear',
      defaultBounds: {
        x: Math.max(130, Math.floor(window.innerWidth * 0.22)),
        y: 90,
        width: Math.min(640, window.innerWidth - 150),
        height: Math.min(440, window.innerHeight - 120)
      }
    });
  }

  initGlobalControls() {
    // Theme Switcher Dropdown
    const themeSelectBtn = document.getElementById('themeSelectBtn');
    const themeMenu = document.getElementById('themeMenu');
    const themeOpts = document.querySelectorAll('.theme-opt');

    if (themeSelectBtn && themeMenu) {
      themeSelectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        themeMenu.classList.toggle('hidden');
      });

      document.addEventListener('click', () => {
        themeMenu.classList.add('hidden');
      });

      themeOpts.forEach(opt => {
        opt.addEventListener('click', () => {
          sound.playKeyClick();
          const theme = opt.dataset.theme;
          document.documentElement.setAttribute('data-theme', theme);
          localStorage.setItem('cyberbash_theme', theme);
          themeMenu.classList.add('hidden');
          showToast('Theme Changed', `Switched to ${opt.textContent.trim()}`, 'info');
        });
      });

      // Restore saved theme
      const savedTheme = localStorage.getItem('cyberbash_theme');
      if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
      }
    }

    // Audio Toggle
    const soundBtn = document.getElementById('soundToggleBtn');
    const soundIcon = document.getElementById('soundIcon');
    if (soundBtn && soundIcon) {
      soundBtn.addEventListener('click', () => {
        const isEnabled = sound.toggle();
        soundIcon.className = isEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
        soundBtn.classList.toggle('active', isEnabled);
        showToast('Audio', isEnabled ? 'Sound effects enabled' : 'Sound muted', 'info');
      });
    }

    // CRT Scanlines Toggle
    const crtBtn = document.getElementById('crtToggleBtn');
    const crtOverlay = document.getElementById('crtOverlay');
    if (crtBtn && crtOverlay) {
      crtBtn.addEventListener('click', () => {
        sound.playKeyClick();
        const isActive = crtOverlay.classList.toggle('disabled');
        crtBtn.classList.toggle('active', !isActive);
        showToast('Display Filter', !isActive ? 'CRT Scanlines ON' : 'CRT Scanlines OFF', 'info');
      });
    }

    // Terminal Clear Action Button in Titlebar
    const termClearBtn = document.getElementById('termClearBtn');
    if (termClearBtn) {
      termClearBtn.addEventListener('click', () => {
        sound.playKeyClick();
        this.terminal.handleCommand('clear');
      });
    }
  }

  initClock() {
    const clockDisp = document.getElementById('desktopClock');
    if (!clockDisp) return;

    const update = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const timeStr = now.toTimeString().split(' ')[0];
      clockDisp.textContent = `${dateStr}  ${timeStr}`;
    };
    update();
    setInterval(update, 1000);
  }

  initMatrixCanvas() {
    const canvas = document.getElementById('matrixCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const chars = '0123456789ABCDEF!@#$%&*<>{}[]λπΩ';
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    let isRunning = true;

    window.toggleMatrixEffect = () => {
      isRunning = !isRunning;
      canvas.style.opacity = isRunning ? '0.35' : '0.05';
    };

    const draw = () => {
      if (!isRunning) {
        requestAnimationFrame(draw);
        return;
      }

      ctx.fillStyle = 'rgba(10, 12, 20, 0.05)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#00ff66';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      requestAnimationFrame(draw);
    };

    draw();
  }
}

function initApp() {
  if (!window.cyberbash) {
    window.cyberbash = new App();
    console.log('[CyberBash] OS initialized successfully.');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
