import type { APIRoute } from 'astro';
import type { GitHubDiscussion } from '../../types/github';

interface GitHubResponse {
  data: {
    repository: {
      discussions: {
        nodes: GitHubDiscussion[];
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string | null;
        };
      };
    };
  };
}

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const REPO_OWNER = 'Kilo-Org';
const REPO_NAME = 'kilocode';
const CATEGORY_SLUG = 'built-with-kilo';

const DISCUSSIONS_QUERY = `
  query GetDiscussions($owner: String!, $name: String!, $categoryId: ID, $first: Int!, $after: String) {
    repository(owner: $owner, name: $name) {
      discussions(first: $first, after: $after, categoryId: $categoryId, orderBy: {field: CREATED_AT, direction: DESC}) {
        nodes {
          id
          title
          body
          bodyHTML
          url
          createdAt
          updatedAt
          author {
            login
            avatarUrl
            url
          }
          category {
            id
            name
            slug
          }
          labels(first: 10) {
            nodes {
              id
              name
              color
            }
          }
          reactions {
            totalCount
          }
          comments {
            totalCount
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

// Query to get the category ID from the slug
const GET_CATEGORY_ID_QUERY = `
  query GetCategoryId($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      discussionCategories(first: 25) {
        nodes {
          id
          name
          slug
        }
      }
    }
  }
`;

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const after = url.searchParams.get('after') || null;

    // Check for GitHub token in environment variables
    const githubToken = import.meta.env.GITHUB_TOKEN;
    if (!githubToken) {
      return new Response(
        JSON.stringify({
          error: 'GitHub token not configured. Please set GITHUB_TOKEN environment variable.'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // First, get the category ID for "built-with-kilo"
    const categoryResponse = await fetch(GITHUB_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'share-kilo-love-api'
      },
      body: JSON.stringify({
        query: GET_CATEGORY_ID_QUERY,
        variables: {
          owner: REPO_OWNER,
          name: REPO_NAME
        }
      })
    });

    if (!categoryResponse.ok) {
      throw new Error(`GitHub API responded with status: ${categoryResponse.status}`);
    }

    const categoryData: any = await categoryResponse.json();

    // Check for GraphQL errors
    if (categoryData.errors) {
      console.error('GraphQL errors:', categoryData.errors);
      throw new Error(`GraphQL errors: ${categoryData.errors.map((e: any) => e.message).join(', ')}`);
    }

    // Find the "built-with-kilo" category ID
    const categories = categoryData.data?.repository?.discussionCategories?.nodes || [];
    const targetCategory = categories.find((cat: any) => cat.slug === CATEGORY_SLUG);
    
    if (!targetCategory) {
      return new Response(
        JSON.stringify({
          discussions: [],
          pageInfo: { hasNextPage: false, endCursor: null },
          total: 0,
          error: `Category "${CATEGORY_SLUG}" not found in repository`
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300'
          }
        }
      );
    }

    // Now fetch discussions for this specific category
    const discussionsResponse = await fetch(GITHUB_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'share-kilo-love-api'
      },
      body: JSON.stringify({
        query: DISCUSSIONS_QUERY,
        variables: {
          owner: REPO_OWNER,
          name: REPO_NAME,
          categoryId: targetCategory.id,
          first: Math.min(limit, 100), // GitHub API limit
          after
        }
      })
    });

    if (!discussionsResponse.ok) {
      throw new Error(`GitHub API responded with status: ${discussionsResponse.status}`);
    }

    const discussionsData: any = await discussionsResponse.json();

    // Check for GraphQL errors
    if (discussionsData.errors) {
      console.error('GraphQL errors:', discussionsData.errors);
      throw new Error(`GraphQL errors: ${discussionsData.errors.map((e: any) => e.message).join(', ')}`);
    }

    if (discussionsData.data?.repository?.discussions) {
      const discussions = discussionsData.data.repository.discussions.nodes;
      const pageInfo = discussionsData.data.repository.discussions.pageInfo;

      return new Response(
        JSON.stringify({
          discussions,
          pageInfo,
          total: discussions.length,
          categoryInfo: {
            id: targetCategory.id,
            name: targetCategory.name,
            slug: targetCategory.slug
          }
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
          }
        }
      );
    } else {
      console.error('Unexpected response structure:', discussionsData);
      throw new Error(`Invalid response structure from GitHub API. Response: ${JSON.stringify(discussionsData)}`);
    }

  } catch (error) {
    console.error('Error fetching GitHub discussions:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch discussions',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};