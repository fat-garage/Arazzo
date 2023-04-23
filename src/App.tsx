import "./App.css";
import React, { useState, useEffect } from "react";
import { Currency, FileType, MirrorFile } from "@dataverse/runtime-connector";
import app from "../output/app.json";
import { useContent } from "./hooks/useContent";
import { useIdentity } from "./hooks/useIdentity";
import { Model } from "./types";
import ReactJson from "react-json-view";

function App() {
  const postVersion = "0.0.1";
  const [postModel, setPostModel] = useState<Model>({
    name: "",
    stream_id: "",
    isPublicDomain: false,
  });
  const [profileModel, setProfileModel] = useState<Model>({
    name: "",
    stream_id: "",
    isPublicDomain: false,
  });

  // Indicates a certain content to be operated on currently
  const [currentContentId, setCurrentContentId] = useState<string>();
  const [publicPost, setPublicPost] = useState<MirrorFile>();
  const [privatePost, setPrivatePost] = useState<MirrorFile>();
  const [datatokenPost, setDatatokenPost] = useState<MirrorFile>();
  const [monetizedPost, setMonetizedPost] = useState<MirrorFile>();
  const [unlockedPost, setUnlockedPost] = useState<MirrorFile>();
  const [encryptedPost, setEncryptedPost] = useState<MirrorFile>();
  const [decryptedPost, setDecryptedPost] = useState<MirrorFile>();
  const [updatedPost, setUpdatedPost] = useState<MirrorFile>();
  const [posts, setPosts] = useState<MirrorFile[]>(); // All posts
  const [profile, setProfile] = useState<MirrorFile>();

  const { did, connectIdentity } = useIdentity();

  const {
    contentRecord: postContentRecord,
    loadContent: loadPostContent,
    createPublicContent,
    createPrivateContent,
    createDatatokenContent,
    monetizeContent,
    unlockContent,
    updateContentFromPrivateToPublic,
    updateContentFromPublicToPrivate,
    updateContent,
  } = useContent(app.createDapp.name);

  const { loadContent: loadProfileContent, editProfileContent } = useContent(
    app.createDapp.name
  );

  useEffect(() => {
    setPostModel(
      app.createDapp.streamIDs.find(
        (model) => model.name === `${app.createDapp.slug}_post`
      ) as Model
    );
    setProfileModel(
      app.createDapp.streamIDs.find(
        (model) => model.name === `${app.createDapp.slug}_profile`
      ) as Model
    );
  }, []);

  /*** Identity ***/
  const connect = async () => {
    const did = await connectIdentity();
    return did;
  };

  /*** Identity ***/

  /*** Post ***/
  const createPublicPost = async () => {
    const date = new Date().toISOString();
    const res = await createPublicContent({
      did,
      model: postModel,
      content: {
        appVersion: postVersion,
        text: "hello",
        images: [
          "https://bafkreib76wz6wewtkfmp5rhm3ep6tf4xjixvzzyh64nbyge5yhjno24yl4.ipfs.w3s.link",
        ],
        videos: [],
        createdAt: date,
        updatedAt: date,
      },
    });

    setCurrentContentId(res.contentId);
    setPublicPost(res.content);
    console.log(res);
  };

  const createPrivatePost = async () => {
    const date = new Date().toISOString();
    const res = await createPrivateContent({
      did,
      model: postModel,
      content: {
        appVersion: postVersion,
        text: "hello",
        images: [
          "https://bafkreib76wz6wewtkfmp5rhm3ep6tf4xjixvzzyh64nbyge5yhjno24yl4.ipfs.w3s.link",
        ],
        videos: [],
        createdAt: date,
        updatedAt: date,
      },
      encrypted: {
        text: true,
        images: true,
        videos: false,
      },
    });
    setCurrentContentId(res.contentId);
    setPrivatePost(res.content);
    console.log(res);
  };

  const createDatatokenPost = async () => {
    const date = new Date().toISOString();
    const res = await createDatatokenContent({
      did,
      model: postModel,
      content: {
        appVersion: postVersion,
        text: "metaverse",
        images: [
          "https://bafkreidhjbco3nh4uc7wwt5c7auirotd76ch6hlzpps7bwdvgckflp7zmi.ipfs.w3s.link/",
        ],
        videos: [],
        createdAt: date,
        updatedAt: date,
      },
      lensNickName: "luketheskywalker1", //Only supports lower case characters, numbers, must be minimum of 5 length and maximum of 26 length
      currency: Currency.WMATIC,
      amount: 0.0001,
      collectLimit: 1000,
      encrypted: {
        text: true,
        images: true,
        videos: false,
      },
    });
    setCurrentContentId(res.contentId);
    setDatatokenPost(res.content);
    console.log(res);
  };

  const monetizePost = async () => {
    if (!currentContentId) {
      return;
    }
    const res = await monetizeContent({
      did,
      model: postModel,
      contentId: currentContentId,
      lensNickName: "jackieth", //Only supports lower case characters, numbers, must be minimum of 5 length and maximum of 26 length
      currency: Currency.WMATIC,
      amount: 0.0001,
      collectLimit: 1000,
      encrypted: {
        text: true,
        images: true,
        videos: false,
      },
    });
    console.log(res);
    setMonetizedPost(res.content);
  };

  const unlockPost = async () => {
    if (!currentContentId) {
      return;
    }
    const res = await unlockContent({
      did,
      contentId: currentContentId,
    });
    console.log(res);
    setUnlockedPost(res.content);
  };

  const updatePostFromPrivateToPublic = async () => {
    if (!currentContentId) {
      return;
    }
    const res = await updateContentFromPrivateToPublic({
      did,
      model: postModel,
      contentId: currentContentId,
    });
    console.log(res);
    setDecryptedPost(res.content);
  };

  const updatePostFromPublicToPrivate = async () => {
    if (!currentContentId) {
      return;
    }
    const res = await updateContentFromPublicToPrivate({
      did,
      model: postModel,
      contentId: currentContentId,
      encrypted: {
        text: true,
        images: true,
        videos: false,
      },
    });
    console.log(res);
    setEncryptedPost(res.content);
  };

  const updatePost = async () => {
    if (!currentContentId) {
      return;
    }
    const content = postContentRecord[currentContentId];

    const res = await updateContent({
      did,
      model: postModel,
      contentId: currentContentId,
      content: {
        text: "update my post -- " + new Date().toISOString(),
        images: [
          "https://bafkreidhjbco3nh4uc7wwt5c7auirotd76ch6hlzpps7bwdvgckflp7zmi.ipfs.w3s.link",
        ],
      },
      ...((content.fileType === FileType.Private ||
        content.fileType === FileType.Datatoken) && {
        encrypted: { text: true, images: true, videos: false },
      }),
    });
    console.log(res);
    setUpdatedPost(res.content);
  };

  const loadPosts = async () => {
    const postRecord = await loadPostContent({
      did,
      modelName: postModel.name,
    });
    console.log(postRecord);
    setPosts(Object.values(postRecord));
    // Object.entries(postRecord).find(([contentId, content]) => {
    //   if (
    //     content.fileType === FileType.Datatoken ||
    //     content.fileType === FileType.Private
    //   ) {
    //     setCurrentContentId(contentId);
    //   }
    // });
  };

  /*** Post ***/

  /*** Profile ***/
  const loadProfile = async () => {
    const res = await loadProfileContent({
      did,
      modelName: profileModel.name,
    });
    console.log(res);
    setProfile(Object.values(res)[0]);
  };

  const editProfile = async () => {
    const res = await editProfileContent({
      did,
      model: profileModel,
      content: {
        name: "Jackie",
        description: "A web3 developer",
        image:
          "https://i.seadn.io/gcs/files/4df295e05429b6e56e59504b7e9650b6.gif?w=500&auto=format",
        background:
          "https://i.seadn.io/gae/97v7uBu0TGycl_CT73Wds8T22sqLZISSszf4f4mCrPEv5yOLn840HZU4cIyEc9WNpxXhjcyKSKdTuqH7svb3zBfl1ixVtX5Jtc3VzA?w=500&auto=format",
      },
    });
    console.log(res);
    setProfile(res.content);
  };

  /*** Profile ***/

  return (
    <div className="App">
      <button onClick={connect}>connect</button>
      <div className="blackText">{did}</div>
      <hr />
      <button onClick={createPublicPost}>createPublicPost</button>
      {publicPost && (
        <div className="json-view">
          <ReactJson src={publicPost} collapsed={true} />
        </div>
      )}
      <button onClick={createPrivatePost}>createPrivatePost</button>
      {privatePost && (
        <div className="json-view">
          <ReactJson src={privatePost} collapsed={true} />
        </div>
      )}
      <button onClick={createDatatokenPost}>createDatatokenPost</button>
      {datatokenPost && (
        <div className="json-view">
          <ReactJson src={datatokenPost} collapsed={true} />
        </div>
      )}
      <div className="red">
        You need a testnet lens profile to monetize data.
      </div>
      <button onClick={monetizePost}>monetizePost</button>
      {monetizedPost && (
        <div className="json-view">
          <ReactJson src={monetizedPost} collapsed={true} />
        </div>
      )}
      <button onClick={unlockPost}>unlockPost</button>
      {unlockedPost && (
        <div className="json-view">
          <ReactJson src={unlockedPost} collapsed={true} />
        </div>
      )}
      <button onClick={updatePostFromPublicToPrivate}>
        updatePostFromPublicToPrivate
      </button>
      {encryptedPost && (
        <div className="json-view">
          <ReactJson src={encryptedPost} collapsed={true} />
        </div>
      )}
      <button onClick={updatePostFromPrivateToPublic}>
        updatePostFromPrivateToPublic
      </button>
      {decryptedPost && (
        <div className="json-view">
          <ReactJson src={decryptedPost} collapsed={true} />
        </div>
      )}
      <button onClick={updatePost}>updatePost</button>
      {updatedPost && (
        <div className="json-view">
          <ReactJson src={updatedPost} collapsed={true} />
        </div>
      )}
      <button onClick={loadPosts}>loadPosts</button>
      {posts && (
        <div className="json-view">
          <ReactJson src={posts} collapsed={true} />
        </div>
      )}
      <hr />
      <button onClick={loadProfile}>loadProfile</button>
      <button onClick={editProfile}>editProfile</button>
      {profile && (
        <div className="json-view">
          <ReactJson src={profile} collapsed={true} />
        </div>
      )}
      <br />
    </div>
  );
}

export default App;
