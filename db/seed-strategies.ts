import { db } from "./index";
import { investmentStrategies } from "./schema";

const defaultStrategies = [
  {
    id: "strategy_short_term",
    name: "Short-term Trade",
    description: "Quick trades to capitalize on short-term price movements",
    color: "#f97316", // orange-500
    icon: "TrendingUp",
    isActive: true,
  },
  {
    id: "strategy_long_term",
    name: "Long-term Appreciation",
    description: "Buy and hold for long-term capital appreciation",
    color: "#3b82f6", // blue-500
    icon: "TrendingUp",
    isActive: true,
  },
  {
    id: "strategy_dividend_growth",
    name: "Dividend Growth",
    description: "Invest in companies with growing dividend payments",
    color: "#22c55e", // green-500
    icon: "DollarSign",
    isActive: true,
  },
  {
    id: "strategy_high_dividend",
    name: "High Dividend",
    description: "Focus on high current dividend yield",
    color: "#a855f7", // purple-500
    icon: "Coins",
    isActive: true,
  },
  {
    id: "strategy_core",
    name: "Core",
    description: "Core portfolio holdings for stability",
    color: "#6366f1", // indigo-500
    icon: "Shield",
    isActive: true,
  },
  {
    id: "strategy_speculative",
    name: "Speculative",
    description: "Higher risk, potentially higher reward investments",
    color: "#ef4444", // red-500
    icon: "Zap",
    isActive: true,
  },
];

async function seedStrategies() {
  try {
    console.log("Seeding default investment strategies...");

    // Insert all strategies, ignoring duplicates
    for (const strategy of defaultStrategies) {
      try {
        await db.insert(investmentStrategies).values(strategy);
        console.log(`✓ Created strategy: ${strategy.name}`);
      } catch (error: any) {
        if (error.message?.includes("UNIQUE constraint")) {
          console.log(`- Strategy already exists: ${strategy.name}`);
        } else {
          console.error(`✗ Error creating strategy ${strategy.name}:`, error);
        }
      }
    }

    console.log("✅ Strategy seeding complete!");
  } catch (error) {
    console.error("Error seeding strategies:", error);
    process.exit(1);
  }
}

seedStrategies();
