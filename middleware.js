import { NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE, SESSION_COOKIE_PROF } from "@/lib/session";

export async function middleware(request) {
  const estEspaceProf = request.nextUrl.pathname.startsWith("/espace-prof");
  const cookieName = estEspaceProf ? SESSION_COOKIE_PROF : SESSION_COOKIE;
  const loginPath = estEspaceProf ? "/connexion-prof" : "/connexion";

  const cookie = request.cookies.get(cookieName)?.value;
  const identifiant = process.env.SESSION_SECRET ? await verifySession(cookie) : null;

  if (!identifiant) {
    const url = new URL(loginPath, request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/espace-eleve", "/espace-prof/:path*"],
};
