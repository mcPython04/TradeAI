import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DateRangeFilter from "@/components/date-range-filter";
import StatCardSettings from "@/components/stat-card-settings";
import StatCardsRow from "@/components/stat-cards-row";
import CalendarView from "@/components/calendar-view";
import { buildMonthGrid, monthLabel, parseMonthParam } from "@/lib/calendar";
import {
  bucketTradesByDay,
  computeStats,
  getTrades,
  getTradesClosedInRange,
  tradePnl,
} from "@/lib/trades";

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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <DateRangeFilter />
          <StatCardSettings />
        </div>
      </div>

      <StatCardsRow stats={stats} />

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
