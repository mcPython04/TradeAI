import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { getTradeById } from "@/lib/trades";
import TradeForm from "../../trade-form";
import { updateTrade } from "../../actions";

export default async function EditTradePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const trade = await getTradeById(userId, id);
  if (!trade) notFound();

  const action = updateTrade.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Edit Trade</h1>
      <TradeForm trade={trade} action={action} />
    </div>
  );
}
