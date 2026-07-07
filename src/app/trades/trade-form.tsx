import type { Trade } from "@/db/schema";

function toDateInputValue(date: Date | null | undefined) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export default function TradeForm({
  trade,
  action,
}: {
  trade?: Trade;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="flex max-w-lg flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Ticker
          <input
            name="ticker"
            required
            defaultValue={trade?.ticker}
            placeholder="AAPL"
            className="rounded border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Side
          <select
            name="side"
            defaultValue={trade?.side ?? "long"}
            className="rounded border px-3 py-2"
          >
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Quantity
          <input
            name="quantity"
            type="number"
            step="any"
            min="0"
            required
            defaultValue={trade?.quantity}
            className="rounded border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Entry price
          <input
            name="entryPrice"
            type="number"
            step="any"
            min="0"
            required
            defaultValue={trade?.entryPrice}
            className="rounded border px-3 py-2"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Entry date
          <input
            name="entryDate"
            type="date"
            required
            defaultValue={toDateInputValue(trade?.entryDate)}
            className="rounded border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Exit price (optional)
          <input
            name="exitPrice"
            type="number"
            step="any"
            min="0"
            defaultValue={trade?.exitPrice ?? ""}
            className="rounded border px-3 py-2"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Exit date (optional)
        <input
          name="exitDate"
          type="date"
          defaultValue={toDateInputValue(trade?.exitDate)}
          className="rounded border px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Notes
        <textarea
          name="notes"
          rows={4}
          defaultValue={trade?.notes ?? ""}
          className="rounded border px-3 py-2"
        />
      </label>

      <button
        type="submit"
        className="rounded bg-gray-900 px-4 py-2 text-white"
      >
        {trade ? "Save changes" : "Add trade"}
      </button>
    </form>
  );
}
