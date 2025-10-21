# Stock CRUD Functionality

## Overview

Added full Create, Read, Update, and Delete (CRUD) functionality for stocks. Users can now manage their stock portfolio from the home page.

## Features Implemented

### 1. Create (Add) Stock

**Component**: `/components/add-stock-dialog.tsx`

- Dialog modal with form to add new stocks
- Fields:
  - **Ticker Symbol** (required, auto-uppercase)
  - **Company Name** (required)
  - **Investment Type** (required, dropdown with 4 options)
- Form validation
- Loading states during submission
- Auto-closes and refreshes list on success
- Accessible from two places:
  - Header button (always visible)
  - Empty state message (when no stocks)

### 2. Read (List) Stocks

**Updated**: `/app/page.tsx`

- Fetches all stocks from API
- Displays in responsive grid layout
- Empty state with helpful message
- Loading state during fetch
- Automatic refresh after add/delete

### 3. Delete Stock

**Updated**: `/components/stock-card.tsx`

- Delete button appears on hover (top-right corner)
- Confirmation dialog before deletion
- Clear warning about data loss
- Deletes stock and all associated data:
  - Investment thesis
  - Canvas nodes
  - All related records
- Cannot be undone
- Automatic list refresh after deletion

### 4. API Endpoints

**File**: `/app/api/stocks/route.ts`

#### GET /api/stocks

- Returns array of all stocks
- Used by home page to display portfolio

#### POST /api/stocks

- Creates a new stock
- Required fields: ticker, name, investmentType
- Auto-generates unique ID
- Returns created stock with 201 status

#### DELETE /api/stocks?id={id}

- Deletes stock and all associated data
- Cascades to canvas_nodes table
- Returns success confirmation

### 5. Database Functions

**Updated**: `/lib/stocks.ts`

#### createStock(data)

- Generates unique stock ID
- Inserts stock into database
- Returns created stock object

#### deleteStock(id)

- Deletes canvas nodes first
- Then deletes the stock record
- Handles cascade deletion

## UI/UX Features

### Empty State

- Friendly message: "No stocks yet"
- Clear call-to-action
- Large "Add Stock" button
- Centered, welcoming design

### Stock Cards

- Hover effect reveals delete button
- Smooth opacity transitions
- Trash icon for easy recognition
- Positioned to not interfere with card click

### Confirmation Dialog

- Shows stock ticker and name
- Explains consequences clearly
- Two-button choice (Cancel/Delete)
- Destructive styling for delete button
- Loading state prevents double-clicks

### Add Stock Dialog

- Clean, modal interface
- Logical field order
- Auto-uppercase for ticker symbols
- Dropdown for investment types
- Cancel and Add buttons
- Form validation

## Investment Type Options

1. **Short-term Trade** - Quick trades, short holding period
2. **Long-term Appreciation** - Growth over time
3. **Dividend Growth** - Focus on dividend increases
4. **High Dividend** - High current yield

## Data Integrity

- Stock IDs are unique timestamps + random strings
- Deletion cascades to prevent orphaned data
- Form validation prevents incomplete entries
- API validates all required fields
- Error handling with user feedback

## User Workflow

### Adding a Stock

1. Click "Add Stock" button (header or empty state)
2. Fill in ticker, name, and investment type
3. Click "Add Stock"
4. Dialog closes, list refreshes
5. New stock appears in grid

### Deleting a Stock

1. Hover over stock card
2. Click trash icon in top-right
3. Review confirmation dialog
4. Click "Delete" to confirm
5. Stock removed, list refreshes

## Technical Details

- **IDs**: Format `stock_TIMESTAMP_RANDOM`
- **Cascade Delete**: Canvas nodes deleted automatically
- **Client Components**: All interactive components use "use client"
- **State Management**: React hooks with callbacks
- **API Communication**: Fetch API with proper error handling
- **UI Components**: shadcn/ui (Dialog, AlertDialog, Select, Label, Button)

## Benefits

1. **Complete Control**: Users manage their own portfolio
2. **Clean Slate**: Start with zero stocks, add as needed
3. **Safe Deletion**: Confirmation prevents accidents
4. **Intuitive UI**: Familiar patterns (hover, dialogs)
5. **Fast Feedback**: Loading states and immediate updates
6. **Data Safety**: Clear warnings about permanent actions
