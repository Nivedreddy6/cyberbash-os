/**
 * CYBERBASH // VIRTUAL UNIX FILE SYSTEM (VFS)
 */

import { defaultFileSystemData } from './defaultFS.js';

const STORAGE_KEY = 'cyberbash_vfs_data_v3';

export class VirtualFileSystem {
  constructor() {
    this.root = null;
    this.cwd = '/home/guest';
    this.listeners = [];
    this.init();
  }

  normalizeNodeTypes(node) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'directory') node.type = 'dir';
    if (node.type === 'dir') {
      if (!node.children || typeof node.children !== 'object') {
        node.children = {};
      }
      Object.values(node.children).forEach(child => this.normalizeNodeTypes(child));
    }
  }

  init() {
    try {
      // Clear older legacy keys
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('cyberbash_vfs_data_v1');
        localStorage.removeItem('cyberbash_vfs_data_v2');
      }

      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (saved) {
        try {
          this.root = JSON.parse(saved);
          this.normalizeNodeTypes(this.root);
        } catch (e) {
          this.root = JSON.parse(JSON.stringify(defaultFileSystemData));
        }
      } else {
        this.root = JSON.parse(JSON.stringify(defaultFileSystemData));
      }

      // Verify essential system directories exist
      if (!this.getNode('/home/guest') || !this.getNode('/bin') || !this.getNode('/etc')) {
        this.root = JSON.parse(JSON.stringify(defaultFileSystemData));
      }
    } catch (e) {
      this.root = JSON.parse(JSON.stringify(defaultFileSystemData));
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.root));
      this.notify();
    } catch (e) {
      console.warn('VFS Save warning:', e);
    }
  }

  reset() {
    this.root = JSON.parse(JSON.stringify(defaultFileSystemData));
    this.cwd = '/home/guest';
    this.save();
    return 'Filesystem reset to factory configuration.';
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }

  resolvePath(pathStr, baseDir = this.cwd) {
    if (!pathStr) return baseDir;
    
    // Replace ~ with /home/guest
    let p = pathStr.trim();
    if (p.startsWith('~')) {
      p = '/home/guest' + p.slice(1);
    } else if (!p.startsWith('/')) {
      p = baseDir === '/' ? `/${p}` : `${baseDir}/${p}`;
    }

    const segments = p.split('/').filter(Boolean);
    const resolved = [];

    for (const seg of segments) {
      if (seg === '.') continue;
      if (seg === '..') {
        if (resolved.length > 0) resolved.pop();
      } else {
        resolved.push(seg);
      }
    }

    return '/' + resolved.join('/');
  }

  normalizePath(pathStr) {
    return this.resolvePath(pathStr, this.cwd);
  }

  getNode(pathStr) {
    const norm = this.normalizePath(pathStr);
    if (norm === '/') return this.root;

    const parts = norm.split('/').filter(Boolean);
    let curr = this.root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!curr || curr.type !== 'dir' || !curr.children) {
        return null;
      }
      curr = curr.children[part];
      if (!curr) return null;
    }
    return curr;
  }

  getParentNode(pathStr) {
    const norm = this.normalizePath(pathStr);
    if (norm === '/') return { parent: null, name: '' };
    const parts = norm.split('/').filter(Boolean);
    const name = parts.pop();
    const parentPath = '/' + parts.join('/');
    const parent = this.getNode(parentPath);
    return { parent, name, parentPath };
  }

  listDir(pathStr = this.cwd) {
    const node = this.getNode(pathStr);
    if (!node) {
      throw new Error(`cannot access '${pathStr}': No such file or directory`);
    }
    if (node.type !== 'dir') {
      throw new Error(`'${pathStr}': Not a directory`);
    }

    const entries = [];
    for (const [name, child] of Object.entries(node.children || {})) {
      entries.push({
        name,
        type: child.type,
        size: child.size || (child.type === 'dir' ? 4096 : (child.content ? child.content.length : 0)),
        permissions: child.permissions || (child.type === 'dir' ? 'rwxr-xr-x' : 'rw-r--r--'),
        owner: child.owner || 'guest',
        group: child.group || 'guest',
        modified: child.modified || Date.now(),
        isExecutable: child.isExecutable || false,
        content: child.content || ''
      });
    }

    return entries.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }

  changeDirectory(pathStr) {
    const norm = this.normalizePath(pathStr);
    const node = this.getNode(norm);
    if (!node) {
      throw new Error(`cd: ${pathStr}: No such file or directory`);
    }
    if (node.type !== 'dir') {
      throw new Error(`cd: ${pathStr}: Not a directory`);
    }
    this.cwd = norm;
    this.notify();
    return this.cwd;
  }

  readFile(pathStr) {
    const node = this.getNode(pathStr);
    if (!node) {
      throw new Error(`cat: ${pathStr}: No such file or directory`);
    }
    if (node.type === 'dir') {
      throw new Error(`cat: ${pathStr}: Is a directory`);
    }
    return node.content || '';
  }

  writeFile(pathStr, content, append = false, owner = 'guest') {
    const norm = this.normalizePath(pathStr);
    const { parent, name } = this.getParentNode(norm);

    if (!parent || parent.type !== 'dir') {
      throw new Error(`cannot create file '${pathStr}': No such directory`);
    }

    let existing = parent.children[name];
    if (existing && existing.type === 'dir') {
      throw new Error(`cannot overwrite directory '${pathStr}' with file`);
    }

    let finalContent = content;
    if (existing && append) {
      finalContent = (existing.content || '') + content;
    }

    parent.children[name] = {
      type: 'file',
      name: name,
      permissions: existing ? existing.permissions : 'rw-r--r--',
      owner: existing ? existing.owner : owner,
      group: existing ? existing.group : owner,
      modified: Date.now(),
      content: finalContent,
      size: finalContent.length
    };

    this.save();
    return parent.children[name];
  }

  createDirectory(pathStr, recursive = false, owner = 'guest') {
    const norm = this.normalizePath(pathStr);
    if (norm === '/') return;

    if (recursive) {
      const parts = norm.split('/').filter(Boolean);
      let curr = this.root;
      for (const part of parts) {
        if (!curr.children[part]) {
          curr.children[part] = {
            type: 'dir',
            name: part,
            permissions: 'rwxr-xr-x',
            owner: owner,
            group: owner,
            modified: Date.now(),
            children: {}
          };
        } else if (curr.children[part].type !== 'dir') {
          throw new Error(`mkdir: cannot create directory '${pathStr}': File exists`);
        }
        curr = curr.children[part];
      }
      this.save();
      return;
    }

    const { parent, name } = this.getParentNode(norm);
    if (!parent || parent.type !== 'dir') {
      throw new Error(`mkdir: cannot create directory '${pathStr}': No such file or directory`);
    }

    if (parent.children[name]) {
      throw new Error(`mkdir: cannot create directory '${pathStr}': File exists`);
    }

    parent.children[name] = {
      type: 'dir',
      name: name,
      permissions: 'rwxr-xr-x',
      owner: owner,
      group: owner,
      modified: Date.now(),
      children: {}
    };

    this.save();
  }

  deleteNode(pathStr, recursive = false) {
    const norm = this.normalizePath(pathStr);
    if (norm === '/') {
      throw new Error("rm: it is dangerous to operate recursively on '/'");
    }

    const { parent, name } = this.getParentNode(norm);
    if (!parent || !parent.children[name]) {
      throw new Error(`rm: cannot remove '${pathStr}': No such file or directory`);
    }

    const target = parent.children[name];
    if (target.type === 'dir' && !recursive) {
      throw new Error(`rm: cannot remove '${pathStr}': Is a directory (use -r)`);
    }

    delete parent.children[name];
    this.save();
  }

  chmod(pathStr, mode) {
    const node = this.getNode(pathStr);
    if (!node) {
      throw new Error(`chmod: cannot access '${pathStr}': No such file or directory`);
    }
    // Simple 3-digit octal permission converter (e.g. 755 -> rwxr-xr-x)
    if (/^[0-7]{3}$/.test(mode)) {
      const map = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];
      const u = map[parseInt(mode[0])];
      const g = map[parseInt(mode[1])];
      const o = map[parseInt(mode[2])];
      node.permissions = u + g + o;
    } else if (mode === '+x') {
      node.isExecutable = true;
      node.permissions = node.permissions.replace(/-/g, 'x');
    }
    this.save();
    return node.permissions;
  }

  search(startPath = this.cwd, query = '') {
    const startNode = this.getNode(startPath);
    if (!startNode) return [];

    const results = [];
    const walk = (node, currPath) => {
      if (!node) return;
      if (node.name.toLowerCase().includes(query.toLowerCase())) {
        results.push(currPath || '/');
      }
      if (node.type === 'dir' && node.children) {
        for (const [name, child] of Object.entries(node.children)) {
          const nextPath = currPath === '/' ? `/${name}` : `${currPath}/${name}`;
          walk(child, nextPath);
        }
      }
    };

    walk(startNode, this.normalizePath(startPath));
    return results;
  }

  generateTree(startPath = this.cwd) {
    const norm = this.normalizePath(startPath);
    const startNode = this.getNode(norm);
    if (!startNode) {
      throw new Error(`tree: '${startPath}': No such file or directory`);
    }

    const lines = [norm];
    let dirCount = 0;
    let fileCount = 0;

    const buildTree = (node, prefix = '') => {
      if (node.type !== 'dir' || !node.children) return;

      const entries = Object.entries(node.children);
      entries.forEach(([name, child], idx) => {
        const isLast = idx === entries.length - 1;
        const branch = isLast ? '└── ' : '├── ';
        const nextPrefix = prefix + (isLast ? '    ' : '│   ');

        if (child.type === 'dir') {
          dirCount++;
          lines.push(`${prefix}${branch}\x1b[34m${name}\x1b[0m`);
          buildTree(child, nextPrefix);
        } else {
          fileCount++;
          const color = child.isExecutable ? '\x1b[32m' : '';
          lines.push(`${prefix}${branch}${color}${name}\x1b[0m`);
        }
      });
    };

    buildTree(startNode, '');
    lines.push(`\n${dirCount} directories, ${fileCount} files`);
    return lines.join('\n');
  }
}

export const vfs = new VirtualFileSystem();
