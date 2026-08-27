/**
 * CYBERBASH // VISUAL FILE SYSTEM TREE & INSPECTOR CONTROLLER
 */

import { formatBytes, formatDate, escapeHtml } from '../utils/helpers.js';
import { sound } from './sound.js';

export class ExplorerView {
  constructor(vfs, shell, terminalView) {
    this.vfs = vfs;
    this.shell = shell;
    this.terminal = terminalView;
    this.expandedDirs = new Set(['/', '/home', '/home/guest', '/home/guest/projects', '/var', '/var/log', '/etc']);
    
    this.treeContainer = document.getElementById('vfsTreeContainer');
    this.searchInput = document.getElementById('vfsSearchInput');
    this.inspectFilename = document.getElementById('inspectFilename');
    this.inspectSize = document.getElementById('inspectSize');
    this.inspectPath = document.getElementById('inspectPath');
    this.inspectPerms = document.getElementById('inspectPerms');
    this.inspectModified = document.getElementById('inspectModified');
    this.inspectContent = document.getElementById('inspectContent');

    this.vfs.subscribe(() => this.render());
    this.initEvents();
    this.render();
  }

  initEvents() {
    const refreshBtn = document.getElementById('refreshTreeBtn');
    const collapseBtn = document.getElementById('collapseAllBtn');
    const closeBtn = document.getElementById('closeExplorerBtn');
    const toggleBtn = document.getElementById('toggleExplorerBtn');
    const pane = document.getElementById('paneExplorer');

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        sound.playKeyClick();
        this.render();
      });
    }

    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => {
        sound.playKeyClick();
        this.expandedDirs.clear();
        this.expandedDirs.add('/');
        this.render();
      });
    }

    if (closeBtn && pane && toggleBtn) {
      closeBtn.addEventListener('click', () => {
        pane.classList.add('collapsed');
        toggleBtn.classList.remove('active');
      });
    }

    if (toggleBtn && pane) {
      toggleBtn.addEventListener('click', () => {
        sound.playKeyClick();
        pane.classList.toggle('collapsed');
        toggleBtn.classList.toggle('active', !pane.classList.contains('collapsed'));
      });
    }

    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => {
        this.render();
      });
    }
  }

  render() {
    if (!this.treeContainer) return;
    this.treeContainer.innerHTML = '';

    const filterQuery = this.searchInput ? this.searchInput.value.trim().toLowerCase() : '';
    this.renderNode(this.vfs.root, '/', 0, this.treeContainer, filterQuery);
  }

  renderNode(node, currentPath, depth, container, filter) {
    if (!node) return;

    const isRoot = currentPath === '/';
    const displayName = isRoot ? '/' : node.name;
    const isDir = node.type === 'dir';
    const isExpanded = this.expandedDirs.has(currentPath);
    const isCwd = this.vfs.cwd === currentPath;

    // Filter check
    if (filter && !displayName.toLowerCase().includes(filter) && !currentPath.toLowerCase().includes(filter)) {
      if (!isDir) return;
    }

    const nodeWrapper = document.createElement('div');
    nodeWrapper.className = 'tree-node';

    const row = document.createElement('div');
    row.className = `tree-row ${isCwd ? 'active-cwd' : ''}`;
    row.style.paddingLeft = `${depth * 14 + 6}px`;

    // Expander Icon for directories
    const expander = document.createElement('span');
    expander.className = `tree-expander ${isExpanded ? 'expanded' : ''}`;
    expander.innerHTML = isDir ? '<i class="fa-solid fa-chevron-right"></i>' : '';

    if (isDir) {
      expander.addEventListener('click', (e) => {
        e.stopPropagation();
        sound.playKeyClick();
        if (this.expandedDirs.has(currentPath)) {
          this.expandedDirs.delete(currentPath);
        } else {
          this.expandedDirs.add(currentPath);
        }
        this.render();
      });
    }

    // Type Icon
    const icon = document.createElement('i');
    if (isDir) {
      icon.className = `fa-solid ${isExpanded ? 'fa-folder-open' : 'fa-folder'} tree-icon folder-icon`;
    } else if (node.isExecutable) {
      icon.className = 'fa-solid fa-bolt tree-icon exec-icon';
    } else if (node.name.endsWith('.txt') || node.name.endsWith('.md')) {
      icon.className = 'fa-solid fa-file-lines tree-icon file-icon';
    } else if (node.name.endsWith('.py') || node.name.endsWith('.sh') || node.name.endsWith('.js')) {
      icon.className = 'fa-solid fa-file-code tree-icon file-icon';
    } else if (node.name.includes('secret') || node.name.includes('key')) {
      icon.className = 'fa-solid fa-key tree-icon secret-icon';
    } else if (node.name.includes('log')) {
      icon.className = 'fa-solid fa-clock-rotate-left tree-icon log-icon';
    } else {
      icon.className = 'fa-solid fa-file tree-icon file-icon';
    }

    // Name & Size
    const nameSpan = document.createElement('span');
    nameSpan.className = 'tree-name';
    nameSpan.textContent = displayName;

    const badge = document.createElement('span');
    badge.className = 'tree-badge';
    badge.textContent = isDir ? '' : formatBytes(node.size || (node.content ? node.content.length : 0));

    row.appendChild(expander);
    row.appendChild(icon);
    row.appendChild(nameSpan);
    row.appendChild(badge);

    // Click on row
    row.addEventListener('click', () => {
      sound.playKeyClick();
      if (isDir) {
        this.vfs.changeDirectory(currentPath);
        this.terminal.updatePrompt();
      } else {
        this.inspectFile(node, currentPath);
      }
    });

    nodeWrapper.appendChild(row);

    // Children rendering for directories
    if (isDir && isExpanded && node.children) {
      const childrenContainer = document.createElement('div');
      childrenContainer.className = 'tree-children';

      const entries = Object.entries(node.children).sort((a, b) => {
        if (a[1].type !== b[1].type) return a[1].type === 'dir' ? -1 : 1;
        return a[0].localeCompare(b[0]);
      });

      for (const [name, child] of entries) {
        const childPath = isRoot ? `/${name}` : `${currentPath}/${name}`;
        this.renderNode(child, childPath, depth + 1, childrenContainer, filter);
      }

      nodeWrapper.appendChild(childrenContainer);
    }

    container.appendChild(nodeWrapper);
  }

  inspectFile(node, path) {
    if (this.inspectFilename) this.inspectFilename.innerHTML = `<i class="fa-solid fa-file-lines"></i> ${escapeHtml(node.name)}`;
    if (this.inspectSize) this.inspectSize.textContent = formatBytes(node.content ? node.content.length : 0);
    if (this.inspectPath) this.inspectPath.textContent = path;
    if (this.inspectPerms) this.inspectPerms.textContent = node.permissions || 'rw-r--r--';
    if (this.inspectModified) this.inspectModified.textContent = formatDate(node.modified);
    if (this.inspectContent) this.inspectContent.textContent = node.content || '(Empty file)';
  }
}
