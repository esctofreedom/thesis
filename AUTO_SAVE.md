# Auto-Save Feature

## Overview

Added automatic saving functionality that saves content after 2 seconds of inactivity. Users no longer need to manually click save buttons - everything is saved automatically with visual feedback.

## Implementation

### 1. Classic Editor Page

**File**: `/app/stock/[id]/editor/page.tsx`

**Features**:

- Auto-saves thesis after 2 seconds of no typing
- Visual save status indicator in header
- Three states: Unsaved, Saving, Saved
- Debounced to prevent excessive API calls
- Cleanup on component unmount

**Visual Indicators**:

- 🟠 **Unsaved changes** (orange) - appears immediately when typing
- ⏳ **Saving...** (with spinner) - shows during save request
- ✅ **Saved** (green with checkmark) - confirms successful save

### 2. Canvas Central Thesis Node

**File**: `/components/canvas-nodes/central-thesis-node.tsx`

**Features**:

- Auto-saves investment thesis after 2 seconds of inactivity
- Save status indicator in node header
- Same three-state system as editor
- Compact design for canvas environment
- Syncs to both canvas nodes table and stock thesis field

**Visual Indicators**:

- Small icons and text in node header
- Color-coded status (orange/gray/green)
- Non-intrusive placement

## Technical Details

### Debouncing Strategy

```typescript
// Clear previous timeout
if (saveTimeoutRef.current) {
  clearTimeout(saveTimeoutRef.current);
}

// Set new timeout for 2 seconds
saveTimeoutRef.current = setTimeout(() => {
  autoSave(content);
}, 2000);
```

### State Management

Three save states:

1. **"unsaved"** - Content changed, not yet saved
2. **"saving"** - Save request in progress
3. **"saved"** - Successfully saved to database

### Timeout Reference

Uses `useRef` to store timeout ID:

- Prevents memory leaks
- Allows cleanup on unmount
- Enables cancellation on new changes

### Auto-Save Function

```typescript
const autoSave = useCallback(
  async (contentToSave: string) => {
    setSaveStatus("saving");
    try {
      const response = await fetch(`/api/stocks/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thesis: contentToSave }),
      });

      if (!response.ok) throw new Error("Failed to save");

      setSaveStatus("saved");
    } catch (error) {
      console.error("Error auto-saving:", error);
      setSaveStatus("unsaved");
    }
  },
  [params.id]
);
```

## User Experience

### Typing Flow

1. User starts typing
2. "Unsaved changes" appears immediately (orange)
3. User stops typing
4. 2-second countdown begins
5. "Saving..." appears with spinner
6. Save completes
7. "Saved" appears with green checkmark

### Benefits

- **No manual saving** - happens automatically
- **Immediate feedback** - always know save status
- **Peace of mind** - won't lose work
- **Reduced API calls** - debouncing prevents spam
- **Works offline-ready** - easy to add offline queue later

### Error Handling

- Failed saves show "Unsaved changes"
- Can retry by typing more
- No data loss - keeps local state
- Console logs errors for debugging

## Components Updated

### Classic Editor

- Removed manual save button
- Added save status indicator
- Added auto-save logic with debounce
- Icons: Loader2 (spinner), Check (checkmark)

### Canvas Central Node

- Added save status to header
- Compact indicator design
- Same auto-save behavior
- Integrates with existing update flow

## Performance

### Optimization

- **Debounce delay**: 2 seconds (configurable)
- **Prevents**: Rapid-fire API calls while typing
- **Cleanup**: Proper timeout cancellation
- **Memory**: Efficient ref-based timeout storage

### API Calls

- Only triggers after inactivity period
- Canceled if user continues typing
- Single request per pause
- No redundant saves for unchanged content

## Configuration

### Adjustable Delay

To change auto-save delay, update timeout duration:

```typescript
saveTimeoutRef.current = setTimeout(() => {
  autoSave(content);
}, 2000); // Change this value (milliseconds)
```

### Disable Auto-Save

To disable and restore manual save:

- Remove auto-save useEffect
- Re-add save button
- Remove status indicator

## Future Enhancements

Potential additions:

- **Offline support** - Queue saves when offline
- **Conflict resolution** - Handle concurrent edits
- **Save history** - Track save timestamps
- **Undo/redo** - Integrate with save points
- **Sync indicator** - Show when data is syncing
- **Last saved time** - Display "Saved 2 minutes ago"
- **Keyboard shortcut** - Manual save with Cmd+S

## Icons Used

From `lucide-react`:

- **Loader2** - Spinning animation for saving state
- **Check** - Checkmark for saved state
- Colored text for unsaved state (no icon)

## Color Coding

- **Orange** (`text-orange-500`) - Unsaved, attention needed
- **Gray** (`text-muted-foreground`) - Saving, in progress
- **Green** (`text-green-500`) - Saved, success

## Testing Checklist

✅ Auto-saves after 2 seconds of inactivity
✅ Shows "Unsaved" immediately when typing
✅ Shows "Saving..." during save
✅ Shows "Saved" after successful save
✅ Cancels timeout if typing resumes
✅ Cleans up on component unmount
✅ Works in both editor and canvas
✅ Handles save errors gracefully
✅ No duplicate saves for same content
✅ Visual feedback is clear and non-intrusive
