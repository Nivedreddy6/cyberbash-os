/**
 * CYBERBASH // FULL-SCREEN TERMINAL NANO EDITOR
 */

import { sound } from '../ui/sound.js';
import { showToast } from '../utils/helpers.js';

export class NanoEditor {
  constructor(vfs) {
    this.vfs = vfs;
    this.isOpen = false;
    this.currentPath = '';
    this.originalContent = '';
    this.onCloseCallback = null;

    this.container = document.getElementById('nanoEditorContainer');
    this.filenameLabel = document.getElementById('nanoFilename');
    this.modifiedLabel = document.getElementById('nanoModified');
    this.textarea = document.getElementById('nanoTextarea');
    this.statusMsg = document.getElementById('nanoStatusMsg');

    this.initEvents();
  }

  initEvents() {
    if (!this.textarea) return;

    this.textarea.addEventListener('input', () => {
      sound.playKeyClick();
      const isModified = this.textarea.value !== this.originalContent;
      if (this.modifiedLabel) {
        this.modifiedLabel.textContent = isModified ? '[Modified]' : '';
      }
    });

    this.textarea.addEventListener('keydown', (e) => {
      // Ctrl+O: Save File
      if (e.ctrlKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        this.saveFile();
      }

      // Ctrl+X: Exit Nano
      if (e.ctrlKey && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        this.close();
      }

      // Tab handling in textarea
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        this.textarea.value = this.textarea.value.substring(0, start) + '  ' + this.textarea.value.substring(end);
        this.textarea.selectionStart = this.textarea.selectionEnd = start + 2;
      }
    });
  }

  open(filePath, onClose) {
    this.currentPath = filePath;
    this.onCloseCallback = onClose;
    this.isOpen = true;

    let content = '';
    try {
      content = this.vfs.readFile(filePath);
    } catch (e) {
      content = ''; // New file
    }

    this.originalContent = content;
    this.filenameLabel.textContent = this.currentPath;
    this.modifiedLabel.textContent = '';
    this.textarea.value = content;
    this.statusMsg.textContent = 'Editing file. Ctrl+O to save, Ctrl+X to exit.';

    this.container.classList.remove('hidden');
    this.textarea.focus();
    sound.playSuccess();
  }

  saveFile() {
    try {
      this.vfs.writeFile(this.currentPath, this.textarea.value);
      this.originalContent = this.textarea.value;
      if (this.modifiedLabel) this.modifiedLabel.textContent = '';
      this.statusMsg.textContent = `[ Wrote ${this.textarea.value.split('\n').length} lines to ${this.currentPath} ]`;
      sound.playSuccess();
      showToast('File Saved', `Successfully updated ${this.currentPath}`, 'success');
    } catch (err) {
      this.statusMsg.textContent = `[ Error writing ${this.currentPath}: ${err.message} ]`;
      sound.playError();
    }
  }

  close() {
    this.isOpen = false;
    this.container.classList.add('hidden');
    sound.playKeyClick();
    if (this.onCloseCallback) {
      this.onCloseCallback();
    }
  }
}
