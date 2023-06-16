import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  ForwardRefRenderFunction,
} from "react";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

import EditorMenu from "./EditorMenu";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import "./Editor.less";
import { Post, EditorHandle, Mode } from "../../types";
import { formatDate } from '../../utils';

interface Props {
  selectedPost: Post;
  mode: Mode;
}

const Editor: ForwardRefRenderFunction<EditorHandle, Props> = (
  { selectedPost, mode }: Props,
  forwardedRef
) => {
  const [charCount, setCharCount] = useState(selectedPost?.plainText.length);
  const [title, setTitle] = useState(selectedPost?.title);
  useImperativeHandle(
    forwardedRef,
    (): EditorHandle => {
      return {
        newPost: {
          ...((selectedPost || {}) as Post),
          title,
          content: editor?.getHTML(),
          plainText: editor?.getText(),
        },
      };
    }
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Link,
      Placeholder.configure({
        placeholder: "Start typing here...",
      }),
    ],
    content: selectedPost?.content,
    onUpdate: () => {
      setCharCount(editor?.getCharacterCount());
    },
    editable: false,
  });

  const handleChangeTitle = (e) => {
    setTitle(e.target.value);
  };

  useEffect(() => {
    if (selectedPost && editor) {
      setTitle(selectedPost.title);
      editor.commands.setContent(selectedPost.content);
      setCharCount(editor.getCharacterCount());
    } else if (!selectedPost && editor) {
      setTitle("");
      editor.commands.setContent("");
    }
  }, [selectedPost]);

  useEffect(() => {
    editor?.setEditable(mode === Mode.Edit);
    editor?.commands.focus();
  }, [mode]);

  return (
    <div className="editor-wrapper">
      <div className="title-wrapper">
        <input
          placeholder="Untitled"
          value={title}
          onChange={handleChangeTitle}
        />
      </div>
      {mode === Mode.Edit && <EditorMenu editor={editor} />}

      <div className="editor-content">
        <EditorContent editor={editor} />
      </div>

      <div className="editor-bar">
        <div className="bar-item">
          <span className="label">words:</span>
          <span className="value">{charCount}</span>
        </div>
        <div className="bar-item">
          <span className="label">createdAt:</span>
          <span className="value">{formatDate(selectedPost?.createdAt)}</span>
        </div>
        <div className="bar-item">
          <span className="label">updatedAt:</span>
          <span className="value">{formatDate(selectedPost?.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default forwardRef(Editor);
