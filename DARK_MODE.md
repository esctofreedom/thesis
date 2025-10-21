# Dark Mode Implementation

## Overview

Added dark/light mode toggle with system preference detection using next-themes. Users can switch between light, dark, or system-based themes with a smooth transition.

## Features Implemented

### 1. Theme Provider

**File**: `/components/theme-provider.tsx`

- Wraps the entire application
- Manages theme state globally
- Supports light, dark, and system themes
- Persists theme preference to localStorage

### 2. Theme Toggle Component

**File**: `/components/theme-toggle.tsx`

- Beautiful animated sun/moon icon toggle
- Smooth rotation animations on theme change
- Shows sun icon in light mode
- Shows moon icon in dark mode
- Accessible with screen reader support
- Prevents hydration issues with proper mounting check

### 3. Root Layout Update

**File**: `/app/layout.tsx`

- Added ThemeProvider wrapper
- Set default theme to "system" (respects OS preference)
- Added `suppressHydrationWarning` to HTML element
- Updated metadata with proper app title and description

### 4. Home Page Integration

**File**: `/app/page.tsx`

- Theme toggle button in header
- Positioned before view mode toggle
- Consistent with other header controls
- Always accessible

## Technical Implementation

### Dependencies

- **next-themes**: Modern theme management for Next.js
  - Auto-detects system theme
  - Handles localStorage persistence
  - Prevents flash of wrong theme
  - Type-safe React hooks

### Theme Configuration

```typescript
<ThemeProvider
  attribute="class"          // Uses Tailwind's class strategy
  defaultTheme="system"      // Respects OS preference
  enableSystem               // Allow system theme detection
  disableTransitionOnChange  // Prevent jarring transitions
>
```

### Icon Animation

The toggle uses CSS transitions for smooth animation:

- Sun icon: `rotate-0 scale-100` → `rotate-90 scale-0` (light to dark)
- Moon icon: `rotate-90 scale-0` → `rotate-0 scale-100` (dark to light)
- 300ms transition duration
- Smooth rotation and scale effects

### Hydration Safety

Prevents hydration mismatch by:

1. Using `suppressHydrationWarning` on `<html>` tag
2. Client-only rendering with mounted state check
3. Showing placeholder during SSR
4. Syncing with localStorage after hydration

## User Experience

### Theme Options

1. **Light Mode**: Clean, bright interface
2. **Dark Mode**: Easy on the eyes, reduced eye strain
3. **System**: Follows OS dark/light mode automatically

### Visual Indicators

- Sun icon = Light mode active
- Moon icon = Dark mode active
- Animated transition between icons
- Ghost button style (subtle, non-intrusive)

### Persistence

- Theme choice saved to localStorage
- Persists across browser sessions
- Syncs across tabs automatically
- No flash of wrong theme on page load

## CSS Support

### Existing Dark Mode Styles

Your `globals.css` already has comprehensive dark mode support:

- Dark theme colors defined in `.dark` class
- All components styled for both themes
- Smooth color transitions
- Consistent design language

### Color Variables

- Uses CSS custom properties
- Automatically switches based on `.dark` class
- Tailwind configured for dark mode
- All shadcn components support dark mode

## Component Compatibility

All existing components work seamlessly with dark mode:

- ✅ Stock cards
- ✅ Dialogs and modals
- ✅ Buttons and inputs
- ✅ Canvas nodes
- ✅ Charts
- ✅ Dropdown menus
- ✅ Badges
- ✅ TipTap editor

## Benefits

1. **Accessibility**: Easier on the eyes, reduces eye strain
2. **User Preference**: Respects system settings
3. **Modern UX**: Expected feature in modern apps
4. **Energy Saving**: Dark mode can save battery on OLED screens
5. **Professional**: Polished, complete application feel

## How to Use

### For Users

1. Click the sun/moon icon in the top-right corner
2. Theme toggles between light and dark
3. Theme preference automatically saved
4. Works across all pages

### For Developers

```typescript
// Use in any component
import { useTheme } from "next-themes";

function MyComponent() {
  const { theme, setTheme } = useTheme();

  return <button onClick={() => setTheme("dark")}>Dark Mode</button>;
}
```

## Future Enhancements

Potential additions:

- More theme options (e.g., high contrast, sepia)
- Per-page theme overrides
- Custom accent colors
- Theme preview without applying
- Keyboard shortcut for quick toggle
