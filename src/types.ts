import { MirrorFile } from "@dataverse/dataverse-connector";

export interface Model {
  modelName: string;
  internal: boolean;
  modelId: string;
  createdAt: number;
  schema: string;
  isPublicDomain: boolean;
  encryptable: Array<string>;
  version: number;
  latest: boolean;
}

export type EditorHandle = {
  newPost: Post;
};

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
  View = "View",
}

export interface ContentObject {
  appId: string;
  fileContent: { content: any; file: MirrorFile };
  modelId: string;
  pkh: string;
}
