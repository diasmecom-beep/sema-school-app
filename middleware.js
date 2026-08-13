import { NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/session";

export async function middleware(request) {
  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  const identifiant = process.env.SESSION_SECRET ? await verifySession(cookie) : null;

  if (!identifiant) {
    const url = new URL("/connexion", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/espace-eleve"],
};
