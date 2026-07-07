"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { trades } from "@/db/schema";

const tradeSchema = z.object({
  ticker: z.string().trim().min(1).max(20).toUpperCase(),
  side: z.enum(["long", "short"]),
  quantity: z.coerce.number().positive(),
  entryPrice: z.coerce.number().positive(),
  exitPrice: z.coerce.number().positive().optional().or(z.literal("").transform(() => undefined)),
  entryDate: z.coerce.date(),
  exitDate: z.coerce
    .date()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  notes: z.string().trim().max(2000).optional(),
});

function parseTradeForm(formData: FormData) {
  return tradeSchema.parse({
    ticker: formData.get("ticker"),
    side: formData.get("side"),
    quantity: formData.get("quantity"),
    entryPrice: formData.get("entryPrice"),
    exitPrice: formData.get("exitPrice") || undefined,
    entryDate: formData.get("entryDate"),
    exitDate: formData.get("exitDate") || undefined,
    notes: formData.get("notes") || undefined,
  });
}

export async function createTrade(formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const data = parseTradeForm(formData);

  await db.insert(trades).values({
    userId,
    ticker: data.ticker,
    side: data.side,
    quantity: String(data.quantity),
    entryPrice: String(data.entryPrice),
    exitPrice: data.exitPrice !== undefined ? String(data.exitPrice) : null,
    entryDate: data.entryDate,
    exitDate: data.exitDate ?? null,
    notes: data.notes ?? null,
  });

  revalidatePath("/trades");
  revalidatePath("/dashboard");
  redirect("/trades");
}

export async function updateTrade(id: string, formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const data = parseTradeForm(formData);

  await db
    .update(trades)
    .set({
      ticker: data.ticker,
      side: data.side,
      quantity: String(data.quantity),
      entryPrice: String(data.entryPrice),
      exitPrice: data.exitPrice !== undefined ? String(data.exitPrice) : null,
      entryDate: data.entryDate,
      exitDate: data.exitDate ?? null,
      notes: data.notes ?? null,
      updatedAt: new Date(),
    })
    .where(and(eq(trades.id, id), eq(trades.userId, userId)));

  revalidatePath("/trades");
  revalidatePath("/dashboard");
  redirect("/trades");
}

export async function deleteTrade(formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const id = formData.get("id");
  if (typeof id !== "string") return;

  await db
    .delete(trades)
    .where(and(eq(trades.id, id), eq(trades.userId, userId)));

  revalidatePath("/trades");
  revalidatePath("/dashboard");
}
