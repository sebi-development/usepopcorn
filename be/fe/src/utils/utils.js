import { FALLBACK_POSTER } from "./config";

export function handleNotFoundImg(e) {
  if (e.currentTarget.src === FALLBACK_POSTER) return
  e.currentTarget.src = FALLBACK_POSTER
}

export function average(arr) {
  return arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
}