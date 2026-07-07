"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  function updateParam(key: "from" | "to", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-4 rounded border bg-white p-4">
      <label className="flex flex-col gap-1 text-sm">
        From
        <input
          type="date"
          value={from}
          onChange={(e) => updateParam("from", e.target.value)}
          className="rounded border px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        To
        <input
          type="date"
          value={to}
          onChange={(e) => updateParam("to", e.target.value)}
          className="rounded border px-3 py-2"
        />
      </label>
      {(from || to) && (
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="rounded border px-3 py-2 text-sm text-gray-600"
        >
          Clear
        </button>
      )}
    </div>
  );
}
