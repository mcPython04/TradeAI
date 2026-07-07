import { pgTable, uuid, text, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const tradeSide = pgEnum("trade_side", ["long", "short"]);

export const trades = pgTable("trades", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  ticker: text("ticker").notNull(),
  side: tradeSide("side").notNull().default("long"),
  quantity: numeric("quantity", { precision: 18, scale: 6 }).notNull(),
  entryPrice: numeric("entry_price", { precision: 18, scale: 6 }).notNull(),
  exitPrice: numeric("exit_price", { precision: 18, scale: 6 }),
  entryDate: timestamp("entry_date", { mode: "date" }).notNull(),
  exitDate: timestamp("exit_date", { mode: "date" }),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Trade = typeof trades.$inferSelect;
export type NewTrade = typeof trades.$inferInsert;
