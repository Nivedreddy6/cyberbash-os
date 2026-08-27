/**
 * CYBERBASH // UTILITIES & HELPERS
 */

export function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDate(timestamp) {
  const d = new Date(timestamp || Date.now());
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${month} ${day} ${hours}:${mins}`;
}

export function escapeHtml(unsafe) {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function parseAnsiToHtml(str) {
  if (!str) return '';
  // Basic ANSI color converter to styled HTML
  let formatted = escapeHtml(str);
  
  // Color codes replacement
  formatted = formatted
    .replace(/\x1b\[31m(.*?)\x1b\[0m/g, '<span class="ansi-red">$1</span>')
    .replace(/\x1b\[32m(.*?)\x1b\[0m/g, '<span class="ansi-green">$1</span>')
    .replace(/\x1b\[33m(.*?)\x1b\[0m/g, '<span class="ansi-yellow">$1</span>')
    .replace(/\x1b\[34m(.*?)\x1b\[0m/g, '<span class="ansi-blue">$1</span>')
    .replace(/\x1b\[35m(.*?)\x1b\[0m/g, '<span class="ansi-pink">$1</span>')
    .replace(/\x1b\[36m(.*?)\x1b\[0m/g, '<span class="ansi-cyan">$1</span>')
    .replace(/\x1b\[1m(.*?)\x1b\[0m/g, '<span class="ansi-bold">$1</span>');

  return formatted;
}

export function showToast(title, message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconClass = 'fa-solid fa-circle-info';
  if (type === 'success') iconClass = 'fa-solid fa-circle-check';
  if (type === 'quest') iconClass = 'fa-solid fa-trophy';
  if (type === 'error') iconClass = 'fa-solid fa-triangle-exclamation';

  toast.innerHTML = `
    <i class="${iconClass} toast-icon"></i>
    <div class="toast-content">
      <span class="toast-title">${escapeHtml(title)}</span>
      <span class="toast-msg">${escapeHtml(message)}</span>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
