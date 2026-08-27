/**
 * CYBERBASH // CORE LINUX COMMAND SUITE
 */

import { formatBytes, formatDate } from '../utils/helpers.js';

// Mock Process Table
let mockProcesses = [
  { pid: 1, user: 'root', cpu: 0.1, mem: 0.8, stat: 'Ss', time: '0:03', cmd: '/sbin/init' },
  { pid: 892, user: 'root', cpu: 0.0, mem: 0.4, stat: 'S', time: '0:01', cmd: '/usr/sbin/security-daemon' },
  { pid: 1402, user: 'guest', cpu: 0.1, mem: 1.2, stat: 'S', time: '0:02', cmd: '-bash' },
  { pid: 4401, user: 'root', cpu: 0.0, mem: 0.5, stat: 'S', time: '0:01', cmd: 'sshd: guest [priv]' },
  { pid: 7392, user: 'guest', cpu: 98.4, mem: 14.8, stat: 'R', time: '14:22', cmd: './cryptominer_daemon --threads 16 --node 185.220.101.5' }
];

export function registerCoreCommands(registry) {

  // pwd
  registry.register('pwd', ({ vfs }) => {
    return vfs.cwd;
  });

  // cd
  registry.register('cd', ({ args, vfs }) => {
    const target = args[0] || '~';
    vfs.changeDirectory(target);
    return '';
  });

  // ls
  registry.register('ls', ({ args, vfs }) => {
    let showAll = false;
    let longFormat = false;
    let targetPath = vfs.cwd;

    for (const arg of args) {
      if (arg.startsWith('-')) {
        if (arg.includes('a') || arg.includes('A')) showAll = true;
        if (arg.includes('l')) longFormat = true;
      } else {
        targetPath = arg;
      }
    }

    const entries = vfs.listDir(targetPath);
    const filtered = showAll ? entries : entries.filter(e => !e.name.startsWith('.'));

    if (longFormat) {
      const lines = [`total ${filtered.length * 4}`];
      for (const entry of filtered) {
        const typeChar = entry.type === 'dir' ? 'd' : '-';
        const perms = `${typeChar}${entry.permissions}`;
        const links = entry.type === 'dir' ? 2 : 1;
        const owner = entry.owner.padEnd(6);
        const group = entry.group.padEnd(6);
        const size = String(entry.size).padStart(6);
        const dateStr = formatDate(entry.modified);
        
        let color = '';
        if (entry.type === 'dir') color = '\x1b[34m';
        else if (entry.isExecutable) color = '\x1b[32m';
        else if (entry.name.startsWith('.')) color = '\x1b[33m';

        lines.push(`${perms} ${links} ${owner} ${group} ${size} ${dateStr} ${color}${entry.name}\x1b[0m`);
      }
      return lines.join('\n');
    }

    // Grid output
    const items = filtered.map(e => {
      if (e.type === 'dir') return `\x1b[34m${e.name}/\x1b[0m`;
      if (e.isExecutable) return `\x1b[32m${e.name}*\x1b[0m`;
      return e.name;
    });

    return items.join('  ');
  });

  // cat
  registry.register('cat', ({ args, stdin, vfs }) => {
    if (args.length === 0 && stdin) {
      return stdin;
    }
    if (args.length === 0) {
      return '';
    }

    let output = '';
    for (const file of args) {
      const content = vfs.readFile(file);
      output += (output ? '\n' : '') + content;
    }
    return output;
  });

  // head
  registry.register('head', ({ args, stdin, vfs }) => {
    let linesCount = 10;
    let file = null;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-n' && args[i + 1]) {
        linesCount = parseInt(args[i + 1]) || 10;
        i++;
      } else if (!args[i].startsWith('-')) {
        file = args[i];
      }
    }

    const text = file ? vfs.readFile(file) : stdin;
    const lines = text.split('\n');
    return lines.slice(0, linesCount).join('\n');
  });

  // tail
  registry.register('tail', ({ args, stdin, vfs }) => {
    let linesCount = 10;
    let file = null;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-n' && args[i + 1]) {
        linesCount = parseInt(args[i + 1]) || 10;
        i++;
      } else if (!args[i].startsWith('-')) {
        file = args[i];
      }
    }

    const text = file ? vfs.readFile(file) : stdin;
    const lines = text.split('\n');
    return lines.slice(-linesCount).join('\n');
  });

  // grep
  registry.register('grep', ({ args, stdin, vfs }) => {
    let caseInsensitive = false;
    let invertMatch = false;
    let showLineNum = false;
    let pattern = null;
    let file = null;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg.startsWith('-')) {
        if (arg.includes('i')) caseInsensitive = true;
        if (arg.includes('v')) invertMatch = true;
        if (arg.includes('n')) showLineNum = true;
      } else if (!pattern) {
        pattern = arg;
      } else {
        file = arg;
      }
    }

    if (!pattern) {
      throw new Error('grep: missing search pattern');
    }

    const content = file ? vfs.readFile(file) : stdin;
    const lines = content.split('\n');
    const flags = caseInsensitive ? 'i' : '';
    const regex = new RegExp(pattern, flags);

    const matches = [];
    lines.forEach((line, idx) => {
      const isMatch = regex.test(line);
      const shouldInclude = invertMatch ? !isMatch : isMatch;
      if (shouldInclude) {
        let formattedLine = line;
        if (!invertMatch) {
          formattedLine = formattedLine.replace(regex, match => `\x1b[31m${match}\x1b[0m`);
        }
        if (showLineNum) {
          matches.push(`\x1b[32m${idx + 1}\x1b[0m:${formattedLine}`);
        } else {
          matches.push(formattedLine);
        }
      }
    });

    return matches.join('\n');
  });

  // wc
  registry.register('wc', ({ args, stdin, vfs }) => {
    let countLines = false;
    let countWords = false;
    let countChars = false;
    let file = null;

    for (const arg of args) {
      if (arg.startsWith('-')) {
        if (arg.includes('l')) countLines = true;
        if (arg.includes('w')) countWords = true;
        if (arg.includes('c') || arg.includes('m')) countChars = true;
      } else {
        file = arg;
      }
    }

    if (!countLines && !countWords && !countChars) {
      countLines = true;
      countWords = true;
      countChars = true;
    }

    const content = file ? vfs.readFile(file) : stdin;
    const lines = content.split('\n').length - (content.endsWith('\n') ? 1 : 0);
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const chars = content.length;

    const parts = [];
    if (countLines) parts.push(String(lines).padStart(4));
    if (countWords) parts.push(String(words).padStart(4));
    if (countChars) parts.push(String(chars).padStart(4));
    if (file) parts.push(file);

    return parts.join(' ');
  });

  // mkdir
  registry.register('mkdir', ({ args, vfs, shell }) => {
    if (args.length === 0) {
      throw new Error('mkdir: missing operand');
    }
    const recursive = args.includes('-p');
    const targets = args.filter(a => !a.startsWith('-'));

    for (const dir of targets) {
      vfs.createDirectory(dir, recursive, shell.env.USER);
    }
    return '';
  });

  // touch
  registry.register('touch', ({ args, vfs, shell }) => {
    if (args.length === 0) {
      throw new Error('touch: missing file operand');
    }
    for (const file of args) {
      try {
        const existing = vfs.getNode(file);
        if (!existing) {
          vfs.writeFile(file, '', false, shell.env.USER);
        }
      } catch (e) {
        vfs.writeFile(file, '', false, shell.env.USER);
      }
    }
    return '';
  });

  // rm
  registry.register('rm', ({ args, vfs }) => {
    if (args.length === 0) {
      throw new Error('rm: missing operand');
    }
    const recursive = args.some(a => a.includes('r') || a.includes('R'));
    const targets = args.filter(a => !a.startsWith('-'));

    for (const target of targets) {
      vfs.deleteNode(target, recursive);
    }
    return '';
  });

  // chmod
  registry.register('chmod', ({ args, vfs }) => {
    if (args.length < 2) {
      throw new Error('chmod: missing operand (Usage: chmod 755 filename)');
    }
    const mode = args[0];
    const file = args[1];
    vfs.chmod(file, mode);
    return '';
  });

  // echo
  registry.register('echo', ({ args }) => {
    return args.join(' ');
  });

  // tree
  registry.register('tree', ({ args, vfs }) => {
    const target = args[0] || vfs.cwd;
    return vfs.generateTree(target);
  });

  // find
  registry.register('find', ({ args, vfs }) => {
    let startDir = '.';
    let nameFilter = '';

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-name' && args[i + 1]) {
        nameFilter = args[i + 1].replace(/['"]/g, '');
        i++;
      } else if (!args[i].startsWith('-')) {
        startDir = args[i];
      }
    }

    const matches = vfs.search(startDir, nameFilter);
    return matches.join('\n');
  });

  // ps
  registry.register('ps', ({ args }) => {
    const lines = [
      '  PID TTY      STAT   TIME COMMAND',
      ...mockProcesses.map(p => {
        const pid = String(p.pid).padStart(5);
        const stat = p.stat.padEnd(6);
        const time = p.time.padEnd(6);
        return `${pid} pts/0    ${stat} ${time} ${p.cmd}`;
      })
    ];
    return lines.join('\n');
  });

  // top
  registry.register('top', () => {
    const lines = [
      `top - ${new Date().toLocaleTimeString()} up 4 days, 3 users,  load average: 3.84, 2.12, 1.05`,
      `Tasks: ${mockProcesses.length} total,   1 running,  ${mockProcesses.length - 1} sleeping,   0 stopped,   0 zombie`,
      `%Cpu(s): 98.2 us,  1.4 sy,  0.0 ni,  0.4 id,  0.0 wa,  0.0 hi,  0.0 si`,
      `MiB Mem :   8192.0 total,   2140.4 free,   4812.2 used,   1239.4 buff/cache`,
      '',
      '  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND',
      ...mockProcesses.map(p => {
        const pid = String(p.pid).padStart(5);
        const user = p.user.padEnd(8);
        const cpu = String(p.cpu).padStart(5);
        const mem = String(p.mem).padStart(5);
        return `${pid} ${user}  20   0  324560  52140   9200 ${p.stat[0]}  ${cpu}  ${mem}   ${p.time} ${p.cmd}`;
      })
    ];
    return lines.join('\n');
  });

  // kill
  registry.register('kill', ({ args }) => {
    if (args.length === 0) {
      throw new Error('kill: usage: kill [-9] <pid>');
    }
    const pidToKill = parseInt(args[args.length - 1]);
    const idx = mockProcesses.findIndex(p => p.pid === pidToKill);

    if (idx === -1) {
      throw new Error(`kill: (${pidToKill}) - No such process`);
    }

    const removed = mockProcesses.splice(idx, 1)[0];
    return `[Process ${removed.pid} (${removed.cmd.split(' ')[0]}) terminated]`;
  });

  // whoami
  registry.register('whoami', ({ shell }) => {
    return shell.env.USER;
  });

  // hostname
  registry.register('hostname', ({ shell }) => {
    return shell.env.HOSTNAME;
  });

  // uname
  registry.register('uname', ({ args }) => {
    if (args.includes('-a')) {
      return 'Linux cybernode 6.8.0-cyber #42-SMP PREEMPT_DYNAMIC x86_64 GNU/Linux';
    }
    return 'Linux';
  });

  // uptime
  registry.register('uptime', () => {
    return `${new Date().toLocaleTimeString()} up 4 days, 14:22, 1 user, load average: 0.12, 0.08, 0.05`;
  });

  // free
  registry.register('free', ({ args }) => {
    return [
      '               total        used        free      shared  buff/cache   available',
      'Mem:         8192000     4812200     2140400       42000     1239400     3128400',
      'Swap:        2097152           0     2097152'
    ].join('\n');
  });

  // date
  registry.register('date', () => {
    return new Date().toUTCString();
  });

  // export
  registry.register('export', ({ args, shell }) => {
    if (args.length === 0) {
      return Object.entries(shell.env).map(([k, v]) => `declare -x ${k}="${v}"`).join('\n');
    }
    for (const item of args) {
      const [key, val] = item.split('=');
      if (key && val !== undefined) {
        shell.env[key] = val.replace(/['"]/g, '');
      }
    }
    return '';
  });

  // alias
  registry.register('alias', ({ args, shell }) => {
    if (args.length === 0) {
      return Object.entries(shell.aliases).map(([k, v]) => `alias ${k}='${v}'`).join('\n');
    }
    for (const item of args) {
      const [k, v] = item.split('=');
      if (k && v) {
        shell.aliases[k] = v.replace(/['"]/g, '');
      }
    }
    return '';
  });

  // sudo
  registry.register('sudo', ({ args, shell }) => {
    if (args.length === 0) {
      return 'usage: sudo command';
    }
    if (args[0] === 'su') {
      shell.env.USER = 'root';
      return '[Privilege Escalation: You are now root (uid=0)]';
    }
    return `[sudo] executed as root: ${args.join(' ')}`;
  });

  // reset
  registry.register('reset', ({ vfs }) => {
    return vfs.reset();
  });

  // man
  registry.register('man', ({ args }) => {
    if (args.length === 0) return 'What manual page do you want?';
    const cmd = args[0];
    return `MANUAL PAGE FOR: ${cmd.toUpperCase()}(1)\n\nNAME\n    ${cmd} - Linux terminal command utility\n\nDESCRIPTION\n    Full manual entry simulated for CyberBash OS. Type 'help' or open the Cheatsheet for quick flag references.`;
  });

  // help
  registry.register('help', () => {
    return [
      '========================================================================',
      ' CYBERBASH // CORE UNIX COMMAND REFERENCE',
      '========================================================================',
      ' • File & Directory Operations:',
      '     ls [-la]       List directory contents and file metadata',
      '     cd <dir>       Change working directory',
      '     pwd            Print current working directory',
      '     mkdir [-p]     Create new directory',
      '     touch <file>   Create empty file or update timestamp',
      '     rm [-r] <node> Remove files or directories',
      '     chmod <mode>   Change file mode permissions (e.g., chmod 755)',
      '     tree           Display directory tree recursively',
      '     find . -name   Search directory hierarchy for matching files',
      '',
      ' • Text Processing & Viewing:',
      '     cat <file>     Concatenate and print file contents',
      '     head [-n N]    Print first N lines of file or stdin',
      '     tail [-n N]    Print last N lines of file or stdin',
      '     grep [-i]      Search for pattern in files or piped stream',
      '     wc [-l]        Word, line, and byte count',
      '     nano <file>    Full-screen interactive terminal text editor',
      '',
      ' • System & Process Management:',
      '     ps [aux]       Report a snapshot of current processes',
      '     top            Display Linux active processes and CPU load',
      '     kill <pid>     Send signal to terminate process',
      '     whoami         Print effective username',
      '     uname -a       Print system architecture & kernel version',
      '     uptime         Show system uptime and load averages',
      '     free -h        Display memory usage',
      '     export VAR=val Set environment variable',
      '     alias k=v      Define command shortcuts',
      '     history        Display command history',
      '     clear / cls    Clear the terminal screen',
      '',
      ' • Easter Eggs & Visual Cyber Tools:',
      '     neofetch       System hardware & ASCII distribution logo',
      '     cowsay <text>  Configurable cyber talking cow',
      '     matrix         Enter Matrix canvas digital rain animation',
      '     sl             ASCII steam locomotive train animation',
      '     weather        Live terminal ASCII weather forecast',
      '========================================================================'
    ].join('\n');
  });
}
