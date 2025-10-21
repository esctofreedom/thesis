import { db } from "./index";
import { stocks, journalEntries } from "./schema";
import { eq } from "drizzle-orm";

/**
 * Migration script to convert existing thesis content to journal entries
 * Run this once to migrate from the old thesis field to the new journal system
 */
async function migrateToJournal() {
  console.log("Starting migration to journal entries...");

  try {
    // Fetch all stocks
    const allStocks = await db.select().from(stocks);
    console.log(`Found ${allStocks.length} stocks to migrate`);

    let migrated = 0;
    let skipped = 0;

    for (const stock of allStocks) {
      // Only migrate if thesis content exists
      if (stock.thesis && stock.thesis.trim().length > 0) {
        // Use the stock's createdAt date, or today if not available
        const entryDate = stock.createdAt
          ? new Date(stock.createdAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];

        // Create journal entry with thesis content
        const entryId = `entry_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        await db.insert(journalEntries).values({
          id: entryId,
          stockId: stock.id,
          date: entryDate,
          content: stock.thesis,
        });

        console.log(
          `✓ Migrated thesis for ${stock.ticker} (${stock.name}) to journal entry dated ${entryDate}`
        );
        migrated++;
      } else {
        console.log(`- Skipped ${stock.ticker} (no thesis content)`);
        skipped++;
      }
    }

    console.log("\n=== Migration Complete ===");
    console.log(`Migrated: ${migrated} stocks`);
    console.log(`Skipped: ${skipped} stocks (no thesis content)`);
    console.log(
      "\nNote: Original thesis field is preserved for backward compatibility"
    );
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run migration
migrateToJournal()
  .then(() => {
    console.log("\nMigration successful! You can now use the journal system.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nMigration failed:", error);
    process.exit(1);
  });
