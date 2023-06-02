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
  const [currentStreamId, setCurrentStreamId] = useState<string>();
  const [publicPost, setPublicPost] = useState<MirrorFile>();
  const [encryptedPost, setEncryptedPost] = useState<MirrorFile>();
  const [payablePost, setPayablePost] = useState<MirrorFile>();
  const [posts, setPosts] = useState<MirrorFile[]>(); // All posts
  const [updatedPost, setUpdatedPost] = useState<MirrorFile>();
  const [monetizedPost, setMonetizedPost] = useState<MirrorFile>();
  const [unlockedPost, setUnlockedPost] = useState<MirrorFile>();
  const { wallet } = useWallet();
  const {
    pkh,
    streamRecord,
    createCapability,
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
  }, []);

  const connect = async () => {
    const pkh = await createCapability();
    console.log("pkh:", pkh)
    return pkh;
  };

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

    console.log("createPublicStream res:", res);
    setCurrentStreamId(res.streamId);
    setPublicPost(res.stream);
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
    console.log("createEncryptedStream res:", res);
    setCurrentStreamId(res.streamId);
    setEncryptedPost(res.stream);
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
    console.log("createPayableStream res:", res);
    setCurrentStreamId(res.streamId);
    setPayablePost(res.content);
  };

  const loadPosts = async () => {
    const postRecord = await loadStream({
      pkh,
      modelId: postModel.stream_id,
    });
    console.log("loadPosts postRecord:", postRecord);
    setPosts(Object.values(postRecord));
  };

  const updatePost = async () => {
    if (!currentStreamId) {
      return;
    }
    const stream = streamRecord[currentStreamId];

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
      encrypted: { text: true, images: true, videos: false },
    });
    console.log("updateStream res:", res);
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
    console.log("monetizeStream res:", res);
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
    console.log("unlockStream res:", res);
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
      {encryptedPost && (
        <div className="json-view">
          <ReactJson src={encryptedPost} collapsed={true} />
        </div>
      )}
      <button onClick={createPayablePost}>createPayablePost</button>
      {payablePost && (
        <div className="json-view">
          <ReactJson src={payablePost} collapsed={true} />
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
