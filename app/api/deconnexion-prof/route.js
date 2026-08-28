import { NextResponse } from "next/server";
import { SESSION_COOKIE_PROF } from "@/lib/session";

export async function POST(request) {
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.delete(SESSION_COOKIE_PROF);
  return response;
}
