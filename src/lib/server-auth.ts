import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

const TOKEN_KEY = "lms_token";

export type AppUserRole =
  | "BORROWER"
  | "ADMIN"
  | "SALES"
  | "SANCTION"
  | "DISBURSEMENT"
  | "COLLECTION";

export interface ServerJwtUser {
  userId: string;
  email: string;
  role: AppUserRole;
  iat?: number;
  exp?: number;
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "Missing credentials!",
    );
  }

  return secret;
}

export async function getServerAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_KEY)?.value ?? null;
}

export async function getServerCurrentUser(): Promise<ServerJwtUser | null> {
  const token = await getServerAuthToken();

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as ServerJwtUser;
    return decoded;
  } catch {
    return null;
  }
}

export async function requireServerAuth() {
  const user = await getServerCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireServerRole(allowedRoles: AppUserRole[]) {
  const user = await requireServerAuth();

  if (!allowedRoles.includes(user.role)) {
    // We can later improve this with role-specific redirects.
    redirect("/login");
  }

  return user;
}
