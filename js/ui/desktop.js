/**
 * CYBERBASH // DESKTOP ENVIRONMENT CONTROLLER
 * Controls desktop shortcuts, taskbar dock, top status bar, app launcher, wallpapers, and context menus.
 */

import { sound } from './sound.js';
import { showToast } from '../utils/helpers.js';

export class DesktopEnvironment {
  constructor(windowManager) {
    this.wm = windowManager;
    this.desktopElem = document.getElementById('desktopEnvironment');
    this.dockElem = document.getElementById('desktopDock');
    this.appLauncherMenu = document.getElementById('appLauncherMenu');
    this.contextMenu = document.getElementById('desktopContextMenu');

    this.initShortcuts();
    this.initDock();
    this.initTopBar();
    this.initAppLauncher();
    this.initContextMenu();
    this.initWallpapers();
    this.initSettingsModal();

    // Subscribe to window state changes to sync dock
    this.wm.subscribe(() => this.syncDock());
  }

  initShortcuts() {
    const shortcuts = document.querySelectorAll('.desktop-shortcut');
    shortcuts.forEach(sc => {
      const openApp = () => {
        sound.playKeyClick();
        const appId = sc.dataset.app;
        if (appId === 'notes') {
          this.wm.open('terminal');
          const term = window.cyberbash?.terminal;
          if (term) term.handleCommand('nano welcome.txt');
        } else if (appId) {
          this.wm.open(appId);
        }
      };

      sc.addEventListener('click', (e) => {
        e.stopPropagation();
        shortcuts.forEach(s => s.classList.remove('selected'));
        sc.classList.add('selected');
        openApp();
      });

      sc.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        openApp();
      });
    });

    // Click canvas to clear selection & close popups
    if (this.desktopElem) {
      this.desktopElem.addEventListener('click', (e) => {
        if (!e.target.closest('.desktop-shortcut')) {
          shortcuts.forEach(s => s.classList.remove('selected'));
        }
        if (this.appLauncherMenu) this.appLauncherMenu.classList.add('hidden');
        if (this.contextMenu) this.contextMenu.classList.add('hidden');
      });
    }
  }

  initDock() {
    const dockItems = document.querySelectorAll('.dock-item');
    dockItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        sound.playKeyClick();
        const appId = item.dataset.app;
        if (!appId) return;

        if (appId === 'launcher') {
          this.toggleAppLauncher();
          return;
        }

        const win = this.wm.windows.get(appId);
        if (!win || !win.isOpen) {
          this.wm.open(appId);
        } else if (win.isFocused && !win.isMinimized) {
          this.wm.minimize(appId);
        } else {
          this.wm.open(appId);
        }
      });
    });
  }

  syncDock() {
    const dockItems = document.querySelectorAll('.dock-item');
    dockItems.forEach(item => {
      const appId = item.dataset.app;
      if (!appId || appId === 'launcher') return;

      const win = this.wm.windows.get(appId);
      if (win) {
        item.classList.toggle('running', win.isOpen && !win.isMinimized);
        item.classList.toggle('focused', win.isOpen && win.isFocused && !win.isMinimized);
      }
    });
  }

  initTopBar() {
    const btnLauncher = document.getElementById('btnTopLauncher');
    if (btnLauncher) {
      btnLauncher.addEventListener('click', (e) => {
        e.stopPropagation();
        sound.playKeyClick();
        this.toggleAppLauncher();
      });
    }

    // Top quick action buttons
    const btnTerm = document.getElementById('topQuickTerm');
    const btnFiles = document.getElementById('topQuickFiles');
    const btnQuests = document.getElementById('topQuickQuests');
    const btnCheatsheet = document.getElementById('topQuickCheatsheet');
    const btnSettings = document.getElementById('topQuickSettings');

    if (btnTerm) btnTerm.addEventListener('click', () => this.wm.open('terminal'));
    if (btnFiles) btnFiles.addEventListener('click', () => this.wm.open('files'));
    if (btnQuests) btnQuests.addEventListener('click', () => this.wm.open('quests'));
    if (btnCheatsheet) btnCheatsheet.addEventListener('click', () => this.wm.open('cheatsheet'));
    if (btnSettings) btnSettings.addEventListener('click', () => this.wm.open('settings'));
  }

  toggleAppLauncher() {
    if (!this.appLauncherMenu) return;
    this.appLauncherMenu.classList.toggle('hidden');
    if (!this.appLauncherMenu.classList.contains('hidden')) {
      const input = this.appLauncherMenu.querySelector('input');
      if (input) input.focus();
    }
  }

  initAppLauncher() {
    if (!this.appLauncherMenu) return;

    const searchInput = this.appLauncherMenu.querySelector('.launcher-search-box input');
    const items = this.appLauncherMenu.querySelectorAll('.launcher-item');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        items.forEach(it => {
          const text = it.textContent.toLowerCase();
          it.style.display = text.includes(query) ? 'flex' : 'none';
        });
      });
    }

    items.forEach(it => {
      it.addEventListener('click', () => {
        sound.playKeyClick();
        const app = it.dataset.app;
        if (app) {
          this.wm.open(app);
          this.appLauncherMenu.classList.add('hidden');
        }
      });
    });
  }

  initContextMenu() {
    if (!this.desktopElem || !this.contextMenu) return;

    this.desktopElem.addEventListener('contextmenu', (e) => {
      // Don't intercept context menu inside windows or inputs
      if (e.target.closest('.os-window') || e.target.closest('.desktop-dock') || e.target.closest('.desktop-topbar')) {
        return;
      }

      e.preventDefault();
      sound.playKeyClick();

      this.contextMenu.style.left = `${Math.min(window.innerWidth - 200, e.clientX)}px`;
      this.contextMenu.style.top = `${Math.min(window.innerHeight - 240, e.clientY)}px`;
      this.contextMenu.classList.remove('hidden');
    });

    const ctxItems = this.contextMenu.querySelectorAll('.ctx-item');
    ctxItems.forEach(it => {
      it.addEventListener('click', () => {
        sound.playKeyClick();
        const action = it.dataset.action;
        this.contextMenu.classList.add('hidden');

        if (action === 'terminal') this.wm.open('terminal');
        else if (action === 'files') this.wm.open('files');
        else if (action === 'sysmon') this.wm.open('sysmon');
        else if (action === 'settings') this.wm.open('settings');
        else if (action === 'newfolder') {
          const fm = window.cyberbash?.fileManager;
          if (fm) fm.promptNewFolder();
        }
      });
    });
  }

  initWallpapers() {
    const savedWallpaper = localStorage.getItem('cyberbash_wallpaper') || 'wallpaper-ubuntu';
    this.setWallpaper(savedWallpaper);
  }

  setWallpaper(wpClass) {
    if (!this.desktopElem) return;
    this.desktopElem.className = `desktop-environment ${wpClass}`;
    localStorage.setItem('cyberbash_wallpaper', wpClass);

    // Update settings cards if open
    document.querySelectorAll('.wallpaper-card').forEach(card => {
      card.classList.toggle('active', card.dataset.wallpaper === wpClass);
    });
  }

  initSettingsModal() {
    const cards = document.querySelectorAll('.wallpaper-card');
    cards.forEach(c => {
      c.addEventListener('click', () => {
        sound.playKeyClick();
        this.setWallpaper(c.dataset.wallpaper);
        showToast('Wallpaper Updated', `Applied desktop wallpaper`, 'success');
      });
    });
  }
}
