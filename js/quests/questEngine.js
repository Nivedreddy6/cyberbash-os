/**
 * CYBERBASH // HACKER QUEST ENGINE (OPERATION: LINUX GUARDIAN)
 */

import { sound } from '../ui/sound.js';
import { showToast } from '../utils/helpers.js';

export const QUESTS = [
  {
    id: 1,
    level: 'LEVEL 01',
    title: 'Reconnaissance & Orientation',
    desc: 'Welcome to CyberNode. Confirm your coordinates and reveal all hidden files within your home node.',
    objective: 'Run pwd to verify your path, then execute ls -la to reveal dotfiles.',
    hint: 'Type "pwd" and press Enter, then type "ls -la".',
    rewardXp: 100,
    check: ({ cmd, vfs }) => {
      return cmd.includes('ls') && (cmd.includes('-la') || cmd.includes('-a') || cmd.includes('-al'));
    }
  },
  {
    id: 2,
    level: 'LEVEL 02',
    title: 'Deciphering Hidden Briefs',
    desc: 'An encrypted mission brief is hidden in the current directory (.mission_brief.txt). Read its contents.',
    objective: 'Use cat to read .mission_brief.txt',
    hint: 'Type "cat .mission_brief.txt"',
    rewardXp: 150,
    check: ({ cmd }) => {
      return cmd.startsWith('cat') && cmd.includes('.mission_brief.txt');
    }
  },
  {
    id: 3,
    level: 'LEVEL 03',
    title: 'Forensic Log Analysis',
    desc: 'The kernel log in /var/log/syslog contains critical breach notices. Search the log for [CRITICAL] flags.',
    objective: 'Use grep to filter for "CRITICAL" in /var/log/syslog (e.g., grep CRITICAL /var/log/syslog or with pipe).',
    hint: 'Run "grep CRITICAL /var/log/syslog" or "cat /var/log/syslog | grep CRITICAL".',
    rewardXp: 200,
    check: ({ cmd }) => {
      return cmd.includes('grep') && (cmd.includes('CRITICAL') || cmd.includes('critical')) && (cmd.includes('syslog') || cmd.includes('/var/log'));
    }
  },
  {
    id: 4,
    level: 'LEVEL 04',
    title: 'Neutralize Rogue Daemon',
    desc: 'The log showed rogue cryptominer process running on PID 7392 consuming 99% CPU. Terminate it immediately.',
    objective: 'Inspect processes with ps aux, then eliminate PID 7392 with kill.',
    hint: 'Run "kill 7392" or "kill -9 7392".',
    rewardXp: 250,
    check: ({ cmd }) => {
      return cmd.startsWith('kill') && cmd.includes('7392');
    }
  },
  {
    id: 5,
    level: 'LEVEL 05',
    title: 'Security Patch Crafting',
    desc: 'Create a security patch file at /home/guest/notes/security_patch.txt using nano or echo.',
    objective: 'Create or write to /home/guest/notes/security_patch.txt',
    hint: 'Run "nano notes/security_patch.txt" (Ctrl+O to save, Ctrl+X to exit) or use echo "patch" > notes/security_patch.txt.',
    rewardXp: 300,
    check: ({ vfs }) => {
      const node = vfs.getNode('/home/guest/notes/security_patch.txt');
      return !!node;
    }
  },
  {
    id: 6,
    level: 'LEVEL 06',
    title: 'Directory Architect & Tree View',
    desc: 'Construct a nested backup folder hierarchy: /home/guest/backups/secure_logs and inspect the tree.',
    objective: 'Run mkdir -p backups/secure_logs and then run tree.',
    hint: 'Type "mkdir -p backups/secure_logs" followed by "tree".',
    rewardXp: 350,
    check: ({ cmd, vfs }) => {
      const exists = !!vfs.getNode('/home/guest/backups/secure_logs');
      return exists && cmd.includes('tree');
    }
  },
  {
    id: 7,
    level: 'LEVEL 07',
    title: 'Permission Hardening',
    desc: 'Harden the permissions of your configuration file (.bashrc) to 700 (owner only access).',
    objective: 'Execute chmod 700 .bashrc or chmod 600 .bashrc',
    hint: 'Run "chmod 700 .bashrc" or "chmod 600 .bashrc".',
    rewardXp: 400,
    check: ({ cmd, vfs }) => {
      return cmd.includes('chmod') && (cmd.includes('700') || cmd.includes('600')) && cmd.includes('.bashrc');
    }
  },
  {
    id: 8,
    level: 'LEVEL 08',
    title: 'Pipeline Stream Mastery',
    desc: 'Count how many system accounts exist in /etc/passwd using the pipe (|) operator and wc.',
    objective: 'Pipe /etc/passwd into wc -l (e.g., cat /etc/passwd | wc -l)',
    hint: 'Type "cat /etc/passwd | wc -l"',
    rewardXp: 450,
    check: ({ cmd }) => {
      return cmd.includes('|') && cmd.includes('wc') && (cmd.includes('/etc/passwd') || cmd.includes('passwd'));
    }
  },
  {
    id: 9,
    level: 'LEVEL 09',
    title: 'Root Escalation Protocol',
    desc: 'Escalate privileges to gain full administrative root access to the node kernel.',
    objective: 'Execute sudo su to switch to the root user.',
    hint: 'Type "sudo su" and press Enter.',
    rewardXp: 500,
    check: ({ cmd, shell }) => {
      return cmd.trim() === 'sudo su' || shell.env.USER === 'root';
    }
  },
  {
    id: 10,
    level: 'LEVEL 10',
    title: 'Matrix Awakening & Cyber Legend',
    desc: 'Prove total mastery by displaying your cyber neofetch hardware profile and launching matrix digital rain.',
    objective: 'Run neofetch and matrix to complete your operative training.',
    hint: 'Run "neofetch" then run "matrix".',
    rewardXp: 1000,
    check: ({ cmd }) => {
      return cmd.trim() === 'matrix' || cmd.trim() === 'neofetch';
    }
  }
];

export class QuestEngine {
  constructor(vfs, shell) {
    this.vfs = vfs;
    this.shell = shell;
    this.currentQuestIndex = 0;
    this.playerXp = 0;
    this.completedQuests = new Set();
    this.loadProgress();
  }

  loadProgress() {
    try {
      const savedIndex = localStorage.getItem('cyberbash_quest_idx');
      const savedXp = localStorage.getItem('cyberbash_quest_xp');
      if (savedIndex !== null) this.currentQuestIndex = parseInt(savedIndex) || 0;
      if (savedXp !== null) this.playerXp = parseInt(savedXp) || 0;
    } catch (e) {}
  }

  saveProgress() {
    try {
      localStorage.setItem('cyberbash_quest_idx', this.currentQuestIndex);
      localStorage.setItem('cyberbash_quest_xp', this.playerXp);
    } catch (e) {}
  }

  getCurrentQuest() {
    return QUESTS[this.currentQuestIndex] || null;
  }

  getRank() {
    if (this.playerXp >= 2500) return 'Legendary Hacker';
    if (this.playerXp >= 1500) return 'Root Master';
    if (this.playerXp >= 900) return 'Security Architect';
    if (this.playerXp >= 400) return 'Sysadmin Defender';
    if (this.playerXp >= 100) return 'Cyber Operative';
    return 'Recruit';
  }

  onCommandExecuted(commandLine) {
    const current = this.getCurrentQuest();
    if (!current) return;

    try {
      const isPassed = current.check({
        cmd: commandLine.trim(),
        vfs: this.vfs,
        shell: this.shell
      });

      if (isPassed) {
        this.completeCurrentQuest();
      }
    } catch (e) {
      console.warn('Quest check error:', e);
    }
  }

  completeCurrentQuest() {
    const completedQuest = QUESTS[this.currentQuestIndex];
    if (!completedQuest) return;

    this.playerXp += completedQuest.rewardXp;
    this.completedQuests.add(completedQuest.id);
    this.currentQuestIndex++;
    this.saveProgress();

    sound.playQuestLevelUp();
    showToast(
      `Mission Complete! [${completedQuest.level}]`,
      `+${completedQuest.rewardXp} XP: ${completedQuest.title}. Rank: ${this.getRank()}`,
      'quest'
    );

    this.updateUI();
  }

  updateUI() {
    const current = this.getCurrentQuest();
    const total = QUESTS.length;
    const progressPercent = Math.min(100, Math.round((this.currentQuestIndex / total) * 100));

    // Update Header
    const xpDisp = document.getElementById('playerXpDisplay');
    const rankDisp = document.getElementById('playerRankDisplay');
    const questCountBadge = document.getElementById('questCountBadge');
    if (xpDisp) xpDisp.textContent = `${this.playerXp} XP`;
    if (rankDisp) rankDisp.textContent = this.getRank();
    if (questCountBadge) questCountBadge.textContent = `${Math.min(this.currentQuestIndex + 1, total)}/${total}`;

    // Update Drawer
    const progFill = document.getElementById('questProgressFill');
    const progText = document.getElementById('questProgressText');
    if (progFill) progFill.style.width = `${progressPercent}%`;
    if (progText) progText.textContent = current ? `Mission ${this.currentQuestIndex + 1} of ${total}` : 'All Missions Cleared!';

    // Active Mission Card
    const lvlBadge = document.getElementById('missionLevelBadge');
    const titleElem = document.getElementById('missionTitle');
    const descElem = document.getElementById('missionDesc');
    const objElem = document.getElementById('missionObjectiveText');
    const rewardElem = document.getElementById('missionReward');
    const hintElem = document.getElementById('missionHintContent');

    if (current) {
      if (lvlBadge) lvlBadge.textContent = current.level;
      if (titleElem) titleElem.textContent = current.title;
      if (descElem) descElem.textContent = current.desc;
      if (objElem) objElem.innerHTML = current.objective;
      if (rewardElem) rewardElem.textContent = `+${current.rewardXp} XP`;
      if (hintElem) hintElem.innerHTML = current.hint;
    } else {
      if (lvlBadge) lvlBadge.textContent = 'MASTERED';
      if (titleElem) titleElem.textContent = 'All 10 Missions Accomplished!';
      if (descElem) descElem.textContent = 'Outstanding work operative! You have demonstrated comprehensive mastery over Linux commands, file permissions, pipes, process management, and editors.';
      if (objElem) objElem.innerHTML = 'Explore the filesystem freely or push this project to your GitHub!';
      if (rewardElem) rewardElem.textContent = 'MAX XP';
    }

    // Render Manifest
    const manifestElem = document.getElementById('missionsManifest');
    if (manifestElem) {
      manifestElem.innerHTML = '';
      QUESTS.forEach((q, idx) => {
        const item = document.createElement('div');
        let statusClass = 'locked';
        let iconClass = 'fa-solid fa-lock';

        if (idx < this.currentQuestIndex) {
          statusClass = 'completed';
          iconClass = 'fa-solid fa-circle-check';
        } else if (idx === this.currentQuestIndex) {
          statusClass = 'current';
          iconClass = 'fa-solid fa-crosshairs';
        }

        item.className = `manifest-item ${statusClass}`;
        item.innerHTML = `
          <i class="${iconClass} mi-status-icon"></i>
          <div class="mi-info">
            <span class="mi-title">${q.level}: ${q.title}</span>
            <span class="mi-desc">${q.desc.slice(0, 50)}...</span>
          </div>
          <span class="mi-xp">+${q.rewardXp} XP</span>
        `;
        manifestElem.appendChild(item);
      });
    }
  }
}
