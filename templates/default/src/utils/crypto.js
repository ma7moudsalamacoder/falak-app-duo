import CryptoJS from "crypto-js";

// AES-256-CBC, key/IV pulled from .env (generated fresh per-project by the CLI).
// Use this for encrypting sensitive values you must keep in localStorage/sessionStorage
// (e.g. a cached user token) — never for anything you'd rather the backend handle.
const KEY = CryptoJS.enc.Hex.parse(import.meta.env.VITE_AES_KEY || "");
const IV = CryptoJS.enc.Hex.parse(import.meta.env.VITE_AES_IV || "");

export function encrypt(plainText) {
  if (!KEY.words.length || !IV.words.length) {
    console.warn("[crypto] VITE_AES_KEY / VITE_AES_IV are not set — refusing to encrypt.");
    return plainText;
  }
  const encrypted = CryptoJS.AES.encrypt(plainText, KEY, {
    iv: IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
}

export function decrypt(cipherText) {
  if (!KEY.words.length || !IV.words.length) return cipherText;
  const decrypted = CryptoJS.AES.decrypt(cipherText, KEY, {
    iv: IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}
