import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";

export default async function middleware(request: NextRequest) {
  try {
    const { data: session } = await betterFetch<any>(
      "/api/auth/get-session",
      {
        baseURL: request.nextUrl.origin,
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      }
    );

    // If no session exists, redirect to login
    if (!session?.user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Allow request to proceed if authenticated
    return NextResponse.next();
  } catch (error) {
    // On error, redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/workspace/:path*", "/profile/:path*", "/settings/:path*"],
};