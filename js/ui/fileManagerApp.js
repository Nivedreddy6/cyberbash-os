/**
 * CYBERBASH // NAUTILUS GRAPHICAL FILE MANAGER APP
 * Provides graphical desktop file browsing, folder navigation, file inspection, and file creation.
 */

import { sound } from './sound.js';
import { showToast } from '../utils/helpers.js';

export class FileManagerApp {
  constructor(vfs, windowManager, nanoEditor) {
    this.vfs = vfs;
    this.wm = windowManager;
    this.nano = nanoEditor;
    this.currentPath = '/home/guest';
    this.history = ['/home/guest'];
    this.historyIndex = 0;
    this.selectedItem = null;

    this.container = document.getElementById('fileManagerApp');
    if (this.container) {
      this.init();
    }
  }

  init() {
    this.breadcrumbsElem = this.container.querySelector('.nautilus-breadcrumbs');
    this.viewPane = this.container.querySelector('.nautilus-view-pane');
    this.statusCount = this.container.querySelector('#nautilusItemCount');
    this.statusSelected = this.container.querySelector('#nautilusSelectedInfo');
    this.btnBack = this.container.querySelector('#nautilusBtnBack');
    this.btnForward = this.container.querySelector('#nautilusBtnForward');
    this.btnUp = this.container.querySelector('#nautilusBtnUp');
    this.btnRefresh = this.container.querySelector('#nautilusBtnRefresh');
    this.btnNewFolder = document.getElementById('nautilusBtnNewFolder');
    this.btnNewFile = document.getElementById('nautilusBtnNewFile');

    // Navigation buttons
    if (this.btnBack) {
      this.btnBack.addEventListener('click', () => this.navigateBack());
    }
    if (this.btnForward) {
      this.btnForward.addEventListener('click', () => this.navigateForward());
    }
    if (this.btnUp) {
      this.btnUp.addEventListener('click', () => this.navigateUp());
    }
    if (this.btnRefresh) {
      this.btnRefresh.addEventListener('click', () => {
        sound.playKeyClick();
        this.render();
      });
    }
    if (this.btnNewFolder) {
      this.btnNewFolder.addEventListener('click', () => this.promptNewFolder());
    }
    if (this.btnNewFile) {
      this.btnNewFile.addEventListener('click', () => this.promptNewFile());
    }

    // Sidebar quick links
    const sidebarLinks = this.container.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
      link.addEventListener('click', () => {
        const targetPath = link.dataset.path;
        if (targetPath) {
          this.navigateTo(targetPath);
        }
      });
    });

    this.render();
  }

  navigateTo(path) {
    sound.playKeyClick();
    const resolved = this.vfs.resolvePath(path, this.currentPath);
    const node = this.vfs.getNode(resolved);

    if (!node || node.type !== 'dir') {
      showToast('Error', `Cannot open ${path}: Not a directory`, 'error');
      return;
    }

    if (this.history[this.historyIndex] !== resolved) {
      this.history = this.history.slice(0, this.historyIndex + 1);
      this.history.push(resolved);
      this.historyIndex++;
    }

    this.currentPath = resolved;
    this.selectedItem = null;
    this.render();
  }

  navigateBack() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.currentPath = this.history[this.historyIndex];
      this.selectedItem = null;
      sound.playKeyClick();
      this.render();
    }
  }

  navigateForward() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.currentPath = this.history[this.historyIndex];
      this.selectedItem = null;
      sound.playKeyClick();
      this.render();
    }
  }

  navigateUp() {
    if (this.currentPath === '/') return;
    const parts = this.currentPath.split('/').filter(Boolean);
    parts.pop();
    const parentPath = '/' + parts.join('/');
    this.navigateTo(parentPath || '/');
  }

  render() {
    this.renderBreadcrumbs();
    this.renderFiles();
    this.updateSidebarHighlight();
  }

  renderBreadcrumbs() {
    if (!this.breadcrumbsElem) return;
    this.breadcrumbsElem.innerHTML = '';

    const rootItem = document.createElement('span');
    rootItem.className = `breadcrumb-item ${this.currentPath === '/' ? 'active' : ''}`;
    rootItem.innerHTML = '<i class="fa-solid fa-hard-drive"></i> root';
    rootItem.addEventListener('click', () => this.navigateTo('/'));
    this.breadcrumbsElem.appendChild(rootItem);

    if (this.currentPath !== '/') {
      const parts = this.currentPath.split('/').filter(Boolean);
      let cumulative = '';

      parts.forEach((part, idx) => {
        cumulative += '/' + part;
        const currentCumulative = cumulative;

        const sep = document.createElement('span');
        sep.className = 'breadcrumb-separator';
        sep.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
        this.breadcrumbsElem.appendChild(sep);

        const item = document.createElement('span');
        item.className = `breadcrumb-item ${idx === parts.length - 1 ? 'active' : ''}`;
        item.textContent = part;
        item.addEventListener('click', () => this.navigateTo(currentCumulative));
        this.breadcrumbsElem.appendChild(item);
      });
    }
  }

  renderFiles() {
    if (!this.viewPane) return;
    this.viewPane.innerHTML = '';

    const node = this.vfs.getNode(this.currentPath);
    if (!node || node.type !== 'dir') return;

    const children = Object.keys(node.children || {}).sort((a, b) => {
      const nodeA = node.children[a];
      const nodeB = node.children[b];
      if (nodeA.type === nodeB.type) return a.localeCompare(b);
      return nodeA.type === 'dir' ? -1 : 1;
    });

    if (this.statusCount) {
      this.statusCount.textContent = `${children.length} items`;
    }

    if (children.length === 0) {
      this.viewPane.innerHTML = `
        <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-dim); padding: 40px;">
          <i class="fa-regular fa-folder-open" style="font-size: 40px; margin-bottom: 10px;"></i>
          <span>Folder is empty</span>
        </div>
      `;
      return;
    }

    children.forEach(name => {
      const child = node.children[name];
      const card = document.createElement('div');
      card.className = `vfs-file-card ${this.selectedItem === name ? 'selected' : ''}`;

      let iconClass = 'fa-regular fa-file text';
      if (child.type === 'dir') {
        iconClass = 'fa-solid fa-folder folder';
      } else if (name.endsWith('.sh') || name.endsWith('.py') || name.endsWith('.js')) {
        iconClass = 'fa-solid fa-file-code executable';
      } else if (name.endsWith('.conf') || name.endsWith('.json') || name.startsWith('.')) {
        iconClass = 'fa-solid fa-gear config';
      }

      card.innerHTML = `
        <i class="${iconClass} vfs-file-icon"></i>
        <span class="vfs-file-name" title="${name}">${name}</span>
      `;

      const openItem = () => {
        if (child.type === 'dir') {
          const newPath = this.currentPath === '/' ? `/${name}` : `${this.currentPath}/${name}`;
          this.navigateTo(newPath);
        } else {
          // Open file in Nano Editor
          const filePath = this.currentPath === '/' ? `/${name}` : `${this.currentPath}/${name}`;
          if (this.nano) {
            this.wm.open('terminal');
            const term = window.cyberbash?.terminal;
            if (term) {
              term.handleCommand(`nano ${filePath}`);
            }
          }
        }
      };

      card.addEventListener('click', (e) => {
        e.stopPropagation();
        sound.playKeyClick();
        const wasSelected = (this.selectedItem === name);
        this.selectedItem = name;
        this.container.querySelectorAll('.vfs-file-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.updateSelectedStatus(name, child);

        // If folder is clicked, or already selected file is clicked again, open it
        if (child.type === 'dir') {
          openItem();
        } else if (wasSelected) {
          openItem();
        }
      });

      card.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        sound.playKeyClick();
        openItem();
      });

      this.viewPane.appendChild(card);
    });
  }

  updateSelectedStatus(name, child) {
    if (!this.statusSelected) return;
    const size = child.type === 'dir' ? 'folder' : `${(child.content || '').length} bytes`;
    this.statusSelected.textContent = `Selected: ${name} (${size}) | Perms: ${child.permissions || '-rw-r--r--'}`;
  }

  updateSidebarHighlight() {
    const sidebarLinks = this.container.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.path === this.currentPath);
    });
  }

  promptNewFolder() {
    const name = prompt('Enter new folder name:');
    if (!name || !name.trim()) return;

    const fullPath = this.currentPath === '/' ? `/${name.trim()}` : `${this.currentPath}/${name.trim()}`;
    const res = this.vfs.createDirectory(fullPath);
    if (res.success) {
      showToast('Created', `Created folder "${name}"`, 'success');
      this.render();
    } else {
      showToast('Error', res.error, 'error');
    }
  }

  promptNewFile() {
    const name = prompt('Enter new file name:');
    if (!name || !name.trim()) return;

    const fullPath = this.currentPath === '/' ? `/${name.trim()}` : `${this.currentPath}/${name.trim()}`;
    const res = this.vfs.createFile(fullPath, '# New file\n');
    if (res.success) {
      showToast('Created', `Created file "${name}"`, 'success');
      this.render();
    } else {
      showToast('Error', res.error, 'error');
    }
  }
}
