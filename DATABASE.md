# Database Setup

This project uses SQLite as the database with Drizzle ORM.

## Initial Setup

1. **Install dependencies** (already done if you've run npm install):

   ```bash
   npm install
   ```

2. **Push the schema to create the database**:

   ```bash
   npm run db:push
   ```

3. **Seed the database with initial data**:
   ```bash
   npm run db:seed
   ```

## Database Scripts

- `npm run db:push` - Push schema changes to the database (creates/updates tables)
- `npm run db:generate` - Generate migration files from schema changes
- `npm run db:migrate` - Run pending migrations
- `npm run db:seed` - Seed the database with initial stock data
- `npm run db:studio` - Open Drizzle Studio to view/edit database in browser

## Database Schema

### Stocks Table

| Column          | Type      | Description                                                                      |
| --------------- | --------- | -------------------------------------------------------------------------------- |
| id              | TEXT (PK) | Unique identifier (e.g., "aapl")                                                 |
| name            | TEXT      | Company name (e.g., "Apple Inc.")                                                |
| ticker          | TEXT      | Stock ticker symbol (e.g., "AAPL")                                               |
| investment_type | TEXT      | Type: "short-term", "long-term-appreciation", "dividend-growth", "high-dividend" |
| thesis          | TEXT      | Investment thesis (HTML from Tiptap editor)                                      |
| created_at      | INTEGER   | Timestamp when created                                                           |
| updated_at      | INTEGER   | Timestamp when last updated                                                      |

## Database Location

The SQLite database file is located at `./sqlite.db` and is excluded from version control via `.gitignore`.

## Drizzle Studio

To visually explore and edit your database, run:

```bash
npm run db:studio
```

This will open Drizzle Studio in your browser at `https://local.drizzle.studio`.
