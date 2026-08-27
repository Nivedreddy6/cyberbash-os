/**
 * CYBERBASH // INTERACTIVE CHEATSHEET & COMMAND BUILDER
 */

import { sound } from './sound.js';
import { escapeHtml } from '../utils/helpers.js';

export const CHEATSHEET_DATA = [
  {
    name: 'ls',
    cat: 'nav',
    desc: 'List directory contents, file attributes, permissions and sizes.',
    example: 'ls -la',
    fullDesc: 'Use -l for long format and -a to reveal hidden dotfiles.'
  },
  {
    name: 'cd',
    cat: 'nav',
    desc: 'Change working directory across the virtual filesystem.',
    example: 'cd /var/log',
    fullDesc: 'Use "cd .." to move up one directory level or "cd ~" for home.'
  },
  {
    name: 'pwd',
    cat: 'nav',
    desc: 'Print working directory path from root /.',
    example: 'pwd',
    fullDesc: 'Prints the absolute path of the current directory.'
  },
  {
    name: 'cat',
    cat: 'text',
    desc: 'Concatenate and display file content.',
    example: 'cat /etc/passwd',
    fullDesc: 'Outputs full file content or concatenates multiple files.'
  },
  {
    name: 'grep',
    cat: 'text',
    desc: 'Search for text patterns using regular expressions.',
    example: 'grep -i "critical" /var/log/syslog',
    fullDesc: 'Filters text lines matching a search expression. Use -i for case-insensitive.'
  },
  {
    name: 'wc',
    cat: 'text',
    desc: 'Word, line, and byte counter.',
    example: 'cat /etc/passwd | wc -l',
    fullDesc: 'Counts lines (-l), words (-w), and bytes (-c).'
  },
  {
    name: 'mkdir',
    cat: 'nav',
    desc: 'Create new directory hierarchy.',
    example: 'mkdir -p backups/logs',
    fullDesc: 'Use -p flag to create parent directories as needed.'
  },
  {
    name: 'touch',
    cat: 'nav',
    desc: 'Create an empty file or update modified timestamp.',
    example: 'touch notes.txt',
    fullDesc: 'Quickly creates a new blank file in the current directory.'
  },
  {
    name: 'rm',
    cat: 'nav',
    desc: 'Remove files or directories recursively.',
    example: 'rm -r old_data',
    fullDesc: 'Deletes files. Use -r for recursive directory deletion.'
  },
  {
    name: 'chmod',
    cat: 'perm',
    desc: 'Change file permissions and security modes.',
    example: 'chmod 755 script.py',
    fullDesc: 'Sets read (4), write (2), and execute (1) permissions for user, group, other.'
  },
  {
    name: 'nano',
    cat: 'text',
    desc: 'Interactive full-screen terminal text editor.',
    example: 'nano welcome.txt',
    fullDesc: 'Open file editor with Ctrl+O to save and Ctrl+X to exit.'
  },
  {
    name: 'ps',
    cat: 'system',
    desc: 'Report snapshot of active system processes.',
    example: 'ps aux',
    fullDesc: 'Lists all running processes, PIDs, CPU and memory usage.'
  },
  {
    name: 'kill',
    cat: 'system',
    desc: 'Terminate a process by its Process ID (PID).',
    example: 'kill -9 7392',
    fullDesc: 'Sends termination signal to stop rogue or hung processes.'
  },
  {
    name: 'sudo',
    cat: 'system',
    desc: 'Execute a command with superuser (root) privileges.',
    example: 'sudo su',
    fullDesc: 'Escalates security privileges to root administrative mode.'
  },
  {
    name: 'tree',
    cat: 'nav',
    desc: 'Display directory structure as an ASCII visual tree.',
    example: 'tree /home/guest',
    fullDesc: 'Recursively diagrams all folders and files.'
  },
  {
    name: 'neofetch',
    cat: 'fun',
    desc: 'Display cyber hardware & OS distribution specifications.',
    example: 'neofetch',
    fullDesc: 'Aesthetic terminal system information screen.'
  },
  {
    name: 'matrix',
    cat: 'fun',
    desc: 'Toggle Matrix canvas digital rain background.',
    example: 'matrix',
    fullDesc: 'Retro green digital phosphor rain animation.'
  },
  {
    name: 'cowsay',
    cat: 'fun',
    desc: 'Configurable talking ASCII cyber cow.',
    example: 'cowsay "CyberBash Linux"',
    fullDesc: 'Generates ASCII cow dialogue bubble.'
  },
  {
    name: 'sl',
    cat: 'fun',
    desc: 'Animated Steam Locomotive ASCII train.',
    example: 'sl',
    fullDesc: 'Classic train animation when you accidentally typo "ls".'
  }
];

export class CheatsheetModal {
  constructor(terminalView) {
    this.terminal = terminalView;
    this.modal = document.getElementById('cheatsheetModal');
    this.grid = document.getElementById('csCardsGrid');
    this.searchInput = document.getElementById('csSearchInput');
    this.currentCat = 'all';

    this.initEvents();
    this.render();
  }

  initEvents() {
    const openBtn = document.getElementById('openCheatsheetBtn');
    const closeBtn = document.getElementById('closeCheatsheetModalBtn');

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        sound.playKeyClick();
        this.open();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        sound.playKeyClick();
        this.close();
      });
    }

    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.close();
      });
    }

    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => this.render());
    }

    const tabs = document.querySelectorAll('.cs-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        sound.playKeyClick();
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentCat = tab.dataset.cat;
        this.render();
      });
    });
  }

  open() {
    if (this.modal) this.modal.classList.remove('hidden');
  }

  close() {
    if (this.modal) this.modal.classList.add('hidden');
  }

  render() {
    if (!this.grid) return;
    this.grid.innerHTML = '';

    const query = this.searchInput ? this.searchInput.value.trim().toLowerCase() : '';

    const filtered = CHEATSHEET_DATA.filter(item => {
      const matchCat = this.currentCat === 'all' || item.cat === this.currentCat;
      const matchSearch = !query || item.name.includes(query) || item.desc.toLowerCase().includes(query) || item.example.includes(query);
      return matchCat && matchSearch;
    });

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'cmd-card';
      card.innerHTML = `
        <div class="cmd-card-header">
          <span class="cmd-card-name">${escapeHtml(item.name)}</span>
          <span class="cmd-card-cat">${escapeHtml(item.cat)}</span>
        </div>
        <p class="cmd-card-desc">${escapeHtml(item.desc)}</p>
        <div class="cmd-card-example">
          <code>${escapeHtml(item.example)}</code>
          <button class="cmd-run-btn" title="Run in Terminal"><i class="fa-solid fa-play"></i></button>
        </div>
      `;

      const runBtn = card.querySelector('.cmd-run-btn');
      runBtn.addEventListener('click', () => {
        sound.playKeyClick();
        this.close();
        this.terminal.input.value = item.example;
        this.terminal.handleCommand(item.example);
      });

      this.grid.appendChild(card);
    });
  }
}
