import React, { useEffect, useState, useRef } from "react";
import logo from "./assets/images/logo.png";
import Editor from "./components/editor/Editor";
import { Button, Tooltip, Spin, Modal } from "antd";
import { PlusOutlined, EyeOutlined, EditOutlined } from "@ant-design/icons";
import { Post, EditorHandle, Mode } from "./types";
import dayjs from "dayjs";
import Message from "./components/message/Message";
import classnames from "classnames";
import { DEFAULT_POSTS } from "./utils/contants";
import storage from "./utils/storage";
import { useIdentity } from "./hooks/useIdentity";

function getPosts() {
  return storage.getItem("POSTS") || DEFAULT_POSTS;
}

function App() {
  const defaultPosts = getPosts();
  const [posts, setPosts] = useState<Post[]>(defaultPosts);
  const [selectedPost, setSelectedPost] = useState<Post>(defaultPosts[0]);
  const [loading, setLoading] = useState(false);
  const editorRef = useRef<EditorHandle>(null);
  const [mode, setMode] = useState(Mode.View);
  const { connectIdentity } = useIdentity();
  const [did, setDid] = useState(null);

  useEffect(() => {
    const storeDID = storage.getItem("DID");
    if (!storeDID) {
      return;
    }

    setDid(storeDID);

    setTimeout(() => {
      connect();
    }, 10);
  }, []);

  useEffect(() => {
    setMode(selectedPost ? Mode.View : Mode.Edit);
  }, [selectedPost]);

  useEffect(() => {
    storage.setItem("POSTS", posts);
  }, [posts]);

  const publishPost = () => {
    const { randomUUID, title, content, plainText } = editorRef.current.newPost;

    if (!title) {
      Message({ content: "Title is required" });
      return;
    }

    if (!content) {
      Message({ content: "Content is required" });
      return;
    }

    if (randomUUID) {
      setPosts(
        posts.map((item) => {
          if (item.randomUUID === randomUUID) {
            return {
              ...item,
              title,
              content,
              plainText,
              updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            };
          }

          return item;
        })
      );
      Message({ content: "Saved Successfully" });
    } else {
      const postData: Post = {
        author: "",
        title,
        content,
        plainText,
        createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        category: "default",
        tag: [],
        randomUUID: crypto.randomUUID(),
      };

      setPosts([postData, ...posts]);
      Message({ content: "Saved Successfully" });
    }

    setMode(Mode.View);
  };

  const selectPost = (post: Post) => {
    setSelectedPost(post);
  };

  const connect = async () => {
    const did = await connectIdentity();
    setDid(did);
    storage.setItem("DID", did);
  };

  return (
    <Spin spinning={loading}>
      <div className="app-container">
        <div className="app-sidebar">
          <div className="sidebar-header">
            <div className="logo-wrapper">
              <img src={logo} className="logo" />
              <span className="app-name">Wordblock</span>
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
                    "is-active": selectedPost?.randomUUID === item.randomUUID,
                  })}
                  key={index}
                  onClick={() => selectPost(item)}
                >
                  <div className="post-item-title">{item.title}</div>
                  <div
                    className="post-item-content"
                    dangerouslySetInnerHTML={{ __html: item.plainText }}
                  />
                  <div className="post-item-created">{item.createdAt}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="app-content">
          <div className="app-content-header">
            <div className="header-left">{did && did.slice(0, 10) + "..." + did.slice(did.length - 6)}</div>
            <div className="header-right">
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
                <Button type="text" onClick={publishPost}>
                  Publish
                </Button>
              ) : (
                <Button type="text" onClick={connect}>
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

export default App;
