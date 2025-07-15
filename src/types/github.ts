export interface GitHubDiscussion {
  id: string;
  number: number;
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
  reactionGroups: Array<{
    content: string;
    users: {
      totalCount: number;
    };
  }>;
  upvoteCount: number;
  comments: {
    totalCount: number;
  };
}