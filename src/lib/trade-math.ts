import type { Trade } from "@/db/schema";

export function tradePnl(trade: Trade): number | null {
  if (trade.exitPrice === null) return null;
  const entry = Number(trade.entryPrice);
  const exit = Number(trade.exitPrice);
  const qty = Number(trade.quantity);
  const direction = trade.side === "short" ? -1 : 1;
  return (exit - entry) * qty * direction;
}
