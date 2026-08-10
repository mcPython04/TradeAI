"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CalendarCell } from "@/lib/calendar";
import { adjacentMonthParam, currentMonthParam } from "@/lib/calendar";
import { formatCalendarPnl, formatTradeCount, formatWinRate } from "@/lib/calendar-format";
import type { DayBucket } from "@/lib/trades";
import DayTradesModal from "./day-trades-modal";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pnlColor(pnl: number) {
  if (pnl === 0) return "text-gray-900";
  return pnl > 0 ? "text-green-600" : "text-red-600";
}

function weekPnlColor(pnl: number) {
  if (pnl === 0) return "text-gray-900";
  return pnl > 0 ? "text-green-600" : "text-red-600";
}

function DayCell({
  cell,
  bucket,
  onSelect,
}: {
  cell: CalendarCell;
  bucket: DayBucket | undefined;
  onSelect: (date: string) => void;
}) {
  if (!cell.date) {
    return <div className="min-h-24 rounded border border-transparent" />;
  }

  if (!bucket) {
    return (
      <div className="min-h-24 rounded border bg-gray-50 p-2 text-gray-400">
        <div className="text-xs">{cell.dayOfMonth}</div>
      </div>
    );
  }

  const isWin = bucket.pnl >= 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(cell.date!)}
      className={`min-h-24 rounded border p-2 text-left transition-colors ${
        isWin
          ? "bg-green-50 border-green-500 hover:bg-green-100"
          : "bg-red-50 border-red-500 hover:bg-red-100"
      }`}
    >
      <div className="text-xs text-gray-500">{cell.dayOfMonth}</div>
      <div className="text-sm font-semibold text-gray-900">
        {formatCalendarPnl(bucket.pnl)}
      </div>
      <div className="text-xs text-gray-600">{formatTradeCount(bucket.tradeCount)}</div>
      <div className="text-xs text-gray-600">{formatWinRate(bucket.winRate)}</div>
    </button>
  );
}

function WeekSummaryCell({
  weekNumber,
  row,
  dayBuckets,
}: {
  weekNumber: number;
  row: CalendarCell[];
  dayBuckets: Record<string, DayBucket>;
}) {
  let pnl = 0;
  let tradeCount = 0;

  for (const cell of row) {
    if (!cell.date) continue;
    const bucket = dayBuckets[cell.date];
    if (!bucket) continue;
    pnl += bucket.pnl;
    tradeCount += bucket.tradeCount;
  }

  return (
    <div className="min-h-24 rounded border bg-white p-2">
      <div className="text-xs font-medium text-gray-500">Week {weekNumber}</div>
      <div className={`text-sm font-semibold ${weekPnlColor(pnl)}`}>
        {formatCalendarPnl(pnl)}
      </div>
      <div className="text-xs text-gray-600">{formatTradeCount(tradeCount)}</div>
    </div>
  );
}

export default function CalendarView({
  year,
  month,
  monthLabel,
  monthPnl,
  grid,
  dayBuckets,
}: {
  year: number;
  month: number;
  monthLabel: string;
  monthPnl: number;
  grid: CalendarCell[][];
  dayBuckets: Record<string, DayBucket>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  function goToMonth(newMonth: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", newMonth);
    router.push(`${pathname}?${params.toString()}`);
  }

  const selectedBucket = selectedDate ? dayBuckets[selectedDate] : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-8 items-center gap-2">
        <div className="col-span-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => goToMonth(adjacentMonthParam(year, month, -1))}
            className="rounded border px-3 py-1 text-sm transition-colors hover:bg-gray-100"
            aria-label="Previous month"
          >
            &larr;
          </button>
          <h1 className="text-xl font-semibold">{monthLabel}</h1>
          <button
            type="button"
            onClick={() => goToMonth(adjacentMonthParam(year, month, 1))}
            className="rounded border px-3 py-1 text-sm transition-colors hover:bg-gray-100"
            aria-label="Next month"
          >
            &rarr;
          </button>
          <button
            type="button"
            onClick={() => goToMonth(currentMonthParam())}
            className="rounded border px-3 py-1 text-sm transition-colors hover:bg-gray-100"
          >
            Today
          </button>
        </div>
        <div className="col-span-2 col-start-7 flex items-center justify-start gap-2">
          <span className="text-sm text-gray-500">Monthly P&L:</span>
          <span className={`text-lg font-semibold ${pnlColor(monthPnl)}`}>
            {formatCalendarPnl(monthPnl)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-2 text-xs font-medium text-gray-500">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label}>{label}</div>
        ))}
        <div>Week</div>
      </div>

      <div className="flex flex-col gap-2">
        {grid.map((row, i) => (
          <div key={i} className="grid grid-cols-8 gap-2">
            {row.map((cell, j) => (
              <DayCell
                key={j}
                cell={cell}
                bucket={cell.date ? dayBuckets[cell.date] : undefined}
                onSelect={setSelectedDate}
              />
            ))}
            <WeekSummaryCell weekNumber={i + 1} row={row} dayBuckets={dayBuckets} />
          </div>
        ))}
      </div>

      {selectedDate && selectedBucket && (
        <DayTradesModal
          date={selectedDate}
          trades={selectedBucket.trades}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
