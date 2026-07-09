"use client";

import { useSyncExternalStore } from "react";
import {
  STAT_CARD_DEFS,
  getServerSnapshot,
  getSnapshot,
  subscribe,
  type StatCardId,
} from "@/lib/stat-cards-store";
import type { TradeStats } from "@/lib/trades";

const GRID_COLS_CLASS: Record<number, string> = {
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
};

function formatStatValue(id: StatCardId, stats: TradeStats): string {
  switch (id) {
    case "totalPnl":
      return `${stats.totalPnl >= 0 ? "+" : ""}${stats.totalPnl.toFixed(2)}`;
    case "winRate":
      return `${(stats.winRate * 100).toFixed(0)}%`;
    case "avgWin":
      return stats.avgWin.toFixed(2);
    case "avgLoss":
      return stats.avgLoss.toFixed(2);
    case "profitFactor":
      return stats.profitFactor === null ? "—" : stats.profitFactor.toFixed(2);
    case "winLoss":
      return `${stats.winCount} / ${stats.lossCount}`;
  }
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border bg-white p-4">
      <div className="text-xs uppercase text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

export default function StatCardsRow({ stats }: { stats: TradeStats }) {
  const selected = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const cards = STAT_CARD_DEFS.filter((def) => selected.includes(def.id));

  return (
    <div className={`grid gap-4 ${GRID_COLS_CLASS[cards.length] ?? "grid-cols-4"}`}>
      {cards.map((def) => (
        <StatCard key={def.id} label={def.label} value={formatStatValue(def.id, stats)} />
      ))}
    </div>
  );
}
