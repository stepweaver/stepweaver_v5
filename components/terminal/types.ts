export type TerminalMode =
  | "normal"
  | "contact"
  | "selection"
  | "codex"
  | "resume"
  | "zork"
  | "blackjack";

export type LineVariant =
  | "default"
  | "prompt"
  | "lambda"
  | "success"
  | "error"
  | "warning"
  | "dimmed"
  | "html"
  | "selection";

export interface TerminalLine {
  id: string;
  content: string;
  variant: LineVariant;
}

export type WeatherPickOption = { lat: number; lon: number; label: string };

export interface CommandContext {
  setLines: (_lines: TerminalLine[] | ((_prev: TerminalLine[]) => TerminalLine[])) => void;
  addLines: (_lines: Omit<TerminalLine, "id">[]) => void;
  setMode: (_mode: TerminalMode) => void;
  navigate: (_path: string) => void;
  /** Browser geolocation for `weather` with no city argument (v3 parity). */
  getGeoPosition?: () => Promise<{ lat: number; lon: number } | null>;
}

export interface CommandResult {
  lines: Omit<TerminalLine, "id">[];
  mode?: TerminalMode;
  /** When OpenWeatherMap returns multiple cities, terminal enters selection mode. */
  weatherSelection?: { options: WeatherPickOption[]; forecast: boolean };
}

export interface ContactState {
  isActive: boolean;
  step: number;
  data: { name: string; email: string; message: string };
  timestamp: number | null;
}

export interface SelectionState {
  isActive: boolean;
  options: string[];
  callback: (_index: number) => void;
}