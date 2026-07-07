import Link from "next/link";
import { Show } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-6 py-24 text-center">
      <h1 className="text-3xl font-bold">Trade Journal</h1>
      <p className="max-w-md text-gray-600">
        Log your trades, track P&amp;L, and filter your history by date range.
      </p>
      <Show when="signed-in">
        <Link
          href="/dashboard"
          className="rounded bg-gray-900 px-4 py-2 text-white"
        >
          Go to Dashboard
        </Link>
      </Show>
      <Show when="signed-out">
        <p className="text-sm text-gray-500">Sign in to get started.</p>
      </Show>
    </div>
  );
}
