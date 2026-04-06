import { formatCodexDate, sortPosts, type CodexPost } from "@/lib/codex/selectors";
import type { LineVariant } from "@/components/terminal/types";

function line(content: string, variant: LineVariant = "default") {
  return { content, variant };
}

let cached: CodexPost[] = [];
let path = "~/codex";

export function resetCodexSession() {
  cached = [];
  path = "~/codex";
}

export async function ensureCodexPosts(): Promise<void> {
  if (cached.length) return;
  try {
    const res = await fetch("/api/codex");
    if (!res.ok) throw new Error("fetch failed");
    const data = (await res.json()) as CodexPost[];
    cached = sortPosts(Array.isArray(data) ? data : []);
  } catch {
    cached = [];
  }
}

export function codexHelpLines() {
  return [
    line("Codex shell", "success"),
    line("ls: list posts   cat <n|slug>: open post   grep <tag>: filter", "default"),
    line("pwd: path   clear: clear screen   exit | cancel: leave codex", "dimmed"),
    line("", "default"),
  ];
}

export async function handleCodexCommand(raw: string): Promise<{
  lines: { content: string; variant: LineVariant }[];
  exit?: boolean;
  clear?: boolean;
}> {
  await ensureCodexPosts();
  const input = raw.trim();
  if (!input) return { lines: [] };

  const [verb, ...rest] = input.split(/\s+/);
  const arg = rest.join(" ").trim();
  const v = verb.toLowerCase();

  if (v === "exit" || v === "quit" || v === "cancel") {
    resetCodexSession();
    return { lines: [line("Left codex mode.", "dimmed")], exit: true };
  }

  if (v === "clear") {
    return { clear: true, lines: [] };
  }

  if (v === "pwd") {
    return { lines: [line(path, "lambda")] };
  }

  if (v === "help" || v === "?") {
    return { lines: [...codexHelpLines()] };
  }

  if (v === "ls" || v === "dir") {
    if (!cached.length) {
      return { lines: [line("No posts loaded. Configure Notion or check /api/codex.", "warning")] };
    }
    const lines: { content: string; variant: LineVariant }[] = [line("Posts:", "success"), line("", "default")];
    cached.forEach((post, i) => {
      const d = post.updated ? formatCodexDate(post.updated) : formatCodexDate(post.date);
      const tags = post.hashtags?.length ? " [" + post.hashtags.join(", ") + "]" : "";
      lines.push(line(`${i + 1}. ${post.title}`, "lambda"));
      lines.push(line(`   ${d}${tags}`, "dimmed"));
      if (post.description) lines.push(line(`   ${post.description}`, "default"));
      lines.push(line("", "default"));
    });
    return { lines };
  }

  if (v === "grep" || v === "filter") {
    if (!arg) return { lines: [line("Usage: grep <tag>", "warning")] };
    const tag = arg.replace(/^#/, "").toLowerCase();
    const filtered = cached.filter((p) => p.hashtags?.some((t) => t.toLowerCase() === tag));
    if (!filtered.length) return { lines: [line("No posts for #" + tag, "warning")] };
    const lines: { content: string; variant: LineVariant }[] = [line(`Filtered #${tag}:`, "success")];
    filtered.forEach((post, i) => {
      lines.push(line(`${i + 1}. ${post.title} → /codex/${post.slug}`, "default"));
    });
    return { lines };
  }

  if (v === "cat") {
    if (!arg) return { lines: [line("Usage: cat <number|slug>", "warning")] };
    if (!cached.length) return { lines: [line("No posts.", "warning")] };
    const n = parseInt(arg, 10);
    let post: CodexPost | undefined;
    if (!Number.isNaN(n) && n >= 1 && n <= cached.length) {
      post = cached[n - 1];
    } else {
      post = cached.find((p) => p.slug === arg);
    }
    if (!post) return { lines: [line("Post not found.", "error")] };
    return {
      lines: [
        line(post.title, "lambda"),
        line(`/codex/${post.slug}`, "success"),
        line(post.description || "(open in browser for full article)", "dimmed"),
      ],
    };
  }

  return { lines: [line("Unknown codex command. Type help.", "warning")] };
}
