/**
 * CYBERBASH // TERMINAL VIEW & DOM RENDERING
 */

import { parseAnsiToHtml, escapeHtml } from '../utils/helpers.js';
import { sound } from './sound.js';

export class TerminalView {
  constructor(vfs, shell, autocomplete, nanoEditor, questEngine) {
    this.vfs = vfs;
    this.shell = shell;
    this.autocomplete = autocomplete;
    this.nano = nanoEditor;
    this.quests = questEngine;

    this.screen = document.getElementById('termScreen');
    this.output = document.getElementById('termOutput');
    this.input = document.getElementById('termInput');
    this.promptUser = document.querySelector('.prompt-user');
    this.promptPath = document.querySelector('.prompt-path');
    this.promptChar = document.querySelector('.prompt-char');
    this.cwdDisplay = document.getElementById('currentCwdDisplay');
    this.userNameDisplay = document.getElementById('currentUserName');

    this.initEvents();
    this.renderWelcomeBanner();
    this.updatePrompt();
  }

  initEvents() {
    if (!this.input || !this.screen) return;

    // Focus input on clicking anywhere on the terminal screen
    this.screen.addEventListener('click', (e) => {
      if (!this.nano.isOpen && !window.getSelection().toString()) {
        this.input.focus();
      }
    });

    // Input Keydown events
    this.input.addEventListener('keydown', async (e) => {
      if (this.nano.isOpen) return;

      // Key click audio
      sound.playKeyClick();

      // Enter
      if (e.key === 'Enter') {
        e.preventDefault();
        sound.playEnter();
        const cmd = this.input.value;
        this.input.value = '';
        await this.handleCommand(cmd);
        return;
      }

      // Up Arrow (Previous command)
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = this.autocomplete.getPrevious();
        if (prev !== null) {
          this.input.value = prev;
        }
        return;
      }

      // Down Arrow (Next command)
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = this.autocomplete.getNext();
        this.input.value = next;
        return;
      }

      // Tab (AutoComplete)
      if (e.key === 'Tab') {
        e.preventDefault();
        const { completed, matches } = this.autocomplete.autocomplete(this.input.value);
        this.input.value = completed;

        if (matches.length > 1) {
          this.appendLine(matches.join('  '), 'dim-line');
          this.scrollToBottom();
        }
        return;
      }

      // Ctrl + L (Clear screen)
      if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        this.clear();
        return;
      }

      // Ctrl + C (Interrupt)
      if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        this.appendCommandLine(this.input.value + '^C');
        this.input.value = '';
        this.scrollToBottom();
        return;
      }
    });

    // Quick helper keys in the bottom bar
    const quickKeyBtns = document.querySelectorAll('.k-btn');
    quickKeyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.dataset.cmd;
        const key = btn.dataset.key;

        if (cmd) {
          this.input.value = cmd;
          this.handleCommand(cmd);
        } else if (key === 'Tab') {
          const { completed } = this.autocomplete.autocomplete(this.input.value);
          this.input.value = completed;
          this.input.focus();
        } else if (key === 'ArrowUp') {
          const prev = this.autocomplete.getPrevious();
          if (prev !== null) this.input.value = prev;
          this.input.focus();
        } else if (key === 'ArrowDown') {
          const next = this.autocomplete.getNext();
          this.input.value = next;
          this.input.focus();
        } else if (key === 'CtrlC') {
          this.appendCommandLine(this.input.value + '^C');
          this.input.value = '';
          this.input.focus();
        }
      });
    });

    // Close button in title bar to clear terminal
    const closeDot = document.querySelector('.dot-close');
    if (closeDot) {
      closeDot.addEventListener('click', () => this.clear());
    }
  }

  updatePrompt() {
    const user = this.shell.env.USER;
    let path = this.vfs.cwd;
    if (path.startsWith('/home/guest')) {
      path = '~' + path.slice(11);
    }

    if (this.promptUser) this.promptUser.textContent = user;
    if (this.promptPath) this.promptPath.textContent = path;
    if (this.promptChar) this.promptChar.textContent = user === 'root' ? '#' : '$';
    if (this.cwdDisplay) this.cwdDisplay.textContent = this.vfs.cwd;
    if (this.userNameDisplay) this.userNameDisplay.textContent = user;
  }

  async handleCommand(rawCmd) {
    const trimmed = rawCmd.trim();
    if (!trimmed) {
      this.appendCommandLine('');
      this.scrollToBottom();
      return;
    }

    this.autocomplete.addHistory(trimmed);
    this.appendCommandLine(trimmed);

    // Check for nano command
    if (trimmed.startsWith('nano')) {
      const parts = trimmed.split(/\s+/);
      const targetFile = parts[1] || 'untitled.txt';
      const resolved = this.vfs.normalizePath(targetFile);
      this.nano.open(resolved, () => {
        this.input.focus();
        this.updatePrompt();
        this.quests.onCommandExecuted(trimmed);
      });
      return;
    }

    // Check for clear command
    if (trimmed === 'clear' || trimmed === 'cls') {
      this.clear();
      this.quests.onCommandExecuted(trimmed);
      return;
    }

    // Execute through interpreter
    const result = await this.shell.execute(trimmed);

    if (result.stdout) {
      this.appendLine(result.stdout);
    }
    if (result.stderr) {
      this.appendLine(result.stderr, 'error-line');
      sound.playError();
    }

    this.updatePrompt();
    this.scrollToBottom();

    // Trigger quest validation
    this.quests.onCommandExecuted(trimmed);
  }

  appendCommandLine(cmdText) {
    const line = document.createElement('div');
    line.className = 'term-line cmd-entry';

    let path = this.vfs.cwd;
    if (path.startsWith('/home/guest')) path = '~' + path.slice(11);
    const user = this.shell.env.USER;
    const char = user === 'root' ? '#' : '$';

    line.innerHTML = `<span class="prompt-user">${user}</span>@<span class="prompt-host">cybernode</span>:<span class="prompt-path">${path}</span><span class="prompt-char">${char}</span> ${escapeHtml(cmdText)}`;
    this.output.appendChild(line);
  }

  appendLine(text, customClass = '') {
    const line = document.createElement('div');
    line.className = `term-line ${customClass}`;
    line.innerHTML = parseAnsiToHtml(text);
    this.output.appendChild(line);
  }

  clear() {
    this.output.innerHTML = '';
    this.scrollToBottom();
  }

  scrollToBottom() {
    requestAnimationFrame(() => {
      this.screen.scrollTop = this.screen.scrollHeight;
    });
  }

  renderWelcomeBanner() {
    const banner = [
      '\x1b[36m   ______      __               ____             __  \x1b[0m',
      '\x1b[36m  / ____/_  __/ /_  ___  _____ / __ )____ ______/ /_ \x1b[0m',
      '\x1b[36m / /   / / / / __ \\/ _ \\/ ___// __  / __ `/ ___/ __ \\\x1b[0m',
      '\x1b[36m/ /___/ /_/ / /_/ /  __/ /   / /_/ / /_/ (__  ) / / /\x1b[0m',
      '\x1b[36m\\____/\\__, /_.___/\\___/_/   /_____/\\__,_/____/_/ /_/ \x1b[0m',
      '\x1b[36m     /____/                                          \x1b[0m',
      ' \x1b[35m[ Linux Virtual Terminal & Cyber Hacker Simulator v2.5.0-LTS ]\x1b[0m',
      ' Type \x1b[33m"help"\x1b[0m for commands or click \x1b[35m"Missions"\x1b[0m to begin the Hacker Quest.',
      ' ----------------------------------------------------------------------'
    ].join('\n');

    this.appendLine(banner);
  }
}
