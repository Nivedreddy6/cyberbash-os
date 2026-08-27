/**
 * CYBERBASH // AUTOCOMPLETE & HISTORY CONTROLLER
 */

export class AutocompleteController {
  constructor(vfs, registry) {
    this.vfs = vfs;
    this.registry = registry;
    this.history = [];
    this.historyIndex = -1;
    this.loadHistory();
  }

  loadHistory() {
    try {
      const saved = localStorage.getItem('cyberbash_history');
      if (saved) {
        this.history = JSON.parse(saved);
      }
    } catch (e) {}
  }

  saveHistory() {
    try {
      localStorage.setItem('cyberbash_history', JSON.stringify(this.history.slice(-100)));
    } catch (e) {}
  }

  addHistory(cmd) {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    if (this.history[this.history.length - 1] !== trimmed) {
      this.history.push(trimmed);
      this.saveHistory();
    }
    this.historyIndex = this.history.length;
  }

  getPrevious() {
    if (this.history.length === 0) return null;
    if (this.historyIndex > 0) {
      this.historyIndex--;
    }
    return this.history[this.historyIndex] || '';
  }

  getNext() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      return this.history[this.historyIndex];
    }
    this.historyIndex = this.history.length;
    return '';
  }

  autocomplete(currentInput) {
    if (!currentInput) return { completed: currentInput, matches: [] };

    const parts = currentInput.split(' ');
    
    // Command autocompletion (first token)
    if (parts.length === 1) {
      const prefix = parts[0];
      const available = Array.from(this.registry.commands.keys());
      const matches = available.filter(cmd => cmd.startsWith(prefix));

      if (matches.length === 1) {
        return { completed: matches[0] + ' ', matches };
      }
      return { completed: currentInput, matches };
    }

    // Path / File autocompletion for subsequent tokens
    const lastToken = parts[parts.length - 1];
    let searchDir = this.vfs.cwd;
    let filePrefix = lastToken;

    if (lastToken.includes('/')) {
      const lastSlashIdx = lastToken.lastIndexOf('/');
      const dirPart = lastToken.slice(0, lastSlashIdx) || '/';
      filePrefix = lastToken.slice(lastSlashIdx + 1);
      try {
        searchDir = this.vfs.normalizePath(dirPart);
      } catch (e) {
        return { completed: currentInput, matches: [] };
      }
    }

    try {
      const entries = this.vfs.listDir(searchDir);
      const matches = entries
        .map(e => e.name + (e.type === 'dir' ? '/' : ''))
        .filter(name => name.startsWith(filePrefix));

      if (matches.length === 1) {
        const prefixBeforeLast = lastToken.includes('/') ? lastToken.slice(0, lastToken.lastIndexOf('/') + 1) : '';
        parts[parts.length - 1] = prefixBeforeLast + matches[0];
        return { completed: parts.join(' '), matches };
      }

      return { completed: currentInput, matches };
    } catch (e) {
      return { completed: currentInput, matches: [] };
    }
  }
}
