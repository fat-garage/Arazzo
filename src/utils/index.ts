export * from "./address";
export * from "./model";
import dayjs from 'dayjs';

export function formatDate(date) {
  if (!date) {
    return "";
  }
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
}

export function getShareLink(id) {
  if (location.href.includes("localhost")) {
    return "http://localhost:5173/#/post/" + id;
  }

  return "https://arazzo.netlify.app/#/post/" + id;
}