import { useState, useContext } from "react";
import {
  FileType,
  Currency,
  MirrorFile,
  SYSTEM_CALL,
} from "@dataverse/dataverse-connector";
import { Context } from "../main";
import { Model, ContentObject } from "../types";
import { getAddressFromDid } from "../utils";

export function useContent() {
  const { dataverseConnector } = useContext(Context);

  const [contentRecord, setContentRecord] = useState<
    Record<string, ContentObject>
  >({});

  const loadContents = async ({
    did,
    modelId,
  }: {
    did?: string;
    modelId: string;
  }) => {
    let streams;
    if (did) {
      streams = await dataverseConnector.runOS({
        method: SYSTEM_CALL.loadFilesBy,
        params: {
          pkh: did,
          modelId,
        },
      });
    } else {
      streams = await dataverseConnector.runOS({
        method: SYSTEM_CALL.loadFilesBy,
        params: {
          modelId,
        },
      });
    }
    setContentRecord(streams);
    return streams;
  };

  const createPublicContent = async ({
    model,
    content,
  }: {
    model: Model;
    content?: object;
  }) => {
    let encrypted = {} as any;
    if (content && Object.keys(content).length > 0) {
      Object.keys(content).forEach((key) => {
        encrypted[key] = false;
      });
    }
    const res = await dataverseConnector.runOS({
      method: SYSTEM_CALL.createIndexFile,
      params: {
        modelId: model.modelId,
        fileName: "Arazzo",
        fileContent: {
          ...content,
          // ...(!model.isPublicDomain &&
          //   content && {
          //     encrypted: JSON.stringify(encrypted),
          //   }),
        },
      },
    });

    updateContentRecord(res);

    return res;
  };

  const updateContent = async ({
    did,
    model,
    contentId,
    content,
    encrypted,
  }: {
    did: string;
    model: Model;
    contentId: string;
    content: object;
    encrypted?: object;
  }) => {
    const fileType = contentRecord[contentId]?.fileContent.file.fileType;
    const fileId = contentRecord[contentId]?.fileContent.file.fileId;

    const res = await dataverseConnector.runOS({
      method: SYSTEM_CALL.updateIndexFile,
      params: {
        fileId,
        fileContent: {
          ...content,
          // ...(!model.isPublicDomain &&
          //   content &&
          //   encrypted &&
          //   (fileType === FileType.PrivateFileType ||
          //     fileType === FileType.PayableFileType) && {
          //     encrypted: JSON.stringify(encrypted),
          //   }),
          syncImmediately: true,
        },
      },
    });

    return {
      contentId,
      content: await reloadContentRecord({
        did,
        modelId: model.modelId,
        contentId,
      }),
    };
  };

  // Only files within the file system can be deleted, and records in contentRecord cannot be deleted
  const deleteContent = async (content: MirrorFile) => {
    const res = await dataverseConnector.runOS({
      method: SYSTEM_CALL.removeFiles,
      params: {
        fileIds: [content.fileId],
      },
    });
    return res;
  };

  const reloadContentRecord = async ({
    did,
    modelId,
    contentId,
  }: {
    did: string;
    modelId: string;
    contentId: string;
  }) => {
    const contentRecord = await loadContents({ did, modelId });

    setContentRecord(contentRecord);

    return contentRecord[contentId];
  };

  const updateContentRecord = (contentObject: ContentObject) => {
    const contentId = contentObject.fileContent.file.contentId;
    const contentRecordCopy = JSON.parse(
      JSON.stringify(contentRecord)
    ) as Record<
      string,
      {
        appId: string;
        fileContent: {
          content: any;
          file: MirrorFile;
        };
        modelId: string;
        pkh: string;
      }
    >;

    contentRecordCopy[contentId] = contentObject;

    setContentRecord(contentRecordCopy);

    return contentRecordCopy[contentId];
  };

  const loadContent = async (contentId: string) => {
    const stream = await dataverseConnector.runOS({
      method: SYSTEM_CALL.loadFile,
      params: contentId,
    });

    return stream;
  };

  return {
    contentRecord,
    loadContents,
    loadContent,
    createPublicContent,
    updateContent,
    deleteContent,
  };
}
