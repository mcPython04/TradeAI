import { and, desc, eq, gte, isNotNull, lte } from "drizzle-orm";
import { db } from "@/db";
import { trades, type Trade } from "@/db/schema";
import { tradePnl } from "./trade-math";

export { tradePnl } from "./trade-math";

export async function getTrades(
  userId: string,
  range?: { from?: string; to?: string },
) {
  const conditions = [eq(trades.userId, userId)];

  if (range?.from) {
    conditions.push(gte(trades.entryDate, new Date(range.from)));
  }
  if (range?.to) {
    const end = new Date(range.to);
    end.setHours(23, 59, 59, 999);
    conditions.push(lte(trades.entryDate, end));
  }

  return db
    .select()
    .from(trades)
    .where(and(...conditions))
    .orderBy(desc(trades.entryDate));
}

export async function getTradesClosedInRange(
  userId: string,
  range: { from: string; to: string },
) {
  const end = new Date(range.to);
  end.setHours(23, 59, 59, 999);

  return db
    .select()
    .from(trades)
    .where(
      and(
        eq(trades.userId, userId),
        isNotNull(trades.exitDate),
        gte(trades.exitDate, new Date(range.from)),
        lte(trades.exitDate, end),
      ),
    )
    .orderBy(trades.exitDate);
}

export async function getTradeById(userId: string, id: string) {
  const rows = await db
    .select()
    .from(trades)
    .where(and(eq(trades.id, id), eq(trades.userId, userId)));
  return rows[0] ?? null;
}

export interface TradeStats {
  totalPnl: number;
  winCount: number;
  lossCount: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number | null;
}

export function computeStats(allTrades: Trade[]): TradeStats {
  const closed = allTrades
    .filter((t) => t.exitPrice !== null)
    .sort(
      (a, b) =>
        (a.exitDate ?? a.entryDate).getTime() -
        (b.exitDate ?? b.entryDate).getTime(),
    );

  let totalPnl = 0;
  let winCount = 0;
  let lossCount = 0;
  let grossWin = 0;
  let grossLoss = 0;

  for (const trade of closed) {
    const pnl = tradePnl(trade) ?? 0;
    totalPnl += pnl;
    if (pnl > 0) {
      winCount += 1;
      grossWin += pnl;
    } else if (pnl < 0) {
      lossCount += 1;
      grossLoss += Math.abs(pnl);
    }
  }

  return {
    totalPnl,
    winCount,
    lossCount,
    winRate: closed.length > 0 ? winCount / closed.length : 0,
    avgWin: winCount > 0 ? grossWin / winCount : 0,
    avgLoss: lossCount > 0 ? grossLoss / lossCount : 0,
    profitFactor: grossLoss > 0 ? grossWin / grossLoss : null,
  };
}

export interface DayBucket {
  date: string;
  pnl: number;
  tradeCount: number;
  winRate: number;
  trades: Trade[];
}

export function bucketTradesByDay(closedTrades: Trade[]): Map<string, DayBucket> {
  const buckets = new Map<string, DayBucket>();

  for (const trade of closedTrades) {
    if (!trade.exitDate) continue;
    const key = trade.exitDate.toISOString().slice(0, 10);
    const pnl = tradePnl(trade) ?? 0;

    const existing = buckets.get(key);
    if (existing) {
      existing.pnl += pnl;
      existing.tradeCount += 1;
      existing.trades.push(trade);
    } else {
      buckets.set(key, { date: key, pnl, tradeCount: 1, winRate: 0, trades: [trade] });
    }
  }

  for (const bucket of buckets.values()) {
    const wins = bucket.trades.filter((t) => (tradePnl(t) ?? 0) > 0).length;
    bucket.winRate = bucket.tradeCount > 0 ? wins / bucket.tradeCount : 0;
  }

  return buckets;
}
