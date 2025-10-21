# Central Thesis Node Update

## Overview

Updated the canvas implementation to always include a central investment thesis node that uses the full Tiptap editor, while other text nodes are simplified sticky notes.

## Changes Made

### 1. New Central Thesis Node Component

**File**: `/components/canvas-nodes/central-thesis-node.tsx`

- Full-featured Tiptap editor (same as the original stock page)
- Larger size (700px width) with prominent styling
- Border with primary color to distinguish it
- Header with "Investment Thesis" title and "Central Note" badge
- Cannot be deleted (no delete button)
- Will be fixed in position (non-draggable)

### 2. Simplified Text Node Component

**File**: `/components/canvas-nodes/text-node.tsx`

- Changed from full Tiptap editor to simple textarea
- Styled as a yellow sticky note (250px width, 150px height)
- Simple plain text input (no rich formatting)
- Auto-saves on blur
- Can be deleted with X button
- Perfect for quick notes and annotations

### 3. Updated Canvas Page

**File**: `/app/stock/[id]/page.tsx`

Key updates:

- Registered `central-thesis` node type
- Automatically creates central thesis node on first visit
- Central node is positioned at coordinates (0, 0)
- Loads existing stock thesis into central node
- Central node is non-draggable (`draggable: false`)
- Central node cannot be deleted (no `onDelete` handler)
- When central thesis is updated, it also saves to stock's `thesis` field
- This maintains backward compatibility with the original stock page

### 4. Updated Toolbar Labels

**File**: `/components/canvas-toolbar.tsx`

- Changed "Text Note" to "Sticky Note" for clarity
- This differentiates between the central thesis and quick sticky notes

## Architecture

### Central Thesis Node

- **Type**: `central-thesis`
- **Always exists**: Created automatically if missing
- **Position**: Fixed at (0, 0)
- **Draggable**: No
- **Deletable**: No
- **Content**: Full Tiptap editor with all formatting options
- **Data sync**: Saves to both canvas_nodes table AND stock.thesis field

### Sticky Note Node

- **Type**: `text`
- **User-created**: Added via "Add Node" dropdown
- **Position**: Random on creation, draggable after
- **Draggable**: Yes
- **Deletable**: Yes
- **Content**: Plain textarea (simple text)
- **Data sync**: Saves only to canvas_nodes table

## Benefits

1. **Familiar Experience**: Main thesis editing works exactly like the original page
2. **Central Focus**: The thesis is always present and visually prominent
3. **Quick Notes**: Sticky notes for annotations, reminders, or supporting points
4. **Flexibility**: Can still add charts, images, and other supporting content
5. **Backward Compatible**: Existing thesis content is preserved and accessible

## User Workflow

1. Navigate to stock canvas page
2. Central thesis node automatically appears with existing content
3. Edit thesis using full rich text editor
4. Add sticky notes, charts, and images around the central thesis
5. Organize supporting content spatially on the canvas
6. All changes auto-save to database
