import type { APIRoute } from 'astro';
import type { GitHubDiscussion } from '../../../../types/github';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const REPO_OWNER = 'Kilo-Org';
const REPO_NAME = 'kilocode';

const DISCUSSION_BY_NUMBER_QUERY = `
  query GetDiscussionByNumber($owner: String!, $name: String!, $number: Int!) {
    repository(owner: $owner, name: $name) {
      discussion(number: $number) {
        id
        number
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
        reactionGroups {
          content
          users {
            totalCount
          }
        }
        comments {
          totalCount
        }
      }
    }
  }
`;

export const GET: APIRoute = async ({ params }) => {
  try {
    const { number } = params;
    
    if (!number) {
      return new Response(
        JSON.stringify({
          error: 'Discussion number is required'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const discussionNumber = parseInt(number, 10);
    if (isNaN(discussionNumber)) {
      return new Response(
        JSON.stringify({
          error: 'Discussion number must be a valid integer'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

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

    // Fetch the specific discussion by number
    const discussionResponse = await fetch(GITHUB_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'share-kilo-love-api'
      },
      body: JSON.stringify({
        query: DISCUSSION_BY_NUMBER_QUERY,
        variables: {
          owner: REPO_OWNER,
          name: REPO_NAME,
          number: discussionNumber
        }
      })
    });

    if (!discussionResponse.ok) {
      throw new Error(`GitHub API responded with status: ${discussionResponse.status}`);
    }

    const discussionData: any = await discussionResponse.json();

    // Check for GraphQL errors
    if (discussionData.errors) {
      console.error('GraphQL errors:', discussionData.errors);
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch discussion',
          message: discussionData.errors.map((e: any) => e.message).join(', ')
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const discussion = discussionData.data?.repository?.discussion;
    
    if (!discussion) {
      return new Response(
        JSON.stringify({
          error: 'Discussion not found',
          message: `No discussion found with number: ${number}`
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify this is from the "built-with-kilo" category
    if (discussion.category?.slug !== 'built-with-kilo') {
      return new Response(
        JSON.stringify({
          error: 'Discussion not found',
          message: 'Discussion is not in the built-with-kilo category'
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        discussion
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
        }
      }
    );

  } catch (error) {
    console.error('Error fetching GitHub discussion:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch discussion',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};