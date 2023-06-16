import React, { useEffect, useState, useRef, useContext } from "react";
import logo from "../assets/images/logo.png";
import Editor from "../components/editor/Editor";
import { Button, Tooltip, Spin } from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { Post, EditorHandle, Mode } from "../types";
import dayjs from "dayjs";
import Message from "../components/message/Message";
import classnames from "classnames";
import storage from "../utils/storage";
import { useWallet, useStream } from "../hooks";
import { formatDate, getShareLink } from "../utils";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Context } from "../context";

function PostEditor() {
  const { appVersion, postModel } = useContext(Context);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post>(null);
  const [loading, setLoading] = useState(false);
  const editorRef = useRef<EditorHandle>(null);
  const [mode, setMode] = useState(Mode.View);
  const { connectWallet } = useWallet();
  const [did, setDid] = useState(null);
  const [link, setLink] = useState("");
  const {
    pkh,
    createCapability,
    loadStreams,
    createPublicStream,
    updateStream,
    streamsRecord,
  } = useStream();
  const [publishLoading, setPublishLoading] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [did]);

  useEffect(() => {
    setMode(selectedPost ? Mode.View : Mode.Edit);
  }, [selectedPost]);

  const loadPosts = async () => {
    try {
      if (!did) {
        return;
      }
      setLoading(true);
      const response = await loadStreams({
        pkh,
        modelId: postModel.stream_id,
      });
      let postData = [];

      for (const key of Object.keys(response)) {
        const item = response[key];
        const content = item.streamContent.content;
        content.uid = key;
        postData.push(content);
      }
      postData = postData.reverse();
      setPosts(postData);

      if (postData.length) {
        setSelectedPost(postData[0]);
        setLink(getShareLink(postData[0].uid));
      }
    } finally {
      setLoading(false);
    }
  };

  const publishPost = async () => {
    const { uid, title, content, plainText } = editorRef.current.newPost;

    if (!title) {
      Message({ content: "Title is required" });
      return;
    }

    if (!content) {
      Message({ content: "Content is required" });
      return;
    }

    setPublishLoading(true);

    if (uid) {
      if (!streamsRecord[uid]) {
        Message({ content: "Sorry, it's not a mirror file." });
        setPublishLoading(false);
        return;
      }
      await updateStream({
        model: postModel,
        streamId: uid,
        stream: {
          ...editorRef.current.newPost,
          updatedAt: dayjs().toISOString(),
        },
      });
      Message({ content: "Update Successfully" });
    } else {
      const postData: Post = {
        appVersion,
        title,
        content,
        plainText,
        createdAt: dayjs().toISOString(),
        updatedAt: dayjs().toISOString(),
        category: ["default"],
        tag: [],
        uid: crypto.randomUUID(),
      };
      await createPublicStream({
        pkh,
        model: postModel,
        stream: {
          ...postData,
        },
      });

      Message({ content: "Publish Successfully" });
    }

    setPublishLoading(false);
    loadPosts();
    setMode(Mode.View);
  };

  const selectPost = (post: Post) => {
    if (post) {
      setLink(getShareLink(post.uid));
    }
    setSelectedPost(post);
  };

  const connect = async () => {
    setConnectLoading(true);
    setTimeout(() => {
      setConnectLoading(false);
    }, 3000);
    const { wallet } = await connectWallet();
    const did = await createCapability(wallet);
    setConnectLoading(false);
    setDid(did);
    storage.setItem("DID", did);
  };

  const sharePostLink = () => {
    console.log(link);
    Message({ content: "Share Link copied." });
  };

  return (
    <Spin spinning={loading}>
      <div className="app-container">
        <div className="app-sidebar">
          <div className="sidebar-header">
            <div className="logo-wrapper">
              <img src={logo} className="logo" />
              <span className="app-name">ARAZZO</span>
            </div>

            <Tooltip title="Add Post">
              <Button
                icon={<PlusOutlined />}
                shape="circle"
                type="text"
                onClick={() => selectPost(null)}
              />
            </Tooltip>
          </div>

          <div className="sidebar-content">
            <div className="post-list">
              {posts.map((item, index) => (
                <div
                  className={classnames("post-item", {
                    "is-active": selectedPost?.uid === item.uid,
                  })}
                  key={index}
                  onClick={() => selectPost(item)}
                >
                  <div className="post-item-title">{item.title}</div>
                  <div
                    className="post-item-content"
                    dangerouslySetInnerHTML={{ __html: item.plainText }}
                  />
                  <div className="post-item-created">
                    {formatDate(item.updatedAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="app-content">
          <div className="app-content-header">
            <div className="header-left">
              {did && did.slice(0, 10) + "..." + did.slice(did.length - 6)}
            </div>
            <div className="header-right">
              {selectedPost ? (
                <>
                  {/* <Tooltip title="Delete Post">
                    <Button
                      icon={<DeleteOutlined />}
                      type="text"
                      onClick={deletePost}
                      loading={publishLoading}
                    />
                  </Tooltip> */}
                  <CopyToClipboard text={link}>
                    <Tooltip title="Share Post">
                      <Button
                        icon={<ShareAltOutlined />}
                        type="text"
                        onClick={sharePostLink}
                      />
                    </Tooltip>
                  </CopyToClipboard>
                </>
              ) : null}
              {mode === Mode.Edit ? (
                <Tooltip title="View">
                  <Button
                    icon={<EyeOutlined />}
                    type="text"
                    onClick={() => setMode(Mode.View)}
                  />
                </Tooltip>
              ) : (
                <Tooltip title="Edit">
                  <Button
                    icon={<EditOutlined />}
                    type="text"
                    onClick={() => setMode(Mode.Edit)}
                  />
                </Tooltip>
              )}

              {did ? (
                <Button
                  type="text"
                  onClick={publishPost}
                  loading={publishLoading}
                >
                  Publish
                </Button>
              ) : (
                <Button type="text" onClick={connect} loading={connectLoading}>
                  Get Started
                </Button>
              )}
            </div>
          </div>
          <Editor selectedPost={selectedPost} ref={editorRef} mode={mode} />
        </div>
      </div>
    </Spin>
  );
}

export default PostEditor;
