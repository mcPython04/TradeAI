import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import DateRangeFilter from "@/components/date-range-filter";
import { getTrades, tradePnl } from "@/lib/trades";
import { deleteTrade } from "./actions";

function formatNumber(value: string) {
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export default async function TradesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { from, to } = await searchParams;
  const trades = await getTrades(userId, { from, to });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Trades</h1>
        <div className="flex items-center gap-3">
          <DateRangeFilter />
          <Link
            href="/trades/new"
            className="rounded bg-gray-900 px-4 py-2 text-sm text-white"
          >
            Add Trade
          </Link>
        </div>
      </div>

      {trades.length === 0 ? (
        <p className="text-sm text-gray-500">
          No trades in this range yet.
        </p>
      ) : (
        <table className="w-full border-collapse overflow-hidden rounded border bg-white text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-3 py-2">Ticker</th>
              <th className="px-3 py-2">Side</th>
              <th className="px-3 py-2">Qty</th>
              <th className="px-3 py-2">Entry</th>
              <th className="px-3 py-2">Exit</th>
              <th className="px-3 py-2">Entry Date</th>
              <th className="px-3 py-2">P&amp;L</th>
              <th className="px-3 py-2" />
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
                  <td className="px-3 py-2">
                    {trade.entryDate.toISOString().slice(0, 10)}
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
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/trades/${trade.id}/edit`}
                        className="text-gray-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <form action={deleteTrade}>
                        <input type="hidden" name="id" value={trade.id} />
                        <button
                          type="submit"
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
