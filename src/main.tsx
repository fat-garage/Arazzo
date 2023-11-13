import { Extension, DataverseConnector } from "@dataverse/dataverse-connector";
import React, { createContext } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.less";

interface Context {
  dataverseConnector: DataverseConnector;
}

export const Context = createContext<Context>({} as Context);
const dataverseConnector = new DataverseConnector();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Context.Provider value={{ dataverseConnector }}>
    <App></App>
  </Context.Provider>
);
