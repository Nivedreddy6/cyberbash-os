/**
 * CYBERBASH // SHELL LEXER & INTERPRETER
 */

export class ShellInterpreter {
  constructor(vfs, commandRegistry) {
    this.vfs = vfs;
    this.registry = commandRegistry;
    this.env = {
      USER: 'guest',
      HOME: '/home/guest',
      HOSTNAME: 'cybernode',
      SHELL: '/bin/bash',
      PATH: '/bin:/usr/bin:/usr/local/bin',
      TERM: 'xterm-256color',
      LANG: 'en_US.UTF-8'
    };
    this.aliases = {
      ll: 'ls -la',
      la: 'ls -A',
      cls: 'clear'
    };
  }

  tokenize(commandLine) {
    const tokens = [];
    let curr = '';
    let inQuote = null;
    let escape = false;

    for (let i = 0; i < commandLine.length; i++) {
      const char = commandLine[i];

      if (escape) {
        curr += char;
        escape = false;
        continue;
      }

      if (char === '\\') {
        escape = true;
        continue;
      }

      if (char === '"' || char === "'") {
        if (inQuote === char) {
          inQuote = null;
        } else if (!inQuote) {
          inQuote = char;
        } else {
          curr += char;
        }
        continue;
      }

      if (!inQuote) {
        if (char === '|' || char === '>' || char === '&' || char === ';') {
          if (curr.trim()) {
            tokens.push(curr.trim());
            curr = '';
          }
          if (char === '>' && commandLine[i + 1] === '>') {
            tokens.push('>>');
            i++;
          } else if (char === '&' && commandLine[i + 1] === '&') {
            tokens.push('&&');
            i++;
          } else {
            tokens.push(char);
          }
          continue;
        }

        if (/\s/.test(char)) {
          if (curr.trim()) {
            tokens.push(curr.trim());
            curr = '';
          }
          continue;
        }
      }

      curr += char;
    }

    if (curr.trim()) {
      tokens.push(curr.trim());
    }

    return tokens;
  }

  expandVariables(str) {
    return str.replace(/\$([A-Za-z0-9_]+)/g, (match, varName) => {
      if (varName in this.env) {
        return this.env[varName];
      }
      return '';
    });
  }

  async execute(commandLine) {
    const rawLine = commandLine.trim();
    if (!rawLine) return { stdout: '', stderr: '', exitCode: 0 };

    // Check for chained commands (;)
    if (rawLine.includes(';') && !rawLine.includes('"') && !rawLine.includes("'")) {
      const subCommands = rawLine.split(';').map(c => c.trim()).filter(Boolean);
      let combinedOut = '';
      for (const subCmd of subCommands) {
        const res = await this.execute(subCmd);
        if (res.stdout) combinedOut += (combinedOut ? '\n' : '') + res.stdout;
        if (res.stderr) combinedOut += (combinedOut ? '\n' : '') + res.stderr;
      }
      return { stdout: combinedOut, stderr: '', exitCode: 0 };
    }

    // Check for chained commands (&&)
    if (rawLine.includes('&&') && !rawLine.includes('"') && !rawLine.includes("'")) {
      const subCommands = rawLine.split('&&').map(c => c.trim()).filter(Boolean);
      let combinedOut = '';
      for (const subCmd of subCommands) {
        const res = await this.execute(subCmd);
        if (res.stderr || res.exitCode !== 0) {
          return { stdout: combinedOut, stderr: res.stderr, exitCode: res.exitCode || 1 };
        }
        if (res.stdout) combinedOut += (combinedOut ? '\n' : '') + res.stdout;
      }
      return { stdout: combinedOut, stderr: '', exitCode: 0 };
    }

    // Check for pipelines (|)
    if (rawLine.includes('|')) {
      const pipeStages = rawLine.split('|').map(s => s.trim()).filter(Boolean);
      let pipeStdin = '';
      for (let i = 0; i < pipeStages.length; i++) {
        const stage = pipeStages[i];
        const res = await this.executeSingle(stage, pipeStdin);
        if (res.stderr) {
          return res;
        }
        pipeStdin = res.stdout;
      }
      return { stdout: pipeStdin, stderr: '', exitCode: 0 };
    }

    // Check for output redirection (> or >>)
    let isAppend = false;
    let redirectFile = null;
    let cmdToRun = rawLine;

    if (rawLine.includes('>>')) {
      isAppend = true;
      const parts = rawLine.split('>>');
      cmdToRun = parts[0].trim();
      redirectFile = parts[1].trim();
    } else if (rawLine.includes('>')) {
      const parts = rawLine.split('>');
      cmdToRun = parts[0].trim();
      redirectFile = parts[1].trim();
    }

    const res = await this.executeSingle(cmdToRun, '');

    if (redirectFile) {
      try {
        const target = redirectFile.replace(/['"]/g, '');
        const contentToWrite = (res.stdout || '') + (res.stderr ? '\n' + res.stderr : '') + '\n';
        this.vfs.writeFile(target, contentToWrite, isAppend, this.env.USER);
        return { stdout: '', stderr: '', exitCode: 0 };
      } catch (err) {
        return { stdout: '', stderr: `bash: ${redirectFile}: ${err.message}`, exitCode: 1 };
      }
    }

    return res;
  }

  async executeSingle(cmdString, stdinText = '') {
    let tokens = this.tokenize(cmdString);
    if (tokens.length === 0) return { stdout: '', stderr: '', exitCode: 0 };

    // Resolve alias
    let cmdName = tokens[0];
    if (this.aliases[cmdName]) {
      const aliasExpanded = this.aliases[cmdName] + ' ' + tokens.slice(1).join(' ');
      tokens = this.tokenize(aliasExpanded);
      cmdName = tokens[0];
    }

    // Variable expansion in args
    const args = tokens.slice(1).map(arg => this.expandVariables(arg));

    const handler = this.registry.get(cmdName);
    if (!handler) {
      return {
        stdout: '',
        stderr: `bash: ${cmdName}: command not found. Type 'help' for supported commands.`,
        exitCode: 127
      };
    }

    try {
      const result = await handler({
        args,
        stdin: stdinText,
        vfs: this.vfs,
        shell: this,
        rawLine: cmdString
      });

      if (typeof result === 'string') {
        return { stdout: result, stderr: '', exitCode: 0 };
      }
      return result || { stdout: '', stderr: '', exitCode: 0 };
    } catch (err) {
      return {
        stdout: '',
        stderr: `${cmdName}: ${err.message}`,
        exitCode: 1
      };
    }
  }
}
