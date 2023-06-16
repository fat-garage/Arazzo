import ReactDOM from "react-dom/client";
import React from "react";
import App from "./App";
import { Context, contextStore } from "./context";
import "./index.less";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Context.Provider value={contextStore}>
    <App />
  </Context.Provider>
);
