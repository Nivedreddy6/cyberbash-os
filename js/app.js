/**
 * CYBERBASH // MAIN APPLICATION INITIALIZER
 */

import { vfs } from './vfs/filesystem.js';
import { ShellInterpreter } from './shell/interpreter.js';
import { registerCoreCommands } from './shell/commands.js';
import { registerFunCommands } from './shell/funCommands.js';
import { AutocompleteController } from './shell/autocomplete.js';
import { NanoEditor } from './editors/nano.js';
import { QuestEngine } from './quests/questEngine.js';
import { TerminalView } from './ui/terminalView.js';
import { ExplorerView } from './ui/explorerView.js';
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
    this.explorer = new ExplorerView(vfs, this.shell, this.terminal);
    this.cheatsheet = new CheatsheetModal(this.terminal);

    this.initGlobalControls();
    this.initMatrixCanvas();
    this.initClock();
    this.quests.updateUI();
  }

  initGlobalControls() {
    // Theme Management
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
        showToast('Display', !isActive ? 'CRT Scanlines ON' : 'CRT Scanlines OFF', 'info');
      });
    }

    // Quest Drawer Toggle
    const toggleQuestsBtn = document.getElementById('toggleQuestsBtn');
    const questDrawer = document.getElementById('questDrawer');
    const closeQuestDrawerBtn = document.getElementById('closeQuestDrawerBtn');
    const toggleHintBtn = document.getElementById('toggleHintBtn');
    const hintContent = document.getElementById('missionHintContent');

    if (toggleQuestsBtn && questDrawer) {
      toggleQuestsBtn.addEventListener('click', () => {
        sound.playKeyClick();
        questDrawer.classList.toggle('open');
        this.quests.updateUI();
      });
    }

    if (closeQuestDrawerBtn && questDrawer) {
      closeQuestDrawerBtn.addEventListener('click', () => {
        sound.playKeyClick();
        questDrawer.classList.remove('open');
      });
    }

    if (toggleHintBtn && hintContent) {
      toggleHintBtn.addEventListener('click', () => {
        sound.playKeyClick();
        hintContent.classList.toggle('hidden');
      });
    }

    // Quick Help Button
    const quickHelpBtn = document.getElementById('quickHelpBtn');
    if (quickHelpBtn) {
      quickHelpBtn.addEventListener('click', () => {
        sound.playKeyClick();
        this.terminal.input.value = 'help';
        this.terminal.handleCommand('help');
      });
    }
  }

  initClock() {
    const clockDisp = document.getElementById('clockDisplay');
    if (!clockDisp) return;

    const update = () => {
      const now = new Date();
      clockDisp.textContent = now.toTimeString().split(' ')[0] + ' UTC';
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

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.cyberbash = new App();
});
