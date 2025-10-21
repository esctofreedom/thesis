# View Mode Toggle Feature

## Overview

Added a toggle on the home page to switch between Canvas mode and Editor mode for viewing/editing stocks.

## Changes Made

### 1. New Editor Route

**File**: `/app/stock/[id]/editor/page.tsx`

- Classic editor view (from the original implementation)
- Simple, focused interface with Tiptap editor
- Direct edit and save workflow
- No canvas features

### 2. Updated Home Page

**File**: `/app/page.tsx`

- Converted to client component
- Added view mode toggle with Canvas/Editor buttons
- Icons: Layers for Canvas, FileText for Editor
- Saves preference to localStorage
- Preference persists across sessions
- Styled as a pill-style toggle in the header

### 3. API Endpoint for Stocks

**File**: `/app/api/stocks/route.ts`

- New GET endpoint to fetch all stocks
- Required for client-side rendering of home page

### 4. Updated StockCard Component

**File**: `/components/stock-card.tsx`

- Added `viewMode` prop
- Routes to `/stock/[id]` for Canvas mode
- Routes to `/stock/[id]/editor` for Editor mode
- Seamlessly switches based on user preference

## How It Works

### User Flow

1. **Visit Home Page**

   - Toggle between Canvas and Editor modes at the top
   - Selection is highlighted (default: Canvas)
   - Preference saved to localStorage

2. **Click on a Stock**

   - Canvas mode → Opens infinite canvas with nodes
   - Editor mode → Opens classic editor interface

3. **Preference Persistence**
   - localStorage key: `stockdesk-view-mode`
   - Remembers choice between visits
   - Can switch at any time from home page

## View Modes Comparison

### Canvas Mode (Default)

- **Route**: `/stock/[id]`
- **Features**:
  - Infinite canvas workspace
  - Central thesis node (full Tiptap editor)
  - Sticky notes, charts, images
  - Spatial organization
  - Pan, zoom, drag nodes
  - Best for: Visual thinkers, complex analysis

### Editor Mode

- **Route**: `/stock/[id]/editor`
- **Features**:
  - Single Tiptap editor
  - Focused writing experience
  - Traditional document interface
  - Manual save button
  - Best for: Quick edits, simple notes

## Technical Details

- **State Management**: React useState + localStorage
- **Routing**: Next.js App Router with dynamic routes
- **Data Sync**: Both modes read/write to stock.thesis field
- **UI Components**: shadcn Button components with icons
- **Default Mode**: Canvas (if no preference saved)

## Benefits

1. **User Choice**: Let users pick their preferred workflow
2. **Backward Compatible**: Original editor still available
3. **No Data Loss**: Both modes work with same data
4. **Smooth Transition**: Easy to switch between modes
5. **Persistent Preference**: Remembers user choice
