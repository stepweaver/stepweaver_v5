import type { CommandContext, CommandResult } from '../types';
import { resumeMenuLines } from '@/lib/terminal/resume-content';
import { codexHelpLines, ensureCodexPosts } from '@/lib/terminal/codex-terminal';
import { startCaveAdventure } from '@/lib/terminal/cave-adventure';
import { startBlackjack } from '@/lib/terminal/blackjack-engine';

const COMMANDS: Record<string, (_args: string[], _ctx: CommandContext) => CommandResult | Promise<CommandResult>> = {
  help: (_args, _ctx) => ({
    lines: [
      { content: 'Available commands:', variant: 'success' },
      { content: '', variant: 'default' },
      { content: '  help              Show this help message', variant: 'default' },
      { content: '  clear             Clear the terminal', variant: 'default' },
      { content: '  cd <dest>         Navigate (contact, codex, dice-roller, github)', variant: 'default' },
      { content: '  weather [loc]     Get weather (optionally with --forecast)', variant: 'default' },
      { content: '  contact           Start contact form wizard', variant: 'default' },
      { content: '  chat <message>    Send message to Lambda AI', variant: 'default' },
      { content: '  roll <notation>   Roll dice (e.g. 3d6+2, 1d20)', variant: 'default' },
      { content: '  resume            View resume sections', variant: 'default' },
      { content: '  codex             Browse blog posts', variant: 'default' },
      { content: '  zork              Start text adventure', variant: 'default' },
      { content: '  blackjack / bj    Start card game', variant: 'default' },
    ],
  }),

  clear: (_args, _ctx) => ({ lines: [] }),

  cd: (args, ctx) => {
    const dest = args[0]?.toLowerCase();
    const routes: Record<string, string> = {
      contact: '/contact',
      codex: '/codex',
      'dice-roller': '/dice-roller',
      github: 'https://github.com/stephen',
    };
    if (!dest) {
      return {
        lines: [
          { content: 'Usage: cd <destination>', variant: 'warning' },
          { content: 'Available: contact, codex, dice-roller, github', variant: 'dimmed' },
        ],
      };
    }
    const target = routes[dest];
    if (!target) {
      return { lines: [{ content: 'Unknown destination: ' + dest, variant: 'error' }] };
    }
    if (target.startsWith('http')) {
      return { lines: [{ content: 'Opening: ' + target, variant: 'success' }, { content: '', variant: 'default' }] };
    }
    setTimeout(() => ctx.navigate(target), 300);
    return { lines: [{ content: 'Navigating to ' + dest + '...', variant: 'success' }, { content: '', variant: 'default' }] };
  },

  contact: (_args, ctx) => {
    ctx.setMode('contact');
    return {
      mode: 'contact',
      lines: [
        { content: 'Contact Form', variant: 'success' },
        { content: '------------', variant: 'dimmed' },
        { content: 'Step 1/4: What is your name?', variant: 'default' },
        { content: '', variant: 'default' },
      ],
    };
  },

  roll: (args) => {
    const notation = args.join(' ');
    if (!notation) {
      return { lines: [{ content: 'Usage: roll <notation> (e.g. 3d6+2, 1d20)', variant: 'warning' }] };
    }
    const match = notation.match(/^(\d+)d(\d+)([+-]\d+)?$/);
    if (!match) {
      return { lines: [{ content: 'Invalid notation: ' + notation, variant: 'error' }] };
    }
    const count = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);
    const modifier = match[3] ? parseInt(match[3], 10) : 0;
    const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
    const total = rolls.reduce((a, b) => a + b, 0) + modifier;
    const modStr = modifier > 0 ? '+' + modifier : modifier < 0 ? String(modifier) : '';
    return {
      lines: [
        { content: 'Rolling ' + notation + ':', variant: 'success' },
        { content: '  [' + rolls.join(', ') + ']' + modStr + ' = ' + total, variant: 'lambda' },
      ],
    };
  },

  resume: (_args, ctx) => {
    ctx.setMode('resume');
    return {
      mode: 'resume',
      lines: resumeMenuLines(),
    };
  },

  codex: async (_args, ctx) => {
    ctx.setMode('codex');
    await ensureCodexPosts();
    return {
      mode: 'codex',
      lines: [...codexHelpLines(), { content: 'Type ls to list posts.', variant: 'dimmed' }],
    };
  },

  zork: (_args, ctx) => {
    ctx.setMode('zork');
    const { lines } = startCaveAdventure();
    return { mode: 'zork', lines };
  },

  blackjack: (_args, ctx) => {
    ctx.setMode('blackjack');
    const { lines } = startBlackjack();
    return { mode: 'blackjack', lines };
  },

  chat: async (args) => {
    const message = args.join(' ');
    if (!message) {
      return { lines: [{ content: 'Usage: chat <message>', variant: 'warning' }] };
    }
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: message }],
          channel: 'terminal',
          _hp_website: '',
          _t: Date.now(),
          _d: 1000,
        }),
      });
      if (!res.ok) {
        return { lines: [{ content: 'Lambda is temporarily offline. Try again later.', variant: 'error' }] };
      }
      const data = await res.json();
      return { lines: [{ content: 'lambda: ' + data.message, variant: 'lambda' }] };
    } catch {
      return { lines: [{ content: 'Connection to Lambda failed.', variant: 'error' }] };
    }
  },

  weather: async (args) => {
    const location = args.filter((a) => !a.startsWith('--')).join(' ') || 'New York';
    const forecast = args.includes('--forecast');
    try {
      const params = new URLSearchParams({ q: location });
      if (forecast) params.set('forecast', 'true');
      const res = await fetch('/api/weather?' + params.toString());
      if (!res.ok) {
        return { lines: [{ content: 'Weather data unavailable for: ' + location, variant: 'error' }] };
      }
      const data = await res.json();
      const lines: Array<{content: string; variant: 'success' | 'lambda' | 'dimmed' | 'default'}> = [
        { content: 'Weather: ' + data.location, variant: 'success' },
        { content: '  ' + data.condition + ', ' + data.tempF + 'F (' + data.tempC + 'C)', variant: 'lambda' },
        { content: '  Humidity: ' + data.humidity + '% | Wind: ' + data.wind + ' mph', variant: 'dimmed' },
      ];
      if (data.forecast) {
        lines.push({ content: '', variant: 'default' });
        lines.push({ content: '5-Day Forecast:', variant: 'success' });
        for (const day of data.forecast) {
          lines.push({ content: '  ' + day.date + ': ' + day.condition + ', ' + day.high + 'F / ' + day.low + 'F', variant: 'dimmed' });
        }
      }
      return { lines };
    } catch {
      return { lines: [{ content: 'Failed to fetch weather data.', variant: 'error' }] };
    }
  },
};

export function processCommand(
  input: string,
  ctx: CommandContext
): CommandResult | Promise<CommandResult> {
  const trimmed = input.trim();
  if (!trimmed) {
    return { lines: [] };
  }
  const parts = trimmed.split(/\s+/);
  let cmd = parts[0].toLowerCase();
  if (cmd === "bj") cmd = "blackjack";
  const args = parts.slice(1);
  const handler = COMMANDS[cmd];
  if (!handler) {
    return {
      lines: [
        { content: 'Command not found: ' + cmd, variant: 'error' },
        { content: "Type 'help' for available commands.", variant: 'dimmed' },
      ],
    };
  }
  return handler(args, ctx);
}

export function getCommandList(): string[] {
  return Object.keys(COMMANDS);
}
