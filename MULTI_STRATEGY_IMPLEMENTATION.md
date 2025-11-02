# Multi-Strategy Implementation

## Overview

The application now supports multiple investment strategies per stock instead of a single investment type. This allows for more nuanced categorization of stocks and better portfolio management.

## Changes Made

### 1. Database Seeding

**File: `db/seed-strategies.ts`**

- Created 6 default investment strategies based on the previous investment types:
  - Short-term Trade (Orange, #f97316)
  - Long-term Appreciation (Blue, #3b82f6)
  - Dividend Growth (Green, #22c55e)
  - High Dividend (Purple, #a855f7)
  - Core (Indigo, #6366f1)
  - Speculative (Red, #ef4444)
- Each strategy includes name, description, color, and icon

**Run:** `npx tsx db/seed-strategies.ts`

### 2. Data Migration

**File: `db/migrate-stock-strategies.ts`**

- Migrates existing stocks to use the new strategy system
- Maps old investment types to corresponding strategy IDs
- Only migrates stocks that don't already have strategies assigned
- Preserves existing strategy relationships

**Run:** `npx tsx db/migrate-stock-strategies.ts`

### 3. Type Definitions

**File: `lib/stock-utils.ts`**

- Added `Strategy` interface with id, name, description, color, icon, and isActive
- Extended `Stock` interface to include optional `strategies` array
- Maintains backward compatibility with `investmentType` field

### 4. Backend Updates

**File: `lib/stocks.ts`**

- Updated `getAllStocksWithEntryCounts()` to fetch and include strategies for each stock
- Modified `createStock()` to accept `strategyIds` array and create strategy relationships
- Modified `updateStock()` to handle strategy updates:
  - Deletes existing strategy relationships
  - Creates new relationships based on provided IDs
- Strategy relationships use the junction table `stockStrategies`

**File: `app/api/stocks/route.ts`**

- POST endpoint now accepts `strategyIds` array
- Passes strategy IDs to stock creation function

**File: `app/api/stocks/[id]/route.ts`**

- PATCH endpoint now accepts `strategyIds` array for updates
- Strategy updates are handled atomically

### 5. Frontend Updates

**File: `components/stock-dialog.tsx`**

- Fetches available strategies from `/api/strategies` on component mount
- Added multi-select UI using colored badge components
- Badges are clickable and toggle selection
- Selected badges show with filled background color
- Shows X icon on selected badges
- Maintains `strategyIds` array in form state
- Sends `strategyIds` when creating or updating stocks

**Key Features:**

- Visual feedback with strategy colors
- Click to toggle selection
- Helper text when no strategies selected
- Loading state while fetching strategies

**File: `components/stock-card.tsx`**

- Displays multiple strategy badges instead of single investment type badge
- Falls back to investment type badge if no strategies assigned (backward compatibility)
- Each badge styled with strategy's custom color
- Badges wrap to multiple lines if needed

### 6. UI/UX Improvements

- **Multi-select interface:** Intuitive badge-based selection
- **Color coding:** Each strategy has a distinct color for quick visual identification
- **Responsive layout:** Strategy badges wrap appropriately
- **Backward compatibility:** Stocks without strategies show legacy investment type

## API Changes

### POST /api/stocks

**New field:**

```json
{
  "strategyIds": ["strategy_id_1", "strategy_id_2"]
}
```

### PATCH /api/stocks/[id]

**New field:**

```json
{
  "strategyIds": ["strategy_id_1", "strategy_id_2"]
}
```

### GET /api/stocks

**Response now includes:**

```json
{
  "strategies": [
    {
      "id": "strategy_short_term",
      "name": "Short-term Trade",
      "description": "Quick trades...",
      "color": "#f97316",
      "icon": "TrendingUp",
      "isActive": true
    }
  ]
}
```

## Usage

### Creating a Stock with Strategies

1. Open the "Add Stock" dialog
2. Fill in stock details
3. Select one or more strategies by clicking the badge buttons
4. Selected strategies will be highlighted with their color
5. Submit the form

### Editing Stock Strategies

1. Click the edit button on a stock card
2. Current strategies will be pre-selected
3. Click badges to add/remove strategies
4. Save changes

### Viewing Stock Strategies

- Stock cards display all assigned strategies as colored badges
- Multiple strategies appear in a wrapped layout
- Each badge uses the strategy's custom color for easy identification

## Database Schema

The implementation uses existing tables:

- `investmentStrategies`: Stores strategy definitions
- `stockStrategies`: Junction table linking stocks to strategies (many-to-many)
- `stocks`: Retains `investmentType` for backward compatibility

## Migration Path

1. Run strategy seeding: `npx tsx db/seed-strategies.ts`
2. Run stock migration: `npx tsx db/migrate-stock-strategies.ts`
3. Existing stocks will automatically have their investment type mapped to a strategy
4. New stocks can have multiple strategies assigned

## Future Enhancements

Potential improvements:

- Strategy weights (already in schema, not yet exposed in UI)
- Custom user-defined strategies
- Strategy-based filtering and grouping
- Portfolio analysis by strategy allocation
- Strategy performance tracking




