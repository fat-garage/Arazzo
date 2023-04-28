import fs from "fs";
import path from "path";

export function getAddressFromDid(did: string) {
  return did.slice(did.lastIndexOf(":") + 1);
}
