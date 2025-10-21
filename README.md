# Stock Desk

A Next.js application for tracking investment theses for your stock portfolio. Built with shadcn/ui components and a powerful TipTap rich text editor.

## Features

- 📊 **Stock Cards**: Visual overview of all your stocks with logos, tickers, and investment types
- 📝 **Rich Text Editor**: Notion-like editor for documenting detailed investment theses
- 🎨 **Beautiful UI**: Built with shadcn/ui components for a modern, clean interface
- 🏷️ **Investment Types**: Categorize stocks by investment strategy:
  - Short Term
  - Long Term Appreciation
  - Dividend Growth
  - High Dividend
- 🌙 **Dark Mode Support**: Full dark mode compatibility

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **TipTap** - Rich text editor
- **Lucide React** - Icons

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run the development server:**

   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
stockdesk/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Home page with stock cards
│   ├── stock/[id]/          # Dynamic routes for individual stocks
│   │   └── page.tsx         # Stock detail page with editor
│   └── globals.css          # Global styles and TipTap editor styles
├── components/
│   ├── tiptap/              # TipTap editor components
│   │   ├── editor.tsx       # Main editor component
│   │   └── toolbar.tsx      # Editor toolbar with formatting options
│   ├── ui/                  # shadcn/ui components
│   └── stock-card.tsx       # Stock card component
├── lib/
│   ├── stocks.ts            # Stock data and utilities
│   └── utils.ts             # Utility functions
└── types/
    └── stock.ts             # TypeScript type definitions
```

## Customization

### Adding New Stocks

Edit `lib/stocks.ts` to add or modify stocks:

```typescript
export const stocks: Stock[] = [
  {
    id: "unique-id",
    name: "Company Name",
    ticker: "TICKER",
    logo: "🔷", // Emoji or image URL
    investmentType: "long-term-appreciation",
    thesis: "",
  },
  // Add more stocks...
];
```

### Investment Types

Available investment types:

- `short-term`
- `long-term-appreciation`
- `dividend-growth`
- `high-dividend`

### Editor Features

The TipTap editor includes:

- **Text Formatting**: Bold, italic, underline, strikethrough, code
- **Headings**: H1, H2, H3
- **Lists**: Bulleted and numbered lists
- **Quotes**: Blockquotes
- **Alignment**: Left, center, right
- **Media**: Links and images
- **Highlighting**: Text highlighting
- **Undo/Redo**: Full history support

## Future Enhancements

- [ ] Database integration for persistent storage
- [ ] User authentication
- [ ] Stock price integration
- [ ] Export investment theses as PDF
- [ ] Search and filter functionality
- [ ] Tags and categories
- [ ] Performance metrics tracking

## License

MIT

## Acknowledgments

- TipTap editor inspired by [tiptap-shadcn](https://github.com/ehtisham-afzal/tiptap-shadcn)
- UI components from [shadcn/ui](https://ui.shadcn.com)
