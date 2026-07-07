import TradeForm from "../trade-form";
import { createTrade } from "../actions";

export default function NewTradePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Add Trade</h1>
      <TradeForm action={createTrade} />
    </div>
  );
}
