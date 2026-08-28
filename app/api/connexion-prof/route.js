import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyCode } from "@/lib/accessCode";
import { signSession, SESSION_COOKIE_PROF } from "@/lib/session";

export async function POST(request) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase n'est pas configuré." }, { status: 500 });
    }

    const { identifiant, codeAcces } = await request.json();
    if (!identifiant?.trim() || !codeAcces?.trim()) {
      return NextResponse.json({ error: "Identifiant et code d'accès requis." }, { status: 400 });
    }

    // Identifiant et code sont toujours générés en majuscules — on normalise
    // la casse et les espaces superflus pour éviter les échecs de connexion
    // dus à une saisie ou un copier-coller légèrement différents.
    const identifiantNormalise = identifiant.trim().toUpperCase();
    const codeNormalise = codeAcces.trim().toUpperCase();

    const { data: row, error } = await supabaseAdmin
      .from("profs")
      .select("identifiant, code_acces_hash, statut")
      .eq("identifiant", identifiantNormalise)
      .single();

    if (error || !row || !verifyCode(codeNormalise, row.code_acces_hash)) {
      return NextResponse.json({ error: "Identifiant ou code d'accès incorrect." }, { status: 401 });
    }

    if (row.statut !== "actif") {
      return NextResponse.json(
        { error: "Ce compte n'est pas encore actif — contacte l'équipe Sema." },
        { status: 403 }
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE_PROF, await signSession(row.identifiant), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 180,
    });
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }
}
