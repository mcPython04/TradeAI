import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DateRangeFilter from "@/components/date-range-filter";
import CalendarView from "@/components/calendar-view";
import { buildMonthGrid, monthLabel, parseMonthParam } from "@/lib/calendar";
import {
  bucketTradesByDay,
  computeStats,
  getTrades,
  getTradesClosedInRange,
  tradePnl,
} from "@/lib/trades";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border bg-white p-4">
      <div className="text-xs uppercase text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; month?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { from, to, month: monthParam } = await searchParams;
  const trades = await getTrades(userId, { from, to });
  const stats = computeStats(trades);

  const { year, month, from: calFrom, to: calTo } = parseMonthParam(monthParam);
  const closedTrades = await getTradesClosedInRange(userId, { from: calFrom, to: calTo });
  const dayBuckets = bucketTradesByDay(closedTrades);
  const grid = buildMonthGrid(year, month);
  const monthPnl = closedTrades.reduce((sum, t) => sum + (tradePnl(t) ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <DateRangeFilter />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total P&L"
          value={`${stats.totalPnl >= 0 ? "+" : ""}${stats.totalPnl.toFixed(2)}`}
        />
        <StatCard
          label="Win Rate"
          value={`${(stats.winRate * 100).toFixed(0)}%`}
        />
        <StatCard label="Avg Win" value={stats.avgWin.toFixed(2)} />
        <StatCard label="Avg Loss" value={stats.avgLoss.toFixed(2)} />
        <StatCard
          label="Profit Factor"
          value={stats.profitFactor === null ? "—" : stats.profitFactor.toFixed(2)}
        />
        <StatCard
          label="Win / Loss"
          value={`${stats.winCount} / ${stats.lossCount}`}
        />
      </div>

      <CalendarView
        year={year}
        month={month}
        monthLabel={monthLabel(year, month)}
        monthPnl={monthPnl}
        grid={grid}
        dayBuckets={Object.fromEntries(dayBuckets)}
      />
    </div>
  );
}
