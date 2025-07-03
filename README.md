# Share Kilo Love

An Astro project that serves as a CMS backend for GitHub discussions from the Kilo community.

## Features

- **GitHub Discussions API**: Server-side API endpoint that fetches discussions from the "built-with-kilo" category
- **Vercel Deployment**: Configured for serverless deployment on Vercel
- **TypeScript Support**: Full TypeScript support with proper type definitions
- **Caching**: API responses are cached for 5 minutes to improve performance

## Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure GitHub Token**:
   - Copy `.env.example` to `.env`
   - Create a GitHub Personal Access Token at https://github.com/settings/tokens
   - Required scopes: `public_repo` (for accessing public repositories)
   - Add your token to the `.env` file:
     ```
     GITHUB_TOKEN=your_github_token_here
     ```

3. **Development**:
   ```bash
   pnpm dev
   ```

4. **Build for production**:
   ```bash
   pnpm build
   ```

## API Endpoints

### GET `/api/discussions`

Fetches GitHub discussions from the "built-with-kilo" category.

**Query Parameters:**
- `limit` (optional): Number of discussions to fetch (default: 10, max: 100)
- `after` (optional): Cursor for pagination (use `pageInfo.endCursor` from previous response)

**Response:**
```json
{
  "discussions": [
    {
      "id": "string",
      "title": "string",
      "body": "string",
      "bodyHTML": "string",
      "url": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "author": {
        "login": "string",
        "avatarUrl": "string",
        "url": "string"
      },
      "category": {
        "id": "string",
        "name": "string",
        "slug": "string"
      },
      "labels": {
        "nodes": [
          {
            "id": "string",
            "name": "string",
            "color": "string"
          }
        ]
      },
      "reactions": {
        "totalCount": 0
      },
      "comments": {
        "totalCount": 0
      }
    }
  ],
  "pageInfo": {
    "hasNextPage": false,
    "endCursor": "string"
  },
  "total": 0
}
```

**Example Usage:**
```javascript
// Fetch first 5 discussions
const response = await fetch('/api/discussions?limit=5');
const data = await response.json();

// Pagination
const nextPage = await fetch(`/api/discussions?limit=5&after=${data.pageInfo.endCursor}`);
```

## Testing

Visit `/test-api` in your browser to test the API endpoint with a simple interface.

## Deployment

This project is configured for Vercel deployment:

1. Connect your repository to Vercel
2. Set the `GITHUB_TOKEN` environment variable in your Vercel project settings
3. Deploy!

The API will be available at `https://your-domain.vercel.app/api/discussions`

## Project Structure

```
src/
├── pages/
│   ├── api/
│   │   └── discussions.ts    # GitHub discussions API endpoint
│   ├── test-api.astro        # API testing page
│   └── index.astro           # Main page
├── components/               # React/Astro components
├── layouts/                  # Page layouts
└── styles/                   # Global styles
```

## Environment Variables

- `GITHUB_TOKEN`: GitHub Personal Access Token with `public_repo` scope

## Tech Stack

- **Astro**: Static site generator with server-side rendering
- **React**: UI components
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Vercel**: Deployment platform
- **GitHub GraphQL API**: Data source
