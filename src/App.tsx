import "./App.css";
import React, { useState, useEffect } from "react";
import { Currency, FileType, MirrorFile } from "@dataverse/runtime-connector";
import app from "../output/app.json";
import { useWallet, useStream } from "./hooks";
import { Model } from "./types";
import ReactJson from "react-json-view";

function App() {
  const postVersion = "0.0.1";
  const [postModel, setPostModel] = useState<Model>({
    name: "",
    stream_id: "",
    isPublicDomain: false,
  });
  // const [profileModel, setProfileModel] = useState<Model>({
  //   name: "",
  //   stream_id: "",
  //   isPublicDomain: false,
  // });

  // Indicates a certain content to be operated on currently
  const [currentStreamId, setCurrentStreamId] = useState<string>();
  const [publicPost, setPublicPost] = useState<MirrorFile>();
  const [privatePost, setPrivatePost] = useState<MirrorFile>();
  const [datatokenPost, setDatatokenPost] = useState<MirrorFile>();
  const [monetizedPost, setMonetizedPost] = useState<MirrorFile>();
  const [unlockedPost, setUnlockedPost] = useState<MirrorFile>();
  const [updatedPost, setUpdatedPost] = useState<MirrorFile>();
  const [posts, setPosts] = useState<MirrorFile[]>(); // All posts
  const [profile, setProfile] = useState<MirrorFile>();

  const { wallet, connectWallet } = useWallet();

  const {
    pkh,
    streamRecord,
    createCapibility,
    loadStream,
    createPublicStream,
    createEncryptedStream,
    createPayableStream,
    monetizeStream,
    unlockStream,
    updateStream,
  } = useStream(app.createDapp.name, wallet);

  useEffect(() => {
    setPostModel(
      app.createDapp.streamIDs.find(
        (model) => model.name === `${app.createDapp.slug}_post`
      ) as Model
    );
    // setProfileModel(
    //   app.createDapp.streamIDs.find(
    //     (model) => model.name === `${app.createDapp.slug}_profile`
    //   ) as Model
    // );
  }, []);

  /*** Identity ***/
  const connect = async () => {
    const pkh = await createCapibility();
    console.log("pkh=", pkh)
    return pkh;
  };

  /*** Identity ***/

  /*** Post ***/
  const createPublicPost = async () => {
    const date = new Date().toISOString();
    const res = await createPublicStream({
      pkh,
      model: postModel,
      stream: {
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
    setPublicPost(res.stream);
    console.log(res);
  };

  const createEncryptedPost = async () => {
    const date = new Date().toISOString();
    const res = await createEncryptedStream({
      model: postModel,
      stream: {
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
    setPrivatePost(res.stream);
    console.log(res);
  };

  const createPayablePost = async () => {
    const date = new Date().toISOString();
    const res = await createPayableStream({
      pkh,
      model: postModel,
      stream: {
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

  const loadPosts = async () => {
    const postRecord = await loadStream({
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


  const updatePost = async () => {
    if (!currentStreamId) {
      return;
    }
    const content = streamRecord[currentStreamId];

    const res = await updateStream({
      pkh,
      model: postModel,
      streamId: currentStreamId,
      stream: {
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
    setUpdatedPost(res.stream);
  };

  const monetizePost = async () => {
    if (!currentStreamId) {
      return;
    }
    const res = await monetizeStream({
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
    const res = await unlockStream({
      pkh,
      streamId: currentStreamId,
    });
    console.log(res);
    setUnlockedPost(res.stream);
  };

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
      <button onClick={createEncryptedPost}>createEncryptedPost</button>
      {privatePost && (
        <div className="json-view">
          <ReactJson src={privatePost} collapsed={true} />
        </div>
      )}
      <button onClick={createPayablePost}>createPayablePost</button>
      {datatokenPost && (
        <div className="json-view">
          <ReactJson src={datatokenPost} collapsed={true} />
        </div>
      )}
      <div className="red">
        You need a testnet lens profile to monetize data.
      </div>
      <button onClick={loadPosts}>loadPosts</button>
      {posts && (
        <div className="json-view">
          <ReactJson src={posts} collapsed={true} />
        </div>
      )}
      <button onClick={updatePost}>updatePost</button>
      {updatedPost && (
        <div className="json-view">
          <ReactJson src={updatedPost} collapsed={true} />
        </div>
      )}
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
      <br />
    </div>
  );
}

export default App;
