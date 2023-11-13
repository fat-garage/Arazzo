import React, { useState, useEffect, useContext } from "react";
import {
  DataverseConnector,
  Extension,
  SYSTEM_CALL,
  WALLET,
} from "@dataverse/dataverse-connector";
import { WalletProvider } from "@dataverse/wallet-provider";
import { Context } from "../main";
import app from "../../output/app.json";

export function useIdentity() {
  const [did, setDid] = useState("");
  const { dataverseConnector } = useContext(Context);

  const connectWallet = async () => {
    try {
      const address = await dataverseConnector.connectWallet({
        wallet: WALLET.METAMASK,
      });
      // console.log({ address });
    } catch (error) {
      console.log(error);
    }
  };

  const switchNetwork = async () => {
    const provider = new WalletProvider();

    await provider?.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x13881" }],
    });
    // console.log({ res });
  };

  const connectIdentity = async () => {
    await connectWallet();
    await switchNetwork();
    const did = await dataverseConnector.runOS({
      method: SYSTEM_CALL.createCapability,
      params: {
        appId: app.id,
      },
      // wallet: { name: METAMASK, type: CRYPTO_WALLET_TYPE },
      // appName: app.createDapp.name,
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
