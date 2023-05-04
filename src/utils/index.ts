import dayjs from 'dayjs';

export function getAddressFromDid(did: string) {
  return did.slice(did.lastIndexOf(":") + 1);
}

export function formatDate(date) {
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
}