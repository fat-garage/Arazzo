import React, { useState, useEffect, useContext } from "react";
import { CRYPTO_WALLET } from "@dataverse/runtime-connector";
import { Context } from "../main";
import app from "../../output/app.json";
import { getNamespaceAndReferenceFromDID } from "../utils";

export function useIdentity(appName: string, wallet: CRYPTO_WALLET) {
  const { runtimeConnector } = useContext(Context);
  const [pkh, setPkh] = useState("");

  const checkIsValidPkh = async () => {
    const res = await runtimeConnector.checkCapibility(appName);
    return res;
  };

  const createCapibility = async () => {
    const currentPkh = await runtimeConnector.createCapibility({
      wallet,
      app: appName
    })

    setPkh(currentPkh);
    return currentPkh;
  };

  return {
    pkh,
    setPkh,
    checkIsValidPkh,
    createCapibility
  };
}
