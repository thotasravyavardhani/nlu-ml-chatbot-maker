import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";

export default async function middleware(request: NextRequest) {
  try {
    // Check for bearer token in Authorization header (for client-side auth)
    const authHeader = request.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    const { data: session } = await betterFetch<any>(
      "/api/auth/get-session",
      {
        baseURL: request.nextUrl.origin,
        headers: {
          cookie: request.headers.get("cookie") || "",
          ...(bearerToken && { authorization: `Bearer ${bearerToken}` }),
        },
      }
    );

    // If no session exists, redirect to login
    if (!session?.user) {
      // Don't redirect if already on login page to prevent loops
      if (request.nextUrl.pathname === "/login") {
        return NextResponse.next();
      }
      
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Allow request to proceed if authenticated
    return NextResponse.next();
  } catch (error) {
    // Don't redirect if already on login page
    if (request.nextUrl.pathname === "/login") {
      return NextResponse.next();
    }
    
    // On error, redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/workspace/:path*", "/profile/:path*", "/settings/:path*"],
};