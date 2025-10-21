# Stock Position Tracking Enhancement

## Overview

Added position tracking (shares and price) to stocks with automatic total value calculation and improved stock card UI with dropdown menu for edit/delete actions.

## New Features

### 1. Position Tracking Fields

**Database Schema Updates** (`/db/schema.ts`):

- `shares` (integer): Number of shares owned
- `price` (text): Price per share (stored as text for decimal precision)

### 2. Total Value Calculation

**Stock Card Display**:

- Shows number of shares
- Shows price per share
- Calculates and displays total value (shares × price)
- Formatted as currency with proper thousand separators
- Only displays when shares or price > 0

### 3. Dropdown Menu

**Replaced Delete Button** with 3-dot menu:

- Icon: `MoreVertical` (three vertical dots)
- Appears on hover (top-right corner)
- Semi-transparent background with blur
- Contains two options:
  - **Edit** (pencil icon)
  - **Delete** (trash icon, in destructive color)

### 4. Edit Stock Dialog

**New Component** (`/components/edit-stock-dialog.tsx`):

- Edit all stock details:
  - Ticker symbol
  - Company name
  - Investment type
  - Number of shares
  - Price per share
- Pre-filled with current values
- Updates stock in database
- Refreshes list after save

### 5. Enhanced Add Stock Dialog

**Updated** (`/components/add-stock-dialog.tsx`):

- Added shares field (number input, step 1)
- Added price field (number input, step 0.01)
- Both optional, default to 0
- Included in stock creation

### 6. UI Improvements

**Stock Card**:

- Name truncates to single line (no wrapping)
- Cleaner layout with proper spacing
- Position details section (only shown when applicable)
- Total value prominently displayed with separator line
- Responsive layout that works on all screen sizes

## Component Updates

### Stock Card (`/components/stock-card.tsx`)

```tsx
// New sections:
- Dropdown menu with Edit/Delete
- Position details (shares, price, total)
- Currency formatting
- Single-line name truncation
```

### Edit Stock Dialog (`/components/edit-stock-dialog.tsx`)

- Full stock editing interface
- All fields updatable
- Form validation
- Loading states

### Add Stock Dialog (`/components/add-stock-dialog.tsx`)

- Added shares input
- Added price input
- Updated API payload

## API Updates

### POST /api/stocks

- Accepts `shares` and `price` fields
- Creates stock with position data
- Defaults to 0 if not provided

### PATCH /api/stocks/[id]

- Unified update endpoint
- Handles partial updates
- Supports all stock fields:
  - ticker
  - name
  - investmentType
  - shares
  - price
  - thesis
- Only updates provided fields

## Database Functions

### createStock()

**Updated** (`/lib/stocks.ts`):

- Added shares and price parameters
- Stores position data on creation

### updateStock()

**New function** (`/lib/stocks.ts`):

- Generic update function
- Accepts partial updates
- Updates timestamp automatically

## Display Format

### Currency

- Format: `$1,234.56`
- Thousands separator
- Two decimal places
- Using Intl.NumberFormat

### Numbers

- Format: `1,234`
- Thousands separator for shares
- No decimal places for whole numbers

## User Experience

### Empty Position

- Fields hidden when shares = 0 and price = 0
- Clean card layout without position details

### With Position

- Shows three lines:
  1. Shares: [formatted number]
  2. Price: [formatted currency]
  3. Total: [formatted currency] (bold, with border)

### Name Truncation

- Long company names truncate with ellipsis
- Single line only
- Full name visible in edit dialog

### Dropdown Interaction

1. Hover over card → three dots appear
2. Click dots → menu opens
3. Click Edit → edit dialog opens
4. Click Delete → confirmation dialog appears

## Technical Details

### Type Safety

- Stock interface updated in both:
  - `/lib/stock-utils.ts`
  - `/types/stock.ts`
- Optional fields (can be null or undefined)
- Proper TypeScript types throughout

### Data Storage

- Shares: Integer (whole numbers only)
- Price: Text string (preserves decimal precision)
- Total: Calculated in real-time (not stored)

### Calculation

```typescript
const shares = stock.shares || 0;
const price = parseFloat(stock.price || "0");
const total = shares * price;
```

### CSS Classes

- `truncate`: Single-line ellipsis
- `min-w-0`: Allows flex item to shrink below content size
- `flex-1`: Takes remaining space
- Tailwind utilities for responsive layout

## Benefits

1. **Position Tracking**: Know exactly what you own
2. **Total Value**: See portfolio value at a glance
3. **Easy Editing**: Update any field without re-creating
4. **Clean UI**: Dropdown menu is less intrusive
5. **Better Layout**: Name truncation prevents wrapping
6. **Professional Display**: Currency formatting looks polished

## Future Enhancements

Potential additions:

- Real-time price updates from API
- Cost basis tracking
- Profit/loss calculation
- Portfolio summary view
- Historical price charts
- Multiple positions per stock (different lots)
