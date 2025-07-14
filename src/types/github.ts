export interface GitHubDiscussion {
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