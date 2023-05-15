import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useIdentity } from "../hooks/useIdentity";
import storage from "../utils/storage";
import { Spin, Button } from "antd";
import app from "../../output/app.json";
import { useContent } from "../hooks/useContent";
import "./PostDetails.less";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import logo from "../assets/images/logo.png";
import { formatDate } from "../utils";

export default function PostDetails() {
  const { connectIdentity } = useIdentity();
  const [did, setDid] = useState(null);
  const [loading, setLoading] = useState(false);
  const { loadContent: loadPostContent } = useContent(app.createDapp.name);
  const { id } = useParams();
  const [postContent, setPostContent] = useState(null);
  const navigate = useNavigate();
  const [shouldShowLoginButton, setShouldShowLoginButton] = useState(false);

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

  useEffect(() => {
    const storeDID = storage.getItem("DID");
    if (!storeDID) {
      setShouldShowLoginButton(true);
      return;
    }

    setTimeout(() => {
      connect();
    }, 10);
  }, []);

  const connect = async () => {
    setLoading(true);

    setTimeout(() => {
      setShouldShowLoginButton(true);
      setLoading(false);
    }, 10000);
    const did = await connectIdentity();
    await loadPost();
    setLoading(false);
    setShouldShowLoginButton(false);
    setDid(did);
    storage.setItem("DID", did);
  };

  const loadPost = async () => {
    const res = await loadPostContent(id);
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
              {did && did.slice(0, 10) + "..." + did.slice(did.length - 6)}
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
