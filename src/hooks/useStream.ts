import { useState, useContext } from "react";
import { FileType, Currency, MirrorFile } from "@dataverse/runtime-connector";
import { Context } from "../main";
import { Model } from "../types";
import { getAddressFromPkh } from "../utils";
import { StreamContent } from "@dataverse/runtime-connector/dist/cjs/types/data-models/types";

export function useStream(appName: string) {
  const { runtimeConnector } = useContext(Context);

  const [contentRecord, setContentRecord] = useState<
    Record<string, MirrorFile>
  >({});

  const loadContent = async ({
    pkh,
    modelId,
  }: {
    pkh?: string;
    modelId: string;
  }) => {
    let streams;
    if (pkh) {
      streams = await runtimeConnector.loadStreamsBy({
        modelId,
        pkh,
      });
    } else {
      streams = await runtimeConnector.loadStreamsBy({
        modelId
      });
    }
    setContentRecord(streams);
    return streams;
  };

  const createPublicContent = async ({
    model,
    content,
  }: {
    pkh: string;
    model: Model;
    content?: object;
  }) => {
    let encrypted = {} as any;
    if (content && Object.keys(content).length > 0) {
      Object.keys(content).forEach((key) => {
        encrypted[key] = false;
      });
    }

    const streamContent = {
      ...content,
      ...(!model.isPublicDomain &&
        content && {
        encrypted: JSON.stringify(encrypted),
      }),
    }
    const { newFile, existingFile } =
      await runtimeConnector.createStream({
        modelId: model.stream_id,
        streamContent
      });

    if (!newFile && !existingFile) {
      throw "Failed to create content";
    }
    (existingFile || newFile)!.content = streamContent;

    const contentObject = {
      content: (existingFile || newFile)!,
      streamId: (existingFile || newFile)!.contentId!,
    };

    updateContentRecord({ contentObject, isCreate: true });

    return contentObject;
  };

  const createPrivateContent = async ({
    model,
    content,
    encrypted,
  }: {
    model: Model;
    content: object;
    encrypted: object;
  }) => {
    const streamContent = {
      ...content,
      ...(content && {
        encrypted: JSON.stringify(encrypted),
      }),
    }
    const { newFile } =
      await runtimeConnector.createStream({
        modelId: model.stream_id,
        streamContent
      });

    if (!newFile) {
      throw "Failed to create content";
    }

    newFile.content = streamContent;

    const contentObject = {
      content: newFile,
      streamId: newFile.contentId!,
    };

    updateContentRecord({ contentObject, isCreate: true });

    return contentObject;
  };

  const getProfileId = async ({
    pkh,
    lensNickName,
  }: {
    pkh: string;
    lensNickName?: string;
  }) => {
    const lensProfiles = await runtimeConnector.getProfiles(
      getAddressFromPkh(pkh)
    );

    let profileId;
    if (lensProfiles?.[0]?.id) {
      profileId = lensProfiles?.[0]?.id;
    } else {
      if (!lensNickName) {
        throw "Please pass in lensNickName";
      }
      if (!/^[\da-z]{5,26}$/.test(lensNickName) || lensNickName.length > 26) {
        throw "Only supports lower case characters, numbers, must be minimum of 5 length and maximum of 26 length";
      }
      profileId = await runtimeConnector.createProfile(lensNickName);
    }

    return profileId;
  };

  const createDatatokenContent = async ({
    pkh,
    model,
    content,
    lensNickName,
    currency,
    amount,
    collectLimit,
    encrypted,
  }: {
    pkh: string;
    model: Model;
    content: object;
    lensNickName?: string;
    currency: Currency;
    amount: number;
    collectLimit: number;
    encrypted: object;
  }) => {
    const profileId = await getProfileId({ pkh, lensNickName });

    const res = await createPublicContent({
      pkh,
      model,
      content: {
        ...content,
        text: "",
        images: [],
        videos: [],
      },
    });

    res.content.content = content;

    return monetizeContent({
      pkh,
      model,
      lensNickName,
      streamId: res.streamId,
      mirrorFile: res.content,
      profileId,
      encrypted,
      currency,
      amount,
      collectLimit,
    });
  };

  const monetizeContent = async ({
    pkh,
    model,
    streamId,
    lensNickName,
    profileId,
    mirrorFile,
    encrypted,
    currency,
    amount,
    collectLimit,
  }: {
    pkh: string;
    model: Model;
    streamId: string;
    lensNickName?: string;
    mirrorFile?: MirrorFile;
    profileId?: string;
    encrypted: object;
    currency: Currency;
    amount: number;
    collectLimit: number;
  }) => {
    if (!profileId) {
      profileId = await getProfileId({ pkh, lensNickName });
    }
    if (!mirrorFile) {
      mirrorFile = contentRecord[streamId];
    }

    let streamContent: StreamContent;
    let currentFile: MirrorFile;
    try {
      const res = await runtimeConnector.monetizeFile({
        datatokenVars: {
          profileId,
          currency,
          amount,
          collectLimit,
        }
      });
      streamContent = res.streamContent!;
      currentFile = res.currentFile;
    } catch (error: any) {
      console.log(error);
      if (
        error !==
        "networkConfigurationId undefined does not match a configured networkConfiguration"
      ) {
        await deleteContent({ pkh, content: mirrorFile });
      }
      throw error;
    }

    (mirrorFile.content as { encrypted: string }).encrypted =
      JSON.stringify(encrypted);
    (mirrorFile.content as { updatedAt: string }).updatedAt =
      new Date().toISOString();

    await runtimeConnector.updateStream({
      app: appName,
      streamId,
      streamContent,
      syncImmediately: true,
    });

    return {
      streamId,
      content: await reloadContentRecord({
        pkh,
        modelId: model.stream_id,
        streamId,
      }),
    };
  };

  const updateContentFromPublicToPrivate = async ({
    pkh,
    model,
    streamId,
    encrypted,
  }: {
    pkh: string;
    model: Model;
    streamId: string;
    encrypted: object;
  }) => {
    const streamContent = contentRecord[streamId]?.content;
    const res = await runtimeConnector.updateStream({
      app: appName,
      streamId,
      streamContent: {
        ...(!model.isPublicDomain &&
          streamContent && {
          encrypted: JSON.stringify(encrypted),
        }),
      },
      syncImmediately: true,
    });

    return {
      streamId,
      content: await reloadContentRecord({
        pkh,
        modelId: model.stream_id,
        streamId,
      }),
    };
  };

  const updateContent = async ({
    pkh,
    model,
    streamId,
    content,
    encrypted,
  }: {
    pkh: string;
    model: Model;
    streamId: string;
    content: object;
    encrypted?: object;
  }) => {
    const fileType = contentRecord[streamId]?.fileType;

    await runtimeConnector.updateStream({
      app: appName,
      streamId,
      streamContent: {
        ...content,
        ...(!model.isPublicDomain &&
          content &&
          encrypted &&
          (fileType === FileType.Private ||
            fileType === FileType.Datatoken) && {
          encrypted: JSON.stringify(encrypted),
        }),
      },
      syncImmediately: true,
    });

    return {
      streamId,
      content: await reloadContentRecord({
        pkh,
        modelId: model.stream_id,
        streamId,
      }),
    };
  };

  const unlockContent = async ({
    streamId,
  }: {
    pkh: string;
    streamId: string;
  }) => {
    const content = contentRecord[streamId];

    const res = await runtimeConnector.unlock({
      app: appName,
      streamId,
      indexFileId: content.indexFileId,
    });

    content.content = res;

    const contentObject = {
      streamId: content.contentId!,
      content: content.content,
    };

    return {
      streamId,
      content: updateContentRecord({ contentObject }),
    };
  };

  // Only files within the file system can be deleted, and records in contentRecord cannot be deleted
  const deleteContent = async ({
    content,
  }: {
    pkh: string;
    content: MirrorFile;
  }) => {
    const res = await runtimeConnector.removeFiles({
      app: appName,
      indexFileIds: [content.indexFileId],
    });
    return res;
  };

  const editProfileContent = async ({
    pkh,
    model,
    content,
  }: {
    pkh: string;
    model: Model;
    content: object;
  }) => {
    const { streamId, content: mirrorFile } = await createPublicContent({
      pkh,
      model,
    });

    const { streamContent } = await runtimeConnector.updateStream({
      app: appName,
      streamId,
      streamContent: content,
      syncImmediately: true,
    });

    mirrorFile.content = streamContent;

    const contentObject = { streamId, content: mirrorFile };

    updateContentRecord({ contentObject, isCreate: true });

    return contentObject;
  };

  const reloadContentRecord = async ({
    pkh,
    modelId,
    streamId,
  }: {
    pkh: string;
    modelId: string;
    streamId: string;
  }) => {
    const contentRecord = await loadContent({ pkh, modelId });

    setContentRecord(contentRecord);

    return contentRecord[streamId];
  };

  const updateContentRecord = ({
    contentObject: { streamId, content },
    isCreate,
  }: {
    contentObject: {
      streamId: string;
      content: MirrorFile | object;
    };
    isCreate?: boolean;
  }) => {
    const contentRecordCopy = JSON.parse(
      JSON.stringify(contentRecord)
    ) as Record<string, MirrorFile>;
    if (isCreate) {
      contentRecordCopy[streamId] = content as MirrorFile;
    } else {
      contentRecordCopy[streamId].content = content as object;
    }

    setContentRecord(contentRecordCopy);

    return contentRecordCopy[streamId];
  };

  return {
    contentRecord,
    loadContent,
    createPublicContent,
    createPrivateContent,
    createDatatokenContent,
    monetizeContent,
    unlockContent,
    updateContent,
    updateContentFromPublicToPrivate,
    editProfileContent,
  };
}
