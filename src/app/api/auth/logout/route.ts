import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("auth_session", "", { path: "/", maxAge: 0 });
  response.cookies.set("auth_user_id", "", { path: "/", maxAge: 0 });
  response.cookies.set("auth_token", "", { path: "/", maxAge: 0 });

  return response;
}
