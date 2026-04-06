import type { CommandContext, CommandResult } from '../types';
import { buildChatRequestPayload } from '@/lib/chat/request-builder';
import { resumeMenuLines } from '@/lib/terminal/resume-content';
import { codexHelpLines, ensureCodexPosts } from '@/lib/terminal/codex-terminal';
import { startCaveAdventure } from '@/lib/terminal/cave-adventure';
import { startBlackjack } from '@/lib/terminal/blackjack-engine';
import { roll as executeRoll, formatRollResult, parseDiceNotation } from '@/lib/roller';

const COMMANDS: Record<string, (_args: string[], _ctx: CommandContext) => CommandResult | Promise<CommandResult>> = {
  help: (_args, _ctx) => ({
    lines: [
      { content: 'Available commands:', variant: 'success' },
      { content: '', variant: 'default' },
      { content: 'System:', variant: 'lambda' },
      { content: '  clear — Clear terminal screen', variant: 'default' },
      { content: '  cancel — Exit contact wizard or current mode (resume, codex, games)', variant: 'default' },
      { content: '', variant: 'default' },
      { content: 'Content:', variant: 'lambda' },
      { content: '  resume — View resume (sections: summary, experience, …)', variant: 'default' },
      { content: '  codex — Browse blog (ls, cat, grep, exit)', variant: 'default' },
      { content: '  chat <message> — Ask Lambda about experience', variant: 'default' },
      { content: '', variant: 'default' },
      { content: 'Navigation:', variant: 'lambda' },
      { content: '  cd contact | codex | dice-roller | github', variant: 'default' },
      { content: '', variant: 'default' },
      { content: 'Features:', variant: 'lambda' },
      { content: '  weather [location] [--forecast]', variant: 'default' },
      { content: '  roll <notation> — e.g. 3d6+2, 1d20, 2d6+1d4+1', variant: 'default' },
      { content: '  contact — Message wizard (send / cancel)', variant: 'default' },
      { content: '', variant: 'default' },
      { content: 'Games:', variant: 'lambda' },
      { content: '  blackjack | bj — hit, stand, deal, exit', variant: 'default' },
      { content: '  zork — Text adventure (look, go, inventory, exit)', variant: 'default' },
    ],
  }),

  cancel: (_args, _ctx) => ({
    lines: [
      {
        content:
          'At main shell — nothing to cancel. In contact/codex/resume/games, type cancel or use Esc.',
        variant: 'dimmed',
      },
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
    const notation = args.join(' ').trim();
    if (!notation) {
      return {
        lines: [
          { content: 'Usage: roll <notation> (e.g. 3d6+2, 1d20, 2d6+1d4+1)', variant: 'warning' },
        ],
      };
    }
    try {
      const { groups } = parseDiceNotation(notation);
      if (groups.length === 0) {
        return { lines: [{ content: 'Invalid notation: ' + notation, variant: 'error' }] };
      }
      const result = executeRoll(notation);
      const text = formatRollResult(result);
      const lines = text.split("\n").map((content, i) => ({
        content,
        variant: i === 0 ? ("success" as const) : ("lambda" as const),
      }));
      return { lines };
    } catch (e) {
      return {
        lines: [{ content: e instanceof Error ? e.message : 'Roll failed', variant: 'error' }],
      };
    }
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
        body: JSON.stringify(
          buildChatRequestPayload({
            channel: 'terminal',
            messages: [{ role: 'user', content: message }],
            botFields: { _hp_website: '', _t: Date.now(), _d: 4000 },
          })
        ),
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
