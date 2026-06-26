import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { AuthUser, UserResponse } from "@/lib/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

const TOKEN_KEY = "lms_token";

async function getServerToken() {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_KEY)?.value ?? null;
}

async function serverRequest<T>(endpoint: string): Promise<T> {
  const token = await getServerToken();

  if (!token) {
    redirect("/login");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result?.message || "Failed to fetch server data");
  }

  return result.data as T;
}

/**
 * Use /users/me for richer user profile
 */
export async function getServerMyProfile(): Promise<UserResponse> {
  return serverRequest<UserResponse>("/users/me");
}

/**
 * Optional if you want /auth/me instead
 */
export async function getServerCurrentAuthUser(): Promise<AuthUser> {
  return serverRequest<AuthUser>("/auth/me");
}
