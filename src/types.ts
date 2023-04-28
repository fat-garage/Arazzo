export interface Model {
  name: string;
  stream_id: string;
  isPublicDomain: boolean;
}

export type EditorHandle = {
  newPost: Post;
}

export interface Post {
  author: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  category: string;
  tag: string[];
  plainText: string;
  randomUUID: string;
}

export enum Mode {
  Edit = "Edit",
  View = "View"
}
