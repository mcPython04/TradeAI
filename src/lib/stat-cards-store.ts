export const STAT_CARD_DEFS = [
  { id: "totalPnl", label: "Total P&L" },
  { id: "winRate", label: "Win Rate" },
  { id: "avgWin", label: "Avg Win" },
  { id: "avgLoss", label: "Avg Loss" },
  { id: "profitFactor", label: "Profit Factor" },
  { id: "winLoss", label: "Win / Loss" },
] as const;

export type StatCardId = (typeof STAT_CARD_DEFS)[number]["id"];

const ALL_IDS: readonly string[] = STAT_CARD_DEFS.map((d) => d.id);

export const DEFAULT_STAT_CARDS: StatCardId[] = [
  "totalPnl",
  "winRate",
  "profitFactor",
  "winLoss",
];

export const MIN_STAT_CARDS = 3;
export const MAX_STAT_CARDS = 5;

const STORAGE_KEY = "dashboard-stat-cards";

let cached: StatCardId[] | null = null;
let listeners: Array<() => void> = [];

function isValidSelection(value: unknown): value is StatCardId[] {
  return (
    Array.isArray(value) &&
    value.length >= MIN_STAT_CARDS &&
    value.length <= MAX_STAT_CARDS &&
    value.every((v) => typeof v === "string" && ALL_IDS.includes(v))
  );
}

function readFromStorage(): StatCardId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STAT_CARDS;
    const parsed = JSON.parse(raw);
    return isValidSelection(parsed) ? parsed : DEFAULT_STAT_CARDS;
  } catch {
    return DEFAULT_STAT_CARDS;
  }
}

export function getSnapshot(): StatCardId[] {
  if (cached === null) cached = readFromStorage();
  return cached;
}

export function getServerSnapshot(): StatCardId[] {
  return DEFAULT_STAT_CARDS;
}

export function subscribe(callback: () => void): () => void {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

export function setSelectedStatCards(next: StatCardId[]): void {
  cached = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  for (const listener of listeners) listener();
}
