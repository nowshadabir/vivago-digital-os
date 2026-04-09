import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  return NextResponse.next();
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
