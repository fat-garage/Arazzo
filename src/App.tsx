import "./App.css";
import React, { useState, useEffect } from "react";
import { Currency, FileType, MirrorFile } from "@dataverse/runtime-connector";
import app from "../output/app.json";
import { useStream } from "./hooks/useStream";
import { useIdentity } from "./hooks/useIdentity";
import { Model } from "./types";
import ReactJson from "react-json-view";
import { useWallet } from "./hooks/useWallet";

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
  const [currentStreamId, setCurrentStreamId] = useState<string>();
  const [publicPost, setPublicPost] = useState<MirrorFile>();
  const [privatePost, setPrivatePost] = useState<MirrorFile>();
  const [datatokenPost, setDatatokenPost] = useState<MirrorFile>();
  const [monetizedPost, setMonetizedPost] = useState<MirrorFile>();
  const [unlockedPost, setUnlockedPost] = useState<MirrorFile>();
  const [encryptedPost, setEncryptedPost] = useState<MirrorFile>();
  // const [decryptedPost, setDecryptedPost] = useState<MirrorFile>();
  const [updatedPost, setUpdatedPost] = useState<MirrorFile>();
  const [posts, setPosts] = useState<MirrorFile[]>(); // All posts
  const [profile, setProfile] = useState<MirrorFile>();

  const { wallet, connectWallet } = useWallet();
  const { pkh, createCapibility } = useIdentity(app.createDapp.name, wallet);

  const {
    contentRecord: postContentRecord,
    loadContent: loadPostContent,
    createPublicContent,
    createPrivateContent,
    createDatatokenContent,
    monetizeContent,
    unlockContent,
    updateContentFromPublicToPrivate,
    updateContent,
  } = useStream(app.createDapp.name);

  const { loadContent: loadProfileContent, editProfileContent } = useStream(
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
    const pkh = await createCapibility();
    return pkh;
  };

  /*** Identity ***/

  /*** Post ***/
  const createPublicPost = async () => {
    const date = new Date().toISOString();
    const res = await createPublicContent({
      pkh,
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

    setCurrentStreamId(res.streamId);
    setPublicPost(res.content);
    console.log(res);
  };

  const createPrivatePost = async () => {
    const date = new Date().toISOString();
    const res = await createPrivateContent({
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
    setCurrentStreamId(res.streamId);
    setPrivatePost(res.content);
    console.log(res);
  };

  const createDatatokenPost = async () => {
    const date = new Date().toISOString();
    const res = await createDatatokenContent({
      pkh,
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
    setCurrentStreamId(res.streamId);
    setDatatokenPost(res.content);
    console.log(res);
  };

  const monetizePost = async () => {
    if (!currentStreamId) {
      return;
    }
    const res = await monetizeContent({
      pkh,
      model: postModel,
      streamId: currentStreamId,
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
    if (!currentStreamId) {
      return;
    }
    const res = await unlockContent({
      pkh,
      streamId: currentStreamId,
    });
    console.log(res);
    setUnlockedPost(res.content);
  };

  // const updatePostFromPrivateToPublic = async () => {
  //   if (!currentStreamId) {
  //     return;
  //   }
  //   const res = await updateContentFromPrivateToPublic({
  //     pkh,
  //     model: postModel,
  //     contentId: currentStreamId,
  //   });
  //   console.log(res);
  //   setDecryptedPost(res.content);
  // };

  const updatePostFromPublicToPrivate = async () => {
    if (!currentStreamId) {
      return;
    }
    const res = await updateContentFromPublicToPrivate({
      pkh,
      model: postModel,
      streamId: currentStreamId,
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
    if (!currentStreamId) {
      return;
    }
    const content = postContentRecord[currentStreamId];

    const res = await updateContent({
      pkh,
      model: postModel,
      streamId: currentStreamId,
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
      pkh,
      modelId: postModel.stream_id,
    });
    console.log(postRecord);
    setPosts(Object.values(postRecord));
    // Object.entries(postRecord).find(([contentId, content]) => {
    //   if (
    //     content.fileType === FileType.Datatoken ||
    //     content.fileType === FileType.Private
    //   ) {
    //     setCurrentStreamId(contentId);
    //   }
    // });
  };

  /*** Post ***/

  /*** Profile ***/
  const loadProfile = async () => {
    const res = await loadProfileContent({
      pkh,
      modelId: profileModel.stream_id,
    });
    console.log(res);
    setProfile(Object.values(res)[0]);
  };

  const editProfile = async () => {
    const res = await editProfileContent({
      pkh,
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
      <div className="blackText">{pkh}</div>
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
      {/* <button onClick={updatePostFromPrivateToPublic}>
        updatePostFromPrivateToPublic
      </button>
      {decryptedPost && (
        <div className="json-view">
          <ReactJson src={decryptedPost} collapsed={true} />
        </div>
      )} */}
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
