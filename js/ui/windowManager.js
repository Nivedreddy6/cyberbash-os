/**
 * CYBERBASH // WINDOW MANAGEMENT SYSTEM
 * Handles dragging, resizing, maximizing, minimizing, z-index elevation, and dock synchronization.
 */

import { sound } from './sound.js';

export class WindowManager {
  constructor() {
    this.windows = new Map();
    this.activeWindowId = null;
    this.baseZIndex = 300;
    this.topZIndex = 300;
    this.listeners = [];

    this.initGlobalEvents();
  }

  registerWindow(id, { element, title, icon, defaultBounds = { x: 100, y: 50, width: 720, height: 480 }, onClose, onFocus }) {
    if (!element) return;

    const winData = {
      id,
      element,
      title: title || id,
      icon: icon || 'fa-solid fa-window-maximize',
      bounds: { ...defaultBounds },
      prevBounds: null,
      isMinimized: false,
      isMaximized: false,
      isFocused: false,
      isOpen: false,
      onClose,
      onFocus
    };

    // Register window data in map first
    this.windows.set(id, winData);

    // Apply default positioning
    this.applyBounds(element, winData.bounds);

    // Setup window controls
    const titlebar = element.querySelector('.window-titlebar');
    const btnClose = element.querySelector('.ctrl-btn.btn-close');
    const btnMin = element.querySelector('.ctrl-btn.btn-min');
    const btnMax = element.querySelector('.ctrl-btn.btn-max');

    if (btnClose) {
      btnClose.addEventListener('click', (e) => {
        e.stopPropagation();
        sound.playKeyClick();
        this.close(id);
      });
    }

    if (btnMin) {
      btnMin.addEventListener('click', (e) => {
        e.stopPropagation();
        sound.playKeyClick();
        this.minimize(id);
      });
    }

    if (btnMax) {
      btnMax.addEventListener('click', (e) => {
        e.stopPropagation();
        sound.playKeyClick();
        this.toggleMaximize(id);
      });
    }

    // Double click titlebar to toggle maximize
    if (titlebar) {
      titlebar.addEventListener('dblclick', (e) => {
        if (e.target.closest('.ctrl-btn')) return;
        this.toggleMaximize(id);
      });

      this.initDrag(id, titlebar);
    }

    // Setup Resize handles
    this.initResize(id);

    // Click anywhere on window to focus
    element.addEventListener('mousedown', () => {
      this.focus(id);
    });

    return winData;
  }

  applyBounds(element, bounds) {
    element.style.left = `${bounds.x}px`;
    element.style.top = `${bounds.y}px`;
    element.style.width = `${bounds.width}px`;
    element.style.height = `${bounds.height}px`;
  }

  open(id) {
    const win = this.windows.get(id);
    if (!win) return;

    win.isOpen = true;
    win.isMinimized = false;
    win.element.classList.remove('is-minimized', 'hidden');
    this.focus(id);
    this.notify();
  }

  close(id) {
    const win = this.windows.get(id);
    if (!win) return;

    win.isOpen = false;
    win.element.classList.add('hidden');
    if (win.onClose) win.onClose();

    if (this.activeWindowId === id) {
      this.activeWindowId = null;
      // Focus next open window
      const openWins = Array.from(this.windows.values()).filter(w => w.isOpen && !w.isMinimized);
      if (openWins.length > 0) {
        this.focus(openWins[openWins.length - 1].id);
      } else {
        this.updateTopBar(null);
      }
    }

    this.notify();
  }

  minimize(id) {
    const win = this.windows.get(id);
    if (!win) return;

    win.isMinimized = true;
    win.element.classList.add('is-minimized');

    if (this.activeWindowId === id) {
      this.activeWindowId = null;
      const openWins = Array.from(this.windows.values()).filter(w => w.isOpen && !w.isMinimized);
      if (openWins.length > 0) {
        this.focus(openWins[openWins.length - 1].id);
      } else {
        this.updateTopBar(null);
      }
    }

    this.notify();
  }

  toggleMaximize(id) {
    const win = this.windows.get(id);
    if (!win) return;

    if (win.isMaximized) {
      // Restore
      win.isMaximized = false;
      win.element.classList.remove('is-maximized');
      if (win.prevBounds) {
        win.bounds = { ...win.prevBounds };
        this.applyBounds(win.element, win.bounds);
      }
    } else {
      // Maximize
      win.prevBounds = {
        x: parseInt(win.element.style.left) || win.bounds.x,
        y: parseInt(win.element.style.top) || win.bounds.y,
        width: parseInt(win.element.style.width) || win.bounds.width,
        height: parseInt(win.element.style.height) || win.bounds.height
      };
      win.isMaximized = true;
      win.element.classList.add('is-maximized');
    }
  }

  focus(id) {
    const win = this.windows.get(id);
    if (!win) return;

    this.topZIndex += 2;
    win.element.style.zIndex = this.topZIndex;

    this.windows.forEach(w => {
      w.isFocused = (w.id === id);
      w.element.classList.toggle('is-focused', w.id === id);
    });

    this.activeWindowId = id;
    this.updateTopBar(win);
    if (win.onFocus) win.onFocus();
    this.notify();
  }

  updateTopBar(win) {
    const appNameElem = document.getElementById('topbarActiveAppName');
    if (!appNameElem) return;

    if (win) {
      appNameElem.innerHTML = `<i class="${win.icon}"></i> ${win.title}`;
    } else {
      appNameElem.innerHTML = `<i class="fa-brands fa-linux"></i> CyberBash OS`;
    }
  }

  initDrag(id, handle) {
    const win = this.windows.get(id);
    let startX, startY, initX, initY;
    let isDragging = false;

    const onMouseDown = (e) => {
      if (e.target.closest('.ctrl-btn') || e.target.closest('.win-action-btn')) return;
      if (win.isMaximized) return;

      this.focus(id);
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      initX = parseInt(win.element.style.left) || win.bounds.x;
      initY = parseInt(win.element.style.top) || win.bounds.y;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      e.preventDefault();
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newX = Math.max(10, Math.min(window.innerWidth - 100, initX + dx));
      let newY = Math.max(34, Math.min(window.innerHeight - 50, initY + dy)); // 34px topbar

      win.bounds.x = newX;
      win.bounds.y = newY;
      win.element.style.left = `${newX}px`;
      win.element.style.top = `${newY}px`;
    };

    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    handle.addEventListener('mousedown', onMouseDown);
  }

  initResize(id) {
    const win = this.windows.get(id);
    const directions = ['top', 'bottom', 'left', 'right', 'nw', 'ne', 'sw', 'se'];

    directions.forEach(dir => {
      const handle = document.createElement('div');
      handle.className = `resize-handle handle-${dir}`;
      win.element.appendChild(handle);

      let startX, startY, startW, startH, startL, startT;

      handle.addEventListener('mousedown', (e) => {
        if (win.isMaximized) return;
        e.stopPropagation();
        e.preventDefault();
        this.focus(id);

        startX = e.clientX;
        startY = e.clientY;
        startW = win.element.offsetWidth;
        startH = win.element.offsetHeight;
        startL = win.element.offsetLeft;
        startT = win.element.offsetTop;

        const onMouseMove = (ev) => {
          const dx = ev.clientX - startX;
          const dy = ev.clientY - startY;

          let newW = startW;
          let newH = startH;
          let newL = startL;
          let newT = startT;

          if (dir.includes('right')) newW = Math.max(320, startW + dx);
          if (dir.includes('bottom')) newH = Math.max(220, startH + dy);
          if (dir.includes('left')) {
            const possibleW = startW - dx;
            if (possibleW >= 320) {
              newW = possibleW;
              newL = startL + dx;
            }
          }
          if (dir.includes('top')) {
            const possibleH = startH - dy;
            if (possibleH >= 220 && startT + dy >= 34) {
              newH = possibleH;
              newT = startT + dy;
            }
          }

          win.bounds = { x: newL, y: newT, width: newW, height: newH };
          this.applyBounds(win.element, win.bounds);
        };

        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
    });
  }

  initGlobalEvents() {
    window.addEventListener('resize', () => {
      this.windows.forEach(win => {
        if (win.isMaximized) return;
        // Keep inside bounds if screen shrinks
        const maxL = Math.max(10, window.innerWidth - win.element.offsetWidth - 20);
        const maxT = Math.max(34, window.innerHeight - win.element.offsetHeight - 20);
        if (win.bounds.x > maxL) win.bounds.x = maxL;
        if (win.bounds.y > maxT) win.bounds.y = maxT;
        win.element.style.left = `${win.bounds.x}px`;
        win.element.style.top = `${win.bounds.y}px`;
      });
    });
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.windows));
  }
}
