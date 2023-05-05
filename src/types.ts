export interface Model {
  name: string;
  stream_id: string;
  isPublicDomain: boolean;
}

export type EditorHandle = {
  newPost: Post;
}

export interface Post {
  appVersion?: string;
  author?: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  category: string[];
  tag: string[];
  plainText: string;
  randomUUID: string;
  isDefault?: boolean;
}

export enum Mode {
  Edit = "Edit",
  View = "View"
}
