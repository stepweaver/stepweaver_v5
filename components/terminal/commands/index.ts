import type { CommandContext, CommandResult, WeatherPickOption } from '../types';
import { buildChatRequestPayload } from '@/lib/chat/request-builder';
import { resumeMenuLines } from '@/lib/terminal/resume-content';
import { codexHelpLines, ensureCodexPosts } from '@/lib/terminal/codex-terminal';
import { startAdventureGame, startZorkGame } from '@/lib/terminal/zork-terminal';
import { startBlackjack } from '@/lib/terminal/blackjack-engine';
import {
  roll as executeRoll,
  formatRollResult,
  parseDiceNotation,
  rollSingleDie,
} from '@/lib/roller';
import { formatWeatherApiLines, type WeatherApiSuccess } from '@/lib/terminal/format-weather-lines';

const COMMANDS: Record<string, (_args: string[], _ctx: CommandContext) => CommandResult | Promise<CommandResult>> = {
  help: (_args, _ctx) => ({
    lines: [
      { content: 'Available commands:', variant: 'success' },
      { content: '', variant: 'default' },
      { content: 'System:', variant: 'lambda' },
      { content: '  clear: Clear terminal screen', variant: 'default' },
      { content: '  cancel: Exit contact wizard or current mode (resume, codex, games)', variant: 'default' },
      { content: '', variant: 'default' },
      { content: 'Content:', variant: 'lambda' },
      { content: '  resume: View resume (sections: summary, experience, …)', variant: 'default' },
      { content: '  codex: Browse blog (ls, cat, grep, exit)', variant: 'default' },
      { content: '  chat <message>: Ask Lambda about experience', variant: 'default' },
      { content: '', variant: 'default' },
      { content: 'Navigation:', variant: 'lambda' },
      { content: '  cd contact | codex | dice-roller | github', variant: 'default' },
      { content: '', variant: 'default' },
      { content: 'Features:', variant: 'lambda' },
      { content: '  weather [location] [--forecast] - no location: browser location, else New York', variant: 'default' },
      { content: '  roll <notation> | advantage | disadvantage', variant: 'default' },
      { content: '  contact: Message wizard (send / cancel)', variant: 'default' },
      { content: '', variant: 'default' },
      { content: 'Games:', variant: 'lambda' },
      { content: '  blackjack | bj: hit, stand, deal, exit', variant: 'default' },
      { content: '  adventure: Original terminal text adventure (save / restore / restart)', variant: 'default' },
    ],
  }),

  cancel: (_args, _ctx) => ({
    lines: [
      {
        content:
          'At main shell, nothing to cancel. In contact/codex/resume/games, type cancel or use Esc.',
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
    const raw = args.join(' ').trim();
    if (!raw) {
      return {
        lines: [
          { content: 'Usage: roll <notation> (e.g. 3d6+2, 1d20, advantage, disadvantage)', variant: 'warning' },
        ],
      };
    }
    const lower = raw.toLowerCase();
    if (lower === 'advantage' || lower === 'adv') {
      const a = rollSingleDie(20);
      const b = rollSingleDie(20);
      const kept = Math.max(a, b);
      return {
        lines: [
          {
            content: `Advantage (2d20 keep high): rolled ${a} and ${b} → ${kept}`,
            variant: 'success',
          },
        ],
      };
    }
    if (lower === 'disadvantage' || lower === 'dis') {
      const a = rollSingleDie(20);
      const b = rollSingleDie(20);
      const kept = Math.min(a, b);
      return {
        lines: [
          {
            content: `Disadvantage (2d20 keep low): rolled ${a} and ${b} → ${kept}`,
            variant: 'success',
          },
        ],
      };
    }
    try {
      const { groups } = parseDiceNotation(raw);
      if (groups.length === 0) {
        return { lines: [{ content: 'Invalid notation: ' + raw, variant: 'error' }] };
      }
      const result = executeRoll(raw);
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

  adventure: (_args, ctx) => {
    ctx.setMode('adventure');
    const { lines } = startAdventureGame();
    return { mode: 'adventure', lines };
  },

  // Legacy/hidden alias. Intentionally not shown in help output.
  zork: (_args, ctx) => {
    ctx.setMode('adventure');
    const { lines } = startZorkGame();
    return {
      mode: 'adventure',
      lines: [
        {
          content: 'Launching original text adventure. "zork" is a legacy alias.',
          variant: 'dimmed',
        },
        { content: '', variant: 'default' },
        ...lines,
      ],
    };
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

  weather: async (args, ctx) => {
    const forecast = args.includes('--forecast') || args.includes('-f');
    const locTokens = args.filter((a) => !a.startsWith('--') && a !== '-f');
    const location = locTokens.join(' ').trim();

    async function fetchByCoords(lat: number, lon: number): Promise<CommandResult> {
      const params = new URLSearchParams({ lat: String(lat), lon: String(lon) });
      if (forecast) params.set('forecast', 'true');
      const res = await fetch('/api/weather?' + params.toString());
      const data = await res.json();
      if (!res.ok) {
        return {
          lines: [{ content: (data as { error?: string }).error || 'Weather unavailable', variant: 'error' }],
        };
      }
      return { lines: formatWeatherApiLines(data as WeatherApiSuccess) };
    }

    try {
      if (!location) {
        const pos = (await ctx.getGeoPosition?.()) ?? null;
        if (pos) {
          return fetchByCoords(pos.lat, pos.lon);
        }
        const params = new URLSearchParams({ q: 'New York' });
        if (forecast) params.set('forecast', 'true');
        const res = await fetch('/api/weather?' + params.toString());
        const data = await res.json();
        if (!res.ok) {
          return {
            lines: [{ content: (data as { error?: string }).error || 'Weather unavailable', variant: 'error' }],
          };
        }
        return { lines: formatWeatherApiLines(data as WeatherApiSuccess) };
      }

      const params = new URLSearchParams({ q: location });
      if (forecast) params.set('forecast', 'true');
      const res = await fetch('/api/weather?' + params.toString());
      const data = (await res.json()) as
        | { needSelection: true; options: WeatherPickOption[] }
        | WeatherApiSuccess
        | { error?: string };

      if (!res.ok) {
        return {
          lines: [{ content: (data as { error?: string }).error || 'Weather data unavailable', variant: 'error' }],
        };
      }

      if (
        data &&
        typeof data === 'object' &&
        'needSelection' in data &&
        data.needSelection &&
        Array.isArray(data.options) &&
        data.options.length > 0
      ) {
        const opts = data.options as WeatherPickOption[];
        return {
          lines: [
            { content: `Multiple locations for "${location}":`, variant: 'warning' },
            ...opts.map((o, i) => ({
              content: `  ${i + 1}. ${o.label}`,
              variant: 'default' as const,
            })),
            { content: '', variant: 'default' },
            { content: `Type a number (1-${opts.length}) to select, or cancel.`, variant: 'dimmed' },
          ],
          weatherSelection: { options: opts, forecast },
        };
      }

      return { lines: formatWeatherApiLines(data as WeatherApiSuccess) };
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

function getCommandList(): string[] {
  return Object.keys(COMMANDS);
}
