import { db } from "@/db";
import {
  stocks as stocksTable,
  canvasNodes as canvasNodesTable,
  journalEntries as journalEntriesTable,
  investmentStrategies as strategiesTable,
  stockStrategies as stockStrategiesTable,
  type CanvasNode,
  type NewCanvasNode,
  type NewStock,
  type JournalEntry,
  type NewJournalEntry,
} from "@/db/schema";
import { eq, asc } from "drizzle-orm";

// Re-export Stock type and utility functions from stock-utils
export type { Stock } from "./stock-utils";
export { getInvestmentTypeLabel, getInvestmentTypeColor } from "./stock-utils";

import type { Stock } from "./stock-utils";

export const getAllStocks = async (): Promise<Stock[]> => {
  const result = await db.select().from(stocksTable);
  return result as Stock[];
};

export const getAllStocksWithEntryCounts = async (): Promise<
  (Stock & { entryCount: number })[]
> => {
  const stocks = await db.select().from(stocksTable);

  // Get entry counts and strategies for all stocks
  const stocksWithCounts = await Promise.all(
    stocks.map(async (stock) => {
      const entries = await db
        .select()
        .from(journalEntriesTable)
        .where(eq(journalEntriesTable.stockId, stock.id));

      // Get strategies for this stock
      const stockStrategies = await db
        .select({
          id: strategiesTable.id,
          name: strategiesTable.name,
          description: strategiesTable.description,
          color: strategiesTable.color,
          icon: strategiesTable.icon,
          isActive: strategiesTable.isActive,
        })
        .from(stockStrategiesTable)
        .innerJoin(
          strategiesTable,
          eq(stockStrategiesTable.strategyId, strategiesTable.id)
        )
        .where(eq(stockStrategiesTable.stockId, stock.id));

      return {
        ...stock,
        entryCount: entries.length,
        strategies: stockStrategies,
      } as Stock & { entryCount: number };
    })
  );

  return stocksWithCounts;
};

export const getStockById = async (id: string): Promise<Stock | undefined> => {
  const result = await db
    .select()
    .from(stocksTable)
    .where(eq(stocksTable.id, id));
  return result[0] as Stock | undefined;
};

export const updateStockThesis = async (
  id: string,
  thesis: string
): Promise<void> => {
  await db
    .update(stocksTable)
    .set({ thesis, updatedAt: new Date() })
    .where(eq(stocksTable.id, id));
};

// Canvas node functions
export const getCanvasNodes = async (
  stockId: string
): Promise<CanvasNode[]> => {
  const result = await db
    .select()
    .from(canvasNodesTable)
    .where(eq(canvasNodesTable.stockId, stockId));
  return result;
};

export const createCanvasNode = async (
  node: NewCanvasNode
): Promise<CanvasNode> => {
  const result = await db.insert(canvasNodesTable).values(node).returning();
  return result[0];
};

export const updateCanvasNode = async (
  id: string,
  updates: { position?: string; data?: string }
): Promise<void> => {
  await db
    .update(canvasNodesTable)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(canvasNodesTable.id, id));
};

export const deleteCanvasNode = async (id: string): Promise<void> => {
  await db.delete(canvasNodesTable).where(eq(canvasNodesTable.id, id));
};

// Stock CRUD functions
export const createStock = async (data: {
  ticker: string;
  name: string;
  investmentType: string;
  shares?: number;
  price?: string;
  isWatchlist?: boolean;
  priceTarget?: string | null;
  strategyIds?: string[];
}): Promise<Stock> => {
  const stockId = `stock_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  const result = await db
    .insert(stocksTable)
    .values({
      id: stockId,
      ticker: data.ticker,
      name: data.name,
      investmentType: data.investmentType,
      shares: data.shares || 0,
      price: data.price || "0",
      thesis: "",
      isWatchlist: data.isWatchlist || false,
      priceTarget: data.priceTarget || null,
    })
    .returning();

  // Add strategy relationships
  if (data.strategyIds && data.strategyIds.length > 0) {
    const strategyValues = data.strategyIds.map((strategyId) => ({
      id: `stock_strategy_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      stockId: stockId,
      strategyId: strategyId,
      weight: 100,
    }));
    await db.insert(stockStrategiesTable).values(strategyValues);
  }

  return result[0] as Stock;
};

export const updateStock = async (
  id: string,
  updates: Partial<{
    ticker: string;
    name: string;
    investmentType: string;
    shares: number;
    price: string;
    thesis: string;
    isWatchlist: boolean;
    priceTarget: string | null;
    strategyIds: string[];
  }>
): Promise<void> => {
  const { strategyIds, ...stockUpdates } = updates;

  // Update stock fields
  await db
    .update(stocksTable)
    .set({ ...stockUpdates, updatedAt: new Date() })
    .where(eq(stocksTable.id, id));

  // Update strategy relationships if provided
  if (strategyIds !== undefined) {
    // Delete existing strategy relationships
    await db
      .delete(stockStrategiesTable)
      .where(eq(stockStrategiesTable.stockId, id));

    // Add new strategy relationships
    if (strategyIds.length > 0) {
      const strategyValues = strategyIds.map((strategyId) => ({
        id: `stock_strategy_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        stockId: id,
        strategyId: strategyId,
        weight: 100,
      }));
      await db.insert(stockStrategiesTable).values(strategyValues);
    }
  }
};

export const deleteStock = async (id: string): Promise<void> => {
  // Delete all canvas nodes for this stock first (cascade should handle this, but explicit is safer)
  await db.delete(canvasNodesTable).where(eq(canvasNodesTable.stockId, id));

  // Delete the stock
  await db.delete(stocksTable).where(eq(stocksTable.id, id));
};

// Journal entry functions
export const getJournalEntries = async (
  stockId: string
): Promise<JournalEntry[]> => {
  const result = await db
    .select()
    .from(journalEntriesTable)
    .where(eq(journalEntriesTable.stockId, stockId))
    .orderBy(asc(journalEntriesTable.date));
  return result;
};

export const getLatestJournalEntry = async (
  stockId: string
): Promise<JournalEntry | undefined> => {
  const entries = await db
    .select()
    .from(journalEntriesTable)
    .where(eq(journalEntriesTable.stockId, stockId))
    .orderBy(asc(journalEntriesTable.date));
  return entries[entries.length - 1];
};

export const createJournalEntry = async (
  data: NewJournalEntry
): Promise<JournalEntry> => {
  const result = await db.insert(journalEntriesTable).values(data).returning();
  return result[0];
};

export const updateJournalEntry = async (
  id: string,
  content: string
): Promise<void> => {
  await db
    .update(journalEntriesTable)
    .set({ content, updatedAt: new Date() })
    .where(eq(journalEntriesTable.id, id));
};

export const deleteJournalEntry = async (id: string): Promise<void> => {
  await db.delete(journalEntriesTable).where(eq(journalEntriesTable.id, id));
};
