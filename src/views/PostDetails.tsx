import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import storage from "../utils/storage";
import { Spin, Button } from "antd";
import { useWallet, useStream } from "../hooks";
import "./PostDetails.less";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import logo from "../assets/images/logo.png";
import { formatDate } from "../utils";

export default function PostDetails() {
  const { connectWallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const [postContent, setPostContent] = useState(null);
  const navigate = useNavigate();
  const [shouldShowLoginButton, setShouldShowLoginButton] = useState(true);
  const {
    pkh,
    createCapability,
    loadStream
  } = useStream();

  const editor = useEditor({
    extensions: [StarterKit, Highlight],
    content: postContent?.content,
    editable: false,
  });

  useEffect(() => {
    if (editor && postContent) {
      editor.commands.setContent(postContent.content);
    }
  }, [editor, postContent]);


  const connect = async () => {
    setLoading(true);

    setTimeout(() => {
      setShouldShowLoginButton(true);
      setLoading(false);
    }, 10000);
    const { wallet } = await connectWallet();
    await createCapability(wallet);
    await loadPost();
    setLoading(false);
    setShouldShowLoginButton(false);
  };

  const loadPost = async () => {
    const res = await loadStream(id);
    let content = null;

    if (typeof res.streamContent.content === "string") {
      content = res.streamContent;
    } else {
      content = res.streamContent.content;
    }

    setPostContent(content);
  };

  return (
    <Spin spinning={loading}>
      <div className="post-details">
        <div className="post-header">
          <div className="logo-wrapper" onClick={() => navigate("/")}>
            <img src={logo} className="logo" />
            <span className="app-name">ARAZZO</span>
          </div>

          {shouldShowLoginButton ? (
            <div className="login-wrapper">
              <Button type={"primary"} onClick={connect} loading={loading}>
                Login
              </Button>
            </div>
          ) : (
            <div className="did">
              {pkh && pkh.slice(0, 10) + "..." + pkh.slice(pkh.length - 6)}
            </div>
          )}
        </div>
        <div className="post-container">
          <div className="post-title">{postContent?.title}</div>
          {postContent && (
            <div className="post-date">
              {formatDate(postContent?.updatedAt)}
            </div>
          )}
          <EditorContent editor={editor} />
        </div>
      </div>
    </Spin>
  );
}
