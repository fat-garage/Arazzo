import React from "react";
import ReactDOM from "react-dom";
import "./Message.less";

interface MessageProps {
  content: React.ReactNode;
}

export const MessageComp = function (props: MessageProps) {
  return (
    <div className="message-box">
      <div className="message-content">
        <div
          dangerouslySetInnerHTML={{
            __html: props.content,
          }}
        />
      </div>
    </div>
  );
};

const message = (props: MessageProps & { duration?: number }) => {
  const holder = document.createElement("div");
  holder.setAttribute("id", "messageBox");
  document.body.append(holder);

  const destroy = () => {
    holder.remove();
  };

  if (props.duration !== 0) {
    setTimeout(() => {
      destroy();
    }, props.duration ?? 3000);
  }

  holder.addEventListener("click", () => {
    holder.remove();
  });

  ReactDOM.render(<MessageComp {...props} />, holder);
};

export default message;
