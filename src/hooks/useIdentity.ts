import React, { useState, useEffect, useContext } from "react";
import { CRYPTO_WALLET } from "@dataverse/runtime-connector";
import { Context } from "../main";
import app from "../../output/app.json";
import { getNamespaceAndReferenceFromDID } from "../utils";

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

  const switchNetwork = async (chainId: number) => {
    const res = await runtimeConnector.switchNetwork(chainId);
    return res;
  };

  const checkIsCurrentDIDValid = async (params: { appName: string }) => {
    const res = await runtimeConnector.checkIsCurrentDIDValid(params);
    return res;
  };

  const connectIdentity = async () => {
    const currentDID = await runtimeConnector.getCurrentDID();
    let chainId;
    try {
      const { reference } = getNamespaceAndReferenceFromDID(currentDID);
      chainId = Number(reference);
    } catch (error) {}

    const currentWallet = await getCurrentWallet();
    if (!currentWallet) {
      const wallet = await chooseWallet();
      await connectWallet(wallet);
    }

    const res = await checkIsCurrentDIDValid({ appName: app.createDapp.name });
    if (!res) {
      await switchNetwork(chainId || 137);
      const did = await runtimeConnector.connectIdentity({
        appName: app.createDapp.name,
      });
      setDid(did);
      return did;
    }

    setDid(currentDID);
    return currentDID;
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
