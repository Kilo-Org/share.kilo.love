# DiscussionCards Component

An Astro component that displays GitHub discussions in a beautiful card layout.

## Usage

```astro
---
import DiscussionCards from '../components/DiscussionCards.astro';

// Fetch discussions from your API
const response = await fetch('/api/discussions');
const data = await response.json();
const discussions = data.discussions || [];
---

<DiscussionCards discussions={discussions} />
```

## Props

### `discussions` (required)
An array of GitHub discussion objects with the following structure:

```typescript
interface GitHubDiscussion {
  id: string;
  title: string;
  body: string;
  bodyHTML: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  author: {
    login: string;
    avatarUrl: string;
    url: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  labels: {
    nodes: Array<{
      id: string;
      name: string;
      color: string;
    }>;
  };
  reactions: {
    totalCount: number;
  };
  comments: {
    totalCount: number;
  };
}
```

## Features

- **Responsive Design**: Adapts to different screen sizes with a 3-column grid on large screens
- **Image Extraction**: Automatically extracts the first image from discussion content
- **Placeholder Support**: Shows a default placeholder image when no images are found
- **Label Display**: Shows the first label from GitHub with appropriate styling
- **Author Information**: Displays author avatar, username, and additional context
- **Date Formatting**: Formats creation dates in a readable format
- **External Links**: All links open in new tabs with proper security attributes
- **Empty State**: Shows a helpful message when no discussions are available

## Styling

The component uses Tailwind CSS classes and follows the design system established in the project. Key styling features:

- Cards with rounded corners and subtle shadows
- Hover effects on titles and author names
- Responsive image aspect ratios
- Color-coded labels based on GitHub label colors
- Clean typography hierarchy

## Examples

See `/demo` and `/discussions` pages for live examples of the component in action.