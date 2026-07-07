export function formatCalendarPnl(pnl: number): string {
  const rounded = Math.round(Math.abs(pnl));
  const sign = pnl < 0 ? "-" : "";
  return `${sign}$${rounded.toLocaleString()}`;
}

export function formatTradeCount(count: number): string {
  return `${count} trade${count === 1 ? "" : "s"}`;
}

export function formatWinRate(winRate: number): string {
  return `${(winRate * 100).toFixed(1)}%`;
}
