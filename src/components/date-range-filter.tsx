"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { buildMonthGrid, monthLabel } from "@/lib/calendar";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function todayParts() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export default function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  const [open, setOpen] = useState(false);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [view, setView] = useState(() => {
    const anchor = to || from;
    if (anchor) {
      const [y, m] = anchor.split("-").map(Number);
      return { year: y, month: m };
    }
    return todayParts();
  });

  function openPicker() {
    const anchor = to || from;
    if (anchor) {
      const [y, m] = anchor.split("-").map(Number);
      setView({ year: y, month: m });
    } else {
      setView(todayParts());
    }
    setHoverDate(null);
    setOpen(true);
  }

  function setRange(nextFrom: string | undefined, nextTo: string | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextFrom) params.set("from", nextFrom);
    else params.delete("from");
    if (nextTo) params.set("to", nextTo);
    else params.delete("to");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleDayClick(dateStr: string) {
    if (!from || (from && to)) {
      setRange(dateStr, undefined);
    } else if (dateStr < from) {
      setRange(dateStr, undefined);
    } else {
      setRange(from, dateStr);
      setOpen(false);
    }
  }

  function goToMonth(delta: number) {
    setView((v) => {
      const d = new Date(v.year, v.month - 1 + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    });
  }

  const grid = buildMonthGrid(view.year, view.month);
  const rangeEnd = to || (from && hoverDate ? hoverDate : "");
  const rangeStart = from;

  let label = "All time";
  if (from && to) label = `${formatDisplayDate(from)} – ${formatDisplayDate(to)}`;
  else if (from) label = `From ${formatDisplayDate(from)}`;

  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => (open ? setOpen(false) : openPicker())}
          className="rounded border bg-white px-3 py-2 text-sm"
        >
          {label}
        </button>
        {(from || to) && (
          <button
            type="button"
            onClick={() => setRange(undefined, undefined)}
            className="rounded border px-3 py-2 text-sm text-gray-600"
          >
            Clear
          </button>
        )}
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-72 rounded border bg-white p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => goToMonth(-1)}
                className="rounded border px-2 py-1 text-xs"
                aria-label="Previous month"
              >
                &larr;
              </button>
              <div className="text-sm font-medium">
                {monthLabel(view.year, view.month)}
              </div>
              <button
                type="button"
                onClick={() => goToMonth(1)}
                className="rounded border px-2 py-1 text-xs"
                aria-label="Next month"
              >
                &rarr;
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400">
              {WEEKDAY_LABELS.map((label) => (
                <div key={label}>{label}</div>
              ))}
            </div>

            <div className="mt-1 flex flex-col gap-1">
              {grid.map((row, i) => (
                <div key={i} className="grid grid-cols-7 gap-1">
                  {row.map((cell, j) => {
                    if (!cell.date) {
                      return <div key={j} className="h-8" />;
                    }
                    const isEndpoint = cell.date === rangeStart || cell.date === to;
                    const isInRange =
                      !isEndpoint &&
                      rangeStart &&
                      rangeEnd &&
                      cell.date > rangeStart &&
                      cell.date < rangeEnd;

                    return (
                      <button
                        key={j}
                        type="button"
                        onClick={() => handleDayClick(cell.date!)}
                        onMouseEnter={() => setHoverDate(cell.date)}
                        className={`h-8 rounded text-xs ${
                          isEndpoint
                            ? "bg-gray-900 text-white"
                            : isInRange
                              ? "bg-gray-100"
                              : "hover:bg-gray-100"
                        }`}
                      >
                        {cell.dayOfMonth}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
