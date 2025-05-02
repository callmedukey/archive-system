import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { Role } from "./db/schemas";

export default async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET as string,
      secureCookie: process.env.NODE_ENV === "production" ? true : false,
      cookieName:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
    });

    if (token?.role === Role.SUPERADMIN) {
      return NextResponse.redirect(new URL("/super-admin", req.url));
    }
  }
}
