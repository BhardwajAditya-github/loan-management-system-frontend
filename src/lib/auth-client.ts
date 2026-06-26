import { tokenStorage } from "@/lib/api";
const TOKEN_KEY = "lms_token";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
    document.cookie = `${TOKEN_KEY}=${encodeURIComponent(
      token,
    )}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  }
}

export function clearAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; samesite=lax`;
  }
}

export async function clearAuthAndLogout() {
  tokenStorage.remove();

  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
}

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
