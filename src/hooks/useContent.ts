import { useState, useContext } from "react";
import { FileType, Currency, MirrorFile } from "@dataverse/runtime-connector";
import { Context } from "../main";
import { Model } from "../types";
import { getAddressFromDid } from "../utils";

export function useContent(appName: string) {
  const { runtimeConnector } = useContext(Context);

  const [contentRecord, setContentRecord] = useState<
    Record<string, MirrorFile>
  >({});

  const loadContent = async ({
    did,
    modelName,
  }: {
    did?: string;
    modelName: string;
  }) => {
    let streams;
    if (did) {
      streams = await runtimeConnector.loadStreamsByModelAndDID({
        did,
        appName,
        modelName,
      });
    } else {
      streams = await runtimeConnector.loadStreamsByModel({
        appName,
        modelName,
      });
    }
    setContentRecord(streams);
    return streams;
  };

  const createPublicContent = async ({
    did,
    model,
    content,
  }: {
    did: string;
    model: Model;
    content?: object;
  }) => {
    let encrypted = {} as any;
    if (content && Object.keys(content).length > 0) {
      Object.keys(content).forEach((key) => {
        encrypted[key] = false;
      });
    }
    const { streamContent, streamId, newMirror, existingMirror } =
      await runtimeConnector.createStream({
        did,
        appName,
        modelName: model.name,
        streamContent: {
          ...content,
          ...(!model.isPublicDomain &&
            content && {
              encrypted: JSON.stringify(encrypted),
            }),
        },
        fileType: FileType.Public,
      });

    if (!newMirror && !existingMirror) {
      throw "Failed to create content";
    }
    (existingMirror || newMirror)!.mirrorFile.content = streamContent;

    const contentObject = {
      content: (existingMirror || newMirror)!.mirrorFile,
      contentId: streamId,
    };

    updateContentRecord({ contentObject, isCreate: true });

    return contentObject;
  };

  const createPrivateContent = async ({
    did,
    model,
    content,
    encrypted,
  }: {
    did: string;
    model: Model;
    content: object;
    encrypted: object;
  }) => {
    const { streamContent, streamId, newMirror } =
      await runtimeConnector.createStream({
        did,
        appName,
        modelName: model.name,
        streamContent: {
          ...content,
          ...(content && {
            encrypted: JSON.stringify(encrypted),
          }),
        },
        fileType: FileType.Private,
      });

    if (!newMirror) {
      throw "Failed to create content";
    }

    newMirror.mirrorFile.content = streamContent;

    const contentObject = {
      content: newMirror.mirrorFile,
      contentId: streamId,
    };

    updateContentRecord({ contentObject, isCreate: true });

    return contentObject;
  };

  const getProfileId = async ({
    did,
    lensNickName,
  }: {
    did: string;
    lensNickName?: string;
  }) => {
    const lensProfiles = await runtimeConnector.getLensProfiles(
      getAddressFromDid(did)
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
      profileId = await runtimeConnector.createLensProfile(lensNickName);
    }

    return profileId;
  };

  const createDatatokenContent = async ({
    did,
    model,
    content,
    lensNickName,
    currency,
    amount,
    collectLimit,
    encrypted,
  }: {
    did: string;
    model: Model;
    content: object;
    lensNickName?: string;
    currency: Currency;
    amount: number;
    collectLimit: number;
    encrypted: object;
  }) => {
    const profileId = await getProfileId({ did, lensNickName });

    const res = await createPublicContent({
      did,
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
      did,
      model,
      lensNickName,
      contentId: res.contentId,
      mirrorFile: res.content,
      profileId,
      encrypted,
      currency,
      amount,
      collectLimit,
    });
  };

  const monetizeContent = async ({
    did,
    model,
    contentId,
    lensNickName,
    profileId,
    mirrorFile,
    encrypted,
    currency,
    amount,
    collectLimit,
  }: {
    did: string;
    model: Model;
    contentId: string;
    lensNickName?: string;
    mirrorFile?: MirrorFile;
    profileId?: string;
    encrypted: object;
    currency: Currency;
    amount: number;
    collectLimit: number;
  }) => {
    let datatokenId;
    if (!profileId) {
      profileId = await getProfileId({ did, lensNickName });
    }
    if (!mirrorFile) {
      mirrorFile = contentRecord[contentId];
    }

    try {
      const datatoken = await runtimeConnector.createDatatoken({
        profileId,
        streamId: mirrorFile.indexFileId,
        currency,
        amount,
        collectLimit,
      });
      datatokenId = datatoken.datatokenId;
    } catch (error: any) {
      console.log(error);
      if (
        error !==
        "networkConfigurationId undefined does not match a configured networkConfiguration"
      ) {
        await deleteContent({ did, content: mirrorFile });
      }
      throw error;
    }

    (mirrorFile.content as { encrypted: string }).encrypted =
      JSON.stringify(encrypted);
    (mirrorFile.content as { updatedAt: string }).updatedAt =
      new Date().toISOString();

    const res = await runtimeConnector.updateStreams({
      streamsRecord: {
        [contentId]: {
          streamContent: mirrorFile.content,
          fileType: FileType.Datatoken,
          ...(datatokenId && { datatokenId }),
        },
      },
      syncImmediately: true,
    });

    if (!res?.successRecord?.[contentId]) {
      throw {
        failureRecord: res?.failureRecord,
        failureReason: res?.failureReason,
      };
    }

    return {
      contentId,
      content: await reloadContentRecord({
        did,
        modelName: model.name,
        contentId,
      }),
    };
  };

  const updateContent = async ({
    did,
    model,
    contentId,
    content,
  }: {
    did: string;
    model: Model;
    contentId: string;
    content: object;
  }) => {
    const res = await runtimeConnector.updateStreams({
      streamsRecord: {
        [contentId]: { streamContent: content },
      },
      syncImmediately: true,
    });

    if (!res?.successRecord?.[contentId]) {
      throw {
        failureRecord: res?.failureRecord,
        failureReason: res?.failureReason,
      };
    }

    return {
      contentId,
      content: await reloadContentRecord({
        did,
        modelName: model.name,
        contentId,
      }),
    };
  };

  const unlockContent = async ({
    did,
    contentId,
  }: {
    did: string;
    contentId: string;
  }) => {
    const content = contentRecord[contentId];

    const res = await runtimeConnector.unlock({
      did,
      appName,
      indexFileId: content.indexFileId,
    });

    content.content = res;

    const contentObject = {
      contentId: content.contentId!,
      content: content.content,
    };

    return {
      contentId,
      content: updateContentRecord({ contentObject }),
    };
  };

  // Only files within the file system can be deleted, and records in contentRecord cannot be deleted
  const deleteContent = async ({
    did,
    content,
  }: {
    did: string;
    content: MirrorFile;
  }) => {
    const res = await runtimeConnector.removeMirrors({
      did,
      appName,
      mirrorIds: [content.indexFileId],
    });
    return res;
  };

  const editProfileContent = async ({
    did,
    model,
    content,
  }: {
    did: string;
    model: Model;
    content: object;
  }) => {
    const { contentId, content: mirrorFile } = await createPublicContent({
      did,
      model,
    });

    const res = await runtimeConnector.updateStreams({
      streamsRecord: {
        [contentId]: { streamContent: content },
      },
      syncImmediately: true,
    });

    if (!res?.successRecord?.[contentId]) {
      throw {
        failureRecord: res?.failureRecord,
        failureReason: res?.failureReason,
      };
    }

    mirrorFile.content = res.successRecord[contentId];

    const contentObject = { contentId, content: mirrorFile };

    updateContentRecord({ contentObject, isCreate: true });

    return contentObject;
  };

  const reloadContentRecord = async ({
    did,
    modelName,
    contentId,
  }: {
    did: string;
    modelName: string;
    contentId: string;
  }) => {
    const contentRecord = await loadContent({ did, modelName });

    setContentRecord(contentRecord);

    return contentRecord[contentId];
  };

  const updateContentRecord = ({
    contentObject: { contentId, content },
    isCreate,
  }: {
    contentObject: {
      contentId: string;
      content: MirrorFile | object;
    };
    isCreate?: boolean;
  }) => {
    const contentRecordCopy = JSON.parse(
      JSON.stringify(contentRecord)
    ) as Record<string, MirrorFile>;
    if (isCreate) {
      contentRecordCopy[contentId] = content as MirrorFile;
    } else {
      contentRecordCopy[contentId].content = content as object;
    }

    setContentRecord(contentRecordCopy);

    return contentRecordCopy[contentId];
  };

  return {
    contentRecord,
    loadContent,
    createPublicContent,
    createPrivateContent,
    createDatatokenContent,
    updateContent,
    monetizeContent,
    unlockContent,
    editProfileContent,
  };
}
