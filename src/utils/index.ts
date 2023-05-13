import dayjs from "dayjs";

export function getAddressFromDid(did: string) {
  return did.slice(did.lastIndexOf(":") + 1);
}

export function formatDate(date) {
  if (!date) {
    return "";
  }
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
}

export function getShareLink(id) {
  if (location.href.includes("localhost")) {
    return "http://localhost:5222/post/" + id;
  }

  return "https://venerable-queijadas-290c8d.netlify.app/post/" + id;
}
