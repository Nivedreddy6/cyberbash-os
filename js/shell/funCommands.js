/**
 * CYBERBASH // EASTER EGGS, ASCII ART & ANIMATED TOOLS
 */

export function registerFunCommands(registry) {

  // neofetch
  registry.register('neofetch', ({ shell }) => {
    return [
      '  \x1b[36m       _,met$$\$\$\$gg.          \x1b[0m\x1b[35m' + shell.env.USER + '@' + shell.env.HOSTNAME + '\x1b[0m',
      '  \x1b[36m    ,g$$$$$$$$$$$$$$$P.       \x1b[0m-------------------------',
      '  \x1b[36m  ,g$$P"     """Y$$.".        \x1b[0m\x1b[33mOS:\x1b[0m CyberBash Linux 2.5.0 LTS x86_64',
      '  \x1b[36m ,$$\$P\'              `$$\$\$.     \x1b[0m\x1b[33mHost:\x1b[0m Virtual Quantum Node Matrix-X',
      '  \x1b[36m,\'$$P       ,ggs.     `$$b:   \x1b[0m\x1b[33mKernel:\x1b[0m 6.8.0-cyber-hardened',
      '  \x1b[36md\'$$\'     ,$P"\'   .    $$$    \x1b[0m\x1b[33mUptime:\x1b[0m 4 days, 14 hours',
      '  \x1b[36m$$$$      d$\'     ,    $$$P   \x1b[0m\x1b[33mPackages:\x1b[0m 1842 (dpkg), 4 (flatpak)',
      '  \x1b[36m$$$$\\     m\$.            $$$    \x1b[0m\x1b[33mShell:\x1b[0m bash 5.2.21',
      '  \x1b[36m`$$$$\\    `$$.          ,$$P    \x1b[0m\x1b[33mTerminal:\x1b[0m CyberBash-WebTTY',
      '  \x1b[36m `$$$$\\    `"Y$$$$P"\' ,$$$"     \x1b[0m\x1b[33mCPU:\x1b[0m Quantum NeuroCore i9 (16) @ 5.4GHz',
      '  \x1b[36m   `$$$$\\          ,$P"\'        \x1b[0m\x1b[33mGPU:\x1b[0m CyberRadeon RTX 9090 Super 32GB',
      '  \x1b[36m     `$$$$\\     ,g$$"           \x1b[0m\x1b[33mMemory:\x1b[0m 4812MiB / 8192MiB (58%)',
      '  \x1b[36m       `"$$$$$$$$"\'            \x1b[0m',
      '                                \x1b[31m███\x1b[32m███\x1b[33m███\x1b[34m███\x1b[35m███\x1b[36m███\x1b[0m'
    ].join('\n');
  });

  // cowsay
  registry.register('cowsay', ({ args, stdin }) => {
    const text = args.length > 0 ? args.join(' ') : (stdin || 'Moo! Linux is awesome.');
    const borderLen = text.length + 2;
    const border = '-'.repeat(borderLen);

    return [
      ` ${border}`,
      `< ${text} >`,
      ` ${border}`,
      '        \\   ^__^',
      '         \\  (oo)\\_______',
      '            (__)\\       )\\/\\',
      '                ||----w |',
      '                ||     ||'
    ].join('\n');
  });

  // fortune
  registry.register('fortune', () => {
    const quotes = [
      '"Talk is cheap. Show me the code." — Linus Torvalds',
      '"There is no place like /home."',
      '"In a world without walls and fences, who needs Windows and Gates?"',
      '"A computer is like air conditioning: it becomes useless when you open Windows."',
      '"Unix is simple. It just takes a genius to understand its simplicity." — Dennis Ritchie',
      '"To err is human, to really foul things up requires root access."'
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  });

  // weather / wttr.in
  registry.register('weather', () => {
    return [
      'Weather report: CyberCity, Earth',
      '     \\  /       Partly Cloudy, Cyber-Rain expected',
      '   _ /"".-.     +24°C / 75°F',
      '     \\_(   ).   Wind: 14 km/h NE',
      '     /(___(__)  Humidity: 65%',
      '                Precipitation: 10% probability',
      '   Location: Sector 7G (Matrix Subgrid)'
    ].join('\n');
  });

  // sl (Steam Locomotive ASCII Animation)
  registry.register('sl', async () => {
    const trainFrames = [
      `
                    ====        ________                ___________
                _D _|  |_______/        \\__I_I_____===__|_________|
               |(_)---  |   H\\________/ _____ \\   (|            |
               /     |===========|   / _____ \\ =====|     CYBER |
              |      |           |  / /     \\ \\     |   EXPRESS |
             ======================================================
             (O)   (O) (O)       (O) (O) (O)       (O) (O) (O)
      `,
      `
            ====        ________                ___________
        _D _|  |_______/        \\__I_I_____===__|_________|
       |(_)---  |   H\\________/ _____ \\   (|            |
       /     |===========|   / _____ \\ =====|     CYBER |
      |      |           |  / /     \\ \\     |   EXPRESS |
     ======================================================
       (O) (O) (O)       (O) (O) (O)       (O) (O) (O)
      `
    ];

    return '\x1b[33m' + trainFrames[0] + '\x1b[0m\nChoo! Choo! (Did you mean \'ls\'?)';
  });

  // matrix digital rain toggle
  registry.register('matrix', () => {
    const canvas = document.getElementById('matrixCanvas');
    if (!canvas) return 'Matrix canvas not found.';
    
    window.toggleMatrixEffect();
    return '\x1b[32m[Matrix Digital Rain Mode Toggled. Wake up, Neo...]\x1b[0m';
  });
}
