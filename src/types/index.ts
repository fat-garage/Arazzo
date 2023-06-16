import { StreamContent } from "@dataverse/runtime-connector";

export interface Model {
  name: string;
  stream_id: string;
  isPublicDomain: boolean;
  encryptable?: string[];
}

export interface Output {
  createDapp: {
    id: string;
    streamIDs: Model[];
    website: string;
    name: string;
    slug: string;
    logo: string;
    description: string;
    defaultFolderName: string;
  };
}

export interface StreamsRecord {
  [streamId: string]: StreamRecord;
}

export interface StreamRecord {
  app: string;
  pkh: string;
  modelId: string;
  streamContent: StreamContent;
}


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
  uid: string;
  isDefault?: boolean;
}

export enum Mode {
  Edit = "Edit",
  View = "View"
}