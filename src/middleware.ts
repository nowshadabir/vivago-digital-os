import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { isSameOrigin, verifySessionToken } from "@/lib/session";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

function copyCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach(({ name, value, ...options }) => {
    target.cookies.set(name, value, options);
  });
}

async function isAuthenticated(request: NextRequest) {
  const authSession = request.cookies.get("auth_session")?.value;
  const authUserId = request.cookies.get("auth_user_id")?.value;
  const authToken = request.cookies.get("auth_token")?.value;

  if (authSession !== "1" || !authUserId || !authToken) {
    return false;
  }

  const verifiedUserId = await verifySessionToken(authToken);
  return verifiedUserId === authUserId;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  if (supabaseUrl && supabaseKey) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    });

    await supabase.auth.getUser();
  }

  const authenticated = await isAuthenticated(request);

  const isPublicRoute = pathname === "/";
  const isPublicApiRoute =
    pathname === "/api/auth/login" ||
    pathname === "/api/auth/login/verify" ||
    pathname === "/api/auth/logout" ||
    pathname === "/api/auth/signup" ||
    pathname === "/api/auth/signup/verify";
  const isApiRoute = pathname.startsWith("/api/");
  const isProtectedApiRoute = isApiRoute && !isPublicApiRoute;

  if (isPublicApiRoute) {
    return supabaseResponse;
  }

  if (isProtectedApiRoute && request.method !== "GET" && request.method !== "HEAD" && request.method !== "OPTIONS") {
    const origin = request.headers.get("origin");
    if (origin && !isSameOrigin(request)) {
      const response = NextResponse.json({ message: "Forbidden" }, { status: 403 });
      copyCookies(supabaseResponse, response);
      return response;
    }
  }

  if (isProtectedApiRoute && !authenticated) {
    const response = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    copyCookies(supabaseResponse, response);
    return response;
  }

  if (!isPublicRoute && !authenticated) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("from", pathname);
    const response = NextResponse.redirect(loginUrl);
    copyCookies(supabaseResponse, response);
    return response;
  }

  if (isPublicRoute && authenticated) {
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    copyCookies(supabaseResponse, response);
    return response;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/clients/:path*",
    "/invoices/:path*",
    "/payment-record/:path*",
    "/payments/:path*",
    "/profit-loss/:path*",
    "/files/:path*",
    "/credentials/:path*",
    "/reminders/:path*",
    "/profile/:path*",
    "/api/:path*",
    "/",
  ],
};
