/**
 * CYBERBASH // DEFAULT UNIX FILESYSTEM STRUCTURE
 */

export const defaultFileSystemData = {
  type: 'dir',
  name: '',
  path: '/',
  permissions: 'rwxr-xr-x',
  owner: 'root',
  group: 'root',
  modified: Date.now() - 3600000 * 24 * 7,
  children: {
    bin: {
      type: 'dir',
      name: 'bin',
      permissions: 'rwxr-xr-x',
      owner: 'root',
      group: 'root',
      modified: Date.now() - 3600000 * 24 * 10,
      children: {
        bash: { type: 'file', name: 'bash', permissions: 'rwxr-xr-x', content: '#!/bin/bash (ELF 64-bit LSB executable)', isExecutable: true, size: 1183448 },
        cat: { type: 'file', name: 'cat', permissions: 'rwxr-xr-x', content: 'ELF 64-bit cat binary', isExecutable: true, size: 43648 },
        ls: { type: 'file', name: 'ls', permissions: 'rwxr-xr-x', content: 'ELF 64-bit ls binary', isExecutable: true, size: 142144 },
        grep: { type: 'file', name: 'grep', permissions: 'rwxr-xr-x', content: 'ELF 64-bit grep binary', isExecutable: true, size: 198280 },
        nano: { type: 'file', name: 'nano', permissions: 'rwxr-xr-x', content: 'GNU nano editor binary', isExecutable: true, size: 312520 }
      }
    },
    etc: {
      type: 'dir',
      name: 'etc',
      permissions: 'rwxr-xr-x',
      owner: 'root',
      group: 'root',
      modified: Date.now() - 3600000 * 24 * 5,
      children: {
        hostname: { type: 'file', name: 'hostname', permissions: 'rw-r--r--', content: 'cybernode\n', size: 10 },
        os_release: {
          type: 'file',
          name: 'os-release',
          permissions: 'rw-r--r--',
          content: 'NAME="CyberBash Linux"\nVERSION="2.5.0-LTS (Matrix Edge)"\nID=cyberbash\nID_LIKE=arch debian\nPRETTY_NAME="CyberBash OS x86_64"\nHOME_URL="https://github.com/Nivedreddy6/linux-cyberbash"\n',
          size: 192
        },
        passwd: {
          type: 'file',
          name: 'passwd',
          permissions: 'rw-r--r--',
          content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nsyslog:x:104:110::/home/syslog:/usr/sbin/nologin\nguest:x:1000:1000:Cyber Operative:/home/guest:/bin/bash\n',
          size: 210
        },
        shadow: {
          type: 'file',
          name: 'shadow',
          permissions: 'rw-------',
          owner: 'root',
          group: 'shadow',
          content: 'root:$6$cybernode$k4p7...:19280:0:99999:7:::\nguest:$6$guestkey$x892...:19280:0:99999:7:::\n',
          size: 120
        },
        motd: {
          type: 'file',
          name: 'motd',
          permissions: 'rw-r--r--',
          content: '===================================================\n  WELCOME TO CYBERBASH OS v2.5.0 LTS [MATRIX CORE]\n  Authorized operatives only. All commands logged.\n  Type "help" or open Missions to begin operations.\n===================================================\n',
          size: 245
        }
      }
    },
    home: {
      type: 'dir',
      name: 'home',
      permissions: 'rwxr-xr-x',
      owner: 'root',
      group: 'root',
      modified: Date.now() - 3600000 * 24 * 3,
      children: {
        guest: {
          type: 'dir',
          name: 'guest',
          permissions: 'rwxr-xr-x',
          owner: 'guest',
          group: 'guest',
          modified: Date.now() - 10000,
          children: {
            '.bashrc': {
              type: 'file',
              name: '.bashrc',
              permissions: 'rw-r--r--',
              owner: 'guest',
              group: 'guest',
              content: '# ~/.bashrc: executed by bash for non-login shells.\nexport PS1="\\[\\033[01;36m\\]\\u\\[\\033[00m\\]@\\[\\033[01;35m\\]\\h\\[\\033[00m\\]:\\[\\033[01;33m\\]\\w\\[\\033[00m\\]\\$ "\nalias ll="ls -la"\nalias cls="clear"\nalias matrix="matrix"\n',
              size: 215
            },
            '.mission_brief.txt': {
              type: 'file',
              name: '.mission_brief.txt',
              permissions: 'rw-r--r--',
              owner: 'guest',
              group: 'guest',
              content: '[OPERATION LINUX GUARDIAN - CLASSIFIED BRIEF]\n\nAgent, welcome to CyberNode. The network is undergoing anomalous activity.\nYour objectives:\n1. Inspect file system and analyze server logs in /var/log\n2. Neutralize rogue crypto-miner processes\n3. Restore broken cron configuration in /etc/crontab\n4. Extract corrupted backup archives and retrieve master keys.\n\nGood luck operative. The terminal is your weapon.\n',
              size: 410
            },
            'welcome.txt': {
              type: 'file',
              name: 'welcome.txt',
              permissions: 'rw-r--r--',
              owner: 'guest',
              group: 'guest',
              content: '🚀 Welcome to CyberBash // Interactive Linux Terminal Simulator!\n\nQuick Commands to Try:\n  • ls -la        -> List files including hidden dotfiles\n  • cat welcome.txt -> Read file contents\n  • neofetch      -> Display system information banner\n  • cowsay "Hi!"  -> Let the cyber cow speak\n  • sl            -> Train animation\n  • matrix        -> Enter Matrix digital rain\n  • nano notes.txt-> Open interactive text editor\n  • help          -> Full list of supported commands\n',
              size: 460
            },
            projects: {
              type: 'dir',
              name: 'projects',
              permissions: 'rwxr-xr-x',
              owner: 'guest',
              group: 'guest',
              modified: Date.now() - 3600000 * 12,
              children: {
                'cyber_scanner.py': {
                  type: 'file',
                  name: 'cyber_scanner.py',
                  permissions: 'rwxr-xr-x',
                  owner: 'guest',
                  group: 'guest',
                  content: '#!/usr/bin/env python3\nimport socket\n\ndef scan_node(host, ports):\n    print(f"[*] Scanning {host}...")\n    for port in ports:\n        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\n        sock.settimeout(0.5)\n        result = sock.connect_ex((host, port))\n        if result == 0:\n            print(f"  [+] Port {port}: OPEN (VULNERABLE)")\n        sock.close()\n\nif __name__ == "__main__":\n    scan_node("127.0.0.1", [22, 80, 443, 8080, 9999])\n',
                  size: 470
                },
                'README.md': {
                  type: 'file',
                  name: 'README.md',
                  permissions: 'rw-r--r--',
                  owner: 'guest',
                  group: 'guest',
                  content: '# Cyber Security Automation Scripts\nContains custom monitoring daemons and packet inspect tools.\n',
                  size: 96
                }
              }
            },
            notes: {
              type: 'dir',
              name: 'notes',
              permissions: 'rwxr-xr-x',
              owner: 'guest',
              group: 'guest',
              modified: Date.now() - 3600000 * 5,
              children: {
                'todo.txt': {
                  type: 'file',
                  name: 'todo.txt',
                  permissions: 'rw-r--r--',
                  owner: 'guest',
                  group: 'guest',
                  content: '- [ ] Review syslog entries for CRITICAL errors\n- [ ] Terminate high CPU rogue process\n- [ ] Patch sudoers file\n- [ ] Push repository to GitHub\n',
                  size: 160
                }
              }
            }
          }
        }
      }
    },
    var: {
      type: 'dir',
      name: 'var',
      permissions: 'rwxr-xr-x',
      owner: 'root',
      group: 'root',
      modified: Date.now() - 3600000 * 24 * 4,
      children: {
        log: {
          type: 'dir',
          name: 'log',
          permissions: 'rwxr-xr-x',
          owner: 'root',
          group: 'root',
          modified: Date.now() - 10000,
          children: {
            syslog: {
              type: 'file',
              name: 'syslog',
              permissions: 'rw-r--r--',
              owner: 'root',
              group: 'root',
              content: '2026-08-28 01:14:02 cybernode kernel: Linux version 6.8.0-cyber (x86_64)\n2026-08-28 01:14:05 cybernode systemd[1]: Started Network Service.\n2026-08-28 01:22:18 cybernode sshd[4401]: Accepted publickey for guest from 192.168.1.50 port 52311 ssh2\n2026-08-28 01:45:00 cybernode security-daemon[892]: [WARNING] Suspicious outbound connection to 185.220.101.5:9999\n2026-08-28 02:01:12 cybernode security-daemon[892]: [CRITICAL] Rogue process cryptominer_daemon running as PID 7392\n2026-08-28 02:15:33 cybernode kernel: CPU throttling active on core 0-3 (99.8% load)\n',
              size: 560
            },
            auth_log: {
              type: 'file',
              name: 'auth.log',
              permissions: 'rw-r-----',
              owner: 'root',
              group: 'adm',
              content: 'Aug 28 01:22:18 cybernode sshd[4401]: pam_unix(sshd:session): session opened for user guest\nAug 28 02:00:01 cybernode CRON[6120]: (root) CMD (/usr/local/bin/healthcheck.sh)\n',
              size: 180
            }
          }
        }
      }
    },
    secrets: {
      type: 'dir',
      name: 'secrets',
      permissions: 'rwx------',
      owner: 'root',
      group: 'root',
      modified: Date.now() - 3600000 * 48,
      children: {
        'cipher_key.enc': {
          type: 'file',
          name: 'cipher_key.enc',
          permissions: 'rw-------',
          owner: 'root',
          group: 'root',
          content: 'CYBER-HEX-7A99-F00D-BEEF-2026-ROOT-ACCESS-GRANTED\n',
          size: 52
        }
      }
    },
    tmp: {
      type: 'dir',
      name: 'tmp',
      permissions: 'rwxrwxrwt',
      owner: 'root',
      group: 'root',
      modified: Date.now(),
      children: {}
    }
  }
};
