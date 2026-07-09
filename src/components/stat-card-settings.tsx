"use client";

import { useState, useSyncExternalStore } from "react";
import {
  MAX_STAT_CARDS,
  MIN_STAT_CARDS,
  STAT_CARD_DEFS,
  getServerSnapshot,
  getSnapshot,
  setSelectedStatCards,
  subscribe,
  type StatCardId,
} from "@/lib/stat-cards-store";

export default function StatCardSettings() {
  const [open, setOpen] = useState(false);
  const selected = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const atMin = selected.length <= MIN_STAT_CARDS;
  const atMax = selected.length >= MAX_STAT_CARDS;

  function toggle(id: StatCardId) {
    const isSelected = selected.includes(id);
    if (isSelected && atMin) return;
    if (!isSelected && atMax) return;

    const next = STAT_CARD_DEFS.map((d) => d.id).filter((cid) =>
      cid === id ? !isSelected : selected.includes(cid),
    );
    setSelectedStatCards(next);
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded border bg-white px-3 py-2 text-sm"
      >
        Customize
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-56 rounded border bg-white p-4 shadow-lg">
            <div className="mb-2 text-xs text-gray-500">
              Choose {MIN_STAT_CARDS}–{MAX_STAT_CARDS} stat cards
            </div>
            <div className="flex flex-col gap-2">
              {STAT_CARD_DEFS.map(({ id, label }) => {
                const isSelected = selected.includes(id);
                const disabled = (isSelected && atMin) || (!isSelected && atMax);
                return (
                  <label
                    key={id}
                    className={`flex items-center gap-2 text-sm ${
                      disabled ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={disabled}
                      onChange={() => toggle(id)}
                    />
                    {label}
                  </label>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
