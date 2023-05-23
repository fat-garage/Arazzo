import React, { useState, useEffect, useContext } from "react";
import { CRYPTO_WALLET } from "@dataverse/runtime-connector";
import { Context } from "../main";
import app from "../../output/app.json";

export function useIdentity() {
  const [did, setDid] = useState("");

  const { runtimeConnector } = useContext(Context);

  const chooseWallet = async () => {
    const wallet = await runtimeConnector.chooseWallet();
    return wallet;
  };

  const connectWallet = async (wallet: CRYPTO_WALLET) => {
    const address = await runtimeConnector.connectWallet(wallet);
    return address;
  };

  const getCurrentWallet = async () => {
    const res = await runtimeConnector.getCurrentWallet();
    return res;
  };

  const switchNetwork = async () => {
    const res = await runtimeConnector.switchNetwork(137);
    return res;
  };

  const connectIdentity = async () => {
    const currentWallet = await getCurrentWallet();
    if (!currentWallet) {
      const wallet = await chooseWallet();
      await connectWallet(wallet);
    }
    await switchNetwork();
    const did = await runtimeConnector.connectIdentity({
      appName: app.createDapp.name,
    });
    setDid(did);
    return did;
  };

  return {
    did,
    setDid,
    chooseWallet,
    connectWallet,
    switchNetwork,
    connectIdentity,
  };
}
