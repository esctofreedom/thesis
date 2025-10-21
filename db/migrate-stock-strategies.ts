import { db } from "./index";
import {
  stocks as stocksTable,
  investmentStrategies as strategiesTable,
  stockStrategies as stockStrategiesTable,
} from "./schema";

// Map old investment types to new strategy IDs
const investmentTypeToStrategyId: Record<string, string> = {
  "short-term": "strategy_short_term",
  "long-term-appreciation": "strategy_long_term",
  "dividend-growth": "strategy_dividend_growth",
  "high-dividend": "strategy_high_dividend",
  core: "strategy_core",
  speculative: "strategy_speculative",
};

async function migrateStockStrategies() {
  try {
    console.log("Migrating existing stocks to use strategy relationships...\n");

    // Get all stocks
    const stocks = await db.select().from(stocksTable);
    console.log(`Found ${stocks.length} stocks to migrate\n`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const stock of stocks) {
      // Check if stock already has strategies
      const existingStrategies = await db
        .select()
        .from(stockStrategiesTable)
        .where((table) => table.stockId === stock.id);

      if (existingStrategies.length > 0) {
        console.log(
          `⊘ Skipping ${stock.ticker} - already has ${existingStrategies.length} strategies`
        );
        skippedCount++;
        continue;
      }

      // Map investment type to strategy
      const strategyId = investmentTypeToStrategyId[stock.investmentType];

      if (!strategyId) {
        console.log(
          `⚠ Warning: Unknown investment type "${stock.investmentType}" for ${stock.ticker}`
        );
        continue;
      }

      // Create the strategy relationship
      const stockStrategyId = `stock_strategy_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      await db.insert(stockStrategiesTable).values({
        id: stockStrategyId,
        stockId: stock.id,
        strategyId: strategyId,
        weight: 100,
      });

      console.log(`✓ Migrated ${stock.ticker} → ${stock.investmentType}`);
      migratedCount++;

      // Small delay to ensure unique IDs
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   - Migrated: ${migratedCount} stocks`);
    console.log(`   - Skipped: ${skippedCount} stocks`);
  } catch (error) {
    console.error("Error migrating stock strategies:", error);
    process.exit(1);
  }
}

migrateStockStrategies();
