import { db } from "./index";
import { stocks } from "./schema";

const initialStocks = [
  {
    id: "aapl",
    name: "Apple Inc.",
    ticker: "AAPL",
    investmentType: "long-term-appreciation",
    thesis: "",
  },
  {
    id: "msft",
    name: "Microsoft Corporation",
    ticker: "MSFT",
    investmentType: "long-term-appreciation",
    thesis: "",
  },
  {
    id: "jnj",
    name: "Johnson & Johnson",
    ticker: "JNJ",
    investmentType: "dividend-growth",
    thesis: "",
  },
  {
    id: "t",
    name: "AT&T Inc.",
    ticker: "T",
    investmentType: "high-dividend",
    thesis: "",
  },
  {
    id: "googl",
    name: "Alphabet Inc.",
    ticker: "GOOGL",
    investmentType: "long-term-appreciation",
    thesis: "",
  },
  {
    id: "ko",
    name: "The Coca-Cola Company",
    ticker: "KO",
    investmentType: "dividend-growth",
    thesis: "",
  },
];

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(stocks);

  // Insert initial stocks
  await db.insert(stocks).values(initialStocks);

  console.log("Database seeded successfully!");
  console.log(`Added ${initialStocks.length} stocks`);
}

seed()
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
