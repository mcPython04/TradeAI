"use client";

import type { Trade } from "@/db/schema";
import { tradePnl } from "@/lib/trade-math";

function formatNumber(value: string) {
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export default function DayTradesModal({
  date,
  trades,
  onClose,
}: {
  date: string;
  trades: Trade[];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{date}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 hover:underline"
          >
            Close
          </button>
        </div>

        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-3 py-2">Ticker</th>
              <th className="px-3 py-2">Side</th>
              <th className="px-3 py-2">Qty</th>
              <th className="px-3 py-2">Entry</th>
              <th className="px-3 py-2">Exit</th>
              <th className="px-3 py-2">P&amp;L</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => {
              const pnl = tradePnl(trade);
              return (
                <tr key={trade.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{trade.ticker}</td>
                  <td className="px-3 py-2 capitalize">{trade.side}</td>
                  <td className="px-3 py-2">{formatNumber(trade.quantity)}</td>
                  <td className="px-3 py-2">{formatNumber(trade.entryPrice)}</td>
                  <td className="px-3 py-2">
                    {trade.exitPrice ? formatNumber(trade.exitPrice) : "—"}
                  </td>
                  <td
                    className={`px-3 py-2 font-medium ${
                      pnl === null
                        ? "text-gray-400"
                        : pnl >= 0
                          ? "text-green-600"
                          : "text-red-600"
                    }`}
                  >
                    {pnl === null ? "open" : pnl.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
