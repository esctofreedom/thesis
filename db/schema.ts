import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const stocks = sqliteTable("stocks", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  ticker: text("ticker").notNull(),
  investmentType: text("investment_type").notNull(),
  shares: integer("shares").default(0),
  price: text("price").default("0"), // Store as text to preserve decimal precision
  thesis: text("thesis").default(""),
  isWatchlist: integer("is_watchlist", { mode: "boolean" }).default(false),
  isFavorite: integer("is_favorite", { mode: "boolean" }).default(false),
  priceTarget: text("price_target"), // Store as text to preserve decimal precision
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const canvasNodes = sqliteTable("canvas_nodes", {
  id: text("id").primaryKey(),
  stockId: text("stock_id")
    .notNull()
    .references(() => stocks.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'text', 'chart', 'image'
  position: text("position").notNull(), // JSON: {x, y}
  data: text("data").notNull(), // JSON: node content
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const journalEntries = sqliteTable("journal_entries", {
  id: text("id").primaryKey(),
  stockId: text("stock_id")
    .notNull()
    .references(() => stocks.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // ISO date string (YYYY-MM-DD)
  content: text("content").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const investmentStrategies = sqliteTable("investment_strategies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").default(""),
  color: text("color").default("#3b82f6"), // Hex color for UI
  icon: text("icon").default("Circle"), // Lucide icon name
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const stockStrategies = sqliteTable("stock_strategies", {
  id: text("id").primaryKey(),
  stockId: text("stock_id")
    .notNull()
    .references(() => stocks.id, { onDelete: "cascade" }),
  strategyId: text("strategy_id")
    .notNull()
    .references(() => investmentStrategies.id, { onDelete: "cascade" }),
  weight: integer("weight").default(100), // Percentage weight (0-100)
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Stock = typeof stocks.$inferSelect;
export type NewStock = typeof stocks.$inferInsert;
export type CanvasNode = typeof canvasNodes.$inferSelect;
export type NewCanvasNode = typeof canvasNodes.$inferInsert;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type NewJournalEntry = typeof journalEntries.$inferInsert;
export type InvestmentStrategy = typeof investmentStrategies.$inferSelect;
export type NewInvestmentStrategy = typeof investmentStrategies.$inferInsert;
export type StockStrategy = typeof stockStrategies.$inferSelect;
export type NewStockStrategy = typeof stockStrategies.$inferInsert;
