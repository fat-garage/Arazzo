import React, { useState, useEffect, useContext } from "react";
import {
  RuntimeConnector,
  Extension,
  METAMASK,
  CRYPTO_WALLET_TYPE,
  Apps,
  ModelNames,
  StreamObject,
  FileType,
  MirrorFile,
  StructuredFolders,
} from "@dataverse/runtime-connector";
import { Context } from "../main";
import app from "../../output/app.json";

export function useIdentity() {
  const [did, setDid] = useState('');
  const { runtimeConnector } = useContext(Context);

  const connectWallet = async () => {
    try {
      const address = await runtimeConnector.connectWallet({
        name: METAMASK,
        type: CRYPTO_WALLET_TYPE,
      });
      // console.log({ address });
    } catch (error) {
      console.log(error);
    }
  };

  const switchNetwork = async () => {
    const res = await runtimeConnector.switchNetwork(137);
    // console.log({ res });
  };

  const connectIdentity = async () => {
    await connectWallet();
    await switchNetwork();
    const did = await runtimeConnector.connectIdentity({
      wallet: { name: METAMASK, type: CRYPTO_WALLET_TYPE },
      appName: app.createDapp.name,
    });
    setDid(did);
    // console.log({ did });
    return did;
  };

  return {
    did,
    setDid,
    connectWallet,
    switchNetwork,
    connectIdentity,
  };
}
