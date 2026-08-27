/**
 * CYBERBASH // SYSTEM MONITOR APP (HTOP & PROCESS VIEWER)
 * Live CPU/RAM/VFS metrics and interactive process control.
 */

import { sound } from './sound.js';
import { showToast } from '../utils/helpers.js';

export class SysMonitorApp {
  constructor() {
    this.container = document.getElementById('sysMonitorApp');
    this.processes = [
      { pid: 1, user: 'root', name: 'systemd', cpu: 0.2, mem: 1.4, status: 'running', critical: true },
      { pid: 48, user: 'root', name: 'vfs-daemon', cpu: 1.1, mem: 2.8, status: 'running', critical: true },
      { pid: 102, user: 'guest', name: 'bash', cpu: 0.8, mem: 3.5, status: 'running', critical: false },
      { pid: 140, user: 'guest', name: 'matrix-canvas', cpu: 4.2, mem: 4.1, status: 'running', critical: false },
      { pid: 215, user: 'system', name: 'audio-synth', cpu: 0.5, mem: 1.2, status: 'running', critical: false },
      { pid: 310, user: 'guest', name: 'quest-engine', cpu: 1.5, mem: 2.0, status: 'running', critical: false },
      { pid: 412, user: 'system', name: 'http-server', cpu: 0.3, mem: 1.8, status: 'running', critical: false },
      { pid: 520, user: 'guest', name: 'nautilus-vfs', cpu: 2.4, mem: 3.2, status: 'running', critical: false }
    ];

    if (this.container) {
      this.init();
    }
  }

  init() {
    this.cpuVal = this.container.querySelector('#sysmonCpuVal');
    this.cpuBar = this.container.querySelector('#sysmonCpuBar');
    this.ramVal = this.container.querySelector('#sysmonRamVal');
    this.ramBar = this.container.querySelector('#sysmonRamBar');
    this.diskVal = this.container.querySelector('#sysmonDiskVal');
    this.diskBar = this.container.querySelector('#sysmonDiskBar');
    this.procTableBody = this.container.querySelector('#sysmonProcBody');

    this.renderProcesses();
    this.startLiveTick();
  }

  startLiveTick() {
    setInterval(() => {
      // Fluctuating realistic metrics
      const baseCpu = 12 + Math.floor(Math.random() * 24);
      const baseRam = 2.1 + (Math.random() * 0.4);
      const ramPercent = Math.floor((baseRam / 8.0) * 100);

      if (this.cpuVal) this.cpuVal.textContent = `${baseCpu}%`;
      if (this.cpuBar) this.cpuBar.style.width = `${baseCpu}%`;

      if (this.ramVal) this.ramVal.textContent = `${baseRam.toFixed(2)} / 8.0 GB (${ramPercent}%)`;
      if (this.ramBar) this.ramBar.style.width = `${ramPercent}%`;

      // Update topbar mini sparkline indicators
      const topCpu = document.getElementById('topbarCpuIndicator');
      if (topCpu) topCpu.textContent = `CPU: ${baseCpu}%`;
    }, 1800);
  }

  renderProcesses() {
    if (!this.procTableBody) return;
    this.procTableBody.innerHTML = '';

    this.processes.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span style="color: var(--accent-cyan); font-weight:600;">${p.pid}</span></td>
        <td>${p.user}</td>
        <td><strong>${p.name}</strong></td>
        <td>${(p.cpu + (Math.random() * 0.4)).toFixed(1)}%</td>
        <td>${p.mem}%</td>
        <td><span style="color: var(--accent-green);"><i class="fa-solid fa-circle-check"></i> ${p.status}</span></td>
        <td>
          ${p.critical ? '<span style="color: var(--text-dim); font-size: 10px;">Protected</span>' : `<button class="kill-btn" data-pid="${p.pid}">KILL</button>`}
        </td>
      `;

      const killBtn = tr.querySelector('.kill-btn');
      if (killBtn) {
        killBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          sound.playKeyClick();
          this.killProcess(p.pid, p.name);
        });
      }

      this.procTableBody.appendChild(tr);
    });
  }

  killProcess(pid, name) {
    this.processes = this.processes.filter(p => p.pid !== pid);
    this.renderProcesses();
    showToast('Process Terminated', `Sent SIGKILL to process ${pid} (${name})`, 'warning');

    // Auto respawn after 5 seconds
    setTimeout(() => {
      this.processes.push({
        pid: pid + Math.floor(Math.random() * 50) + 10,
        user: 'guest',
        name,
        cpu: 0.5,
        mem: 1.5,
        status: 'running',
        critical: false
      });
      this.renderProcesses();
    }, 5000);
  }
}
