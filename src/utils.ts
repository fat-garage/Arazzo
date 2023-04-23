import fs from "fs";
import path from "path";

export function getAddressFromDid(did: string) {
  return did.slice(did.lastIndexOf(":") + 1);
}

function generateRandomString(length: number): string {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
