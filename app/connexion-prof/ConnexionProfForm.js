"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ConnexionProfForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/espace-prof";

  const [identifiant, setIdentifiant] = useState("");
  const [codeAcces, setCodeAcces] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function seConnecter() {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/connexion-prof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifiant, codeAcces }),
      });
      const data = await res.json();
      if (data.error) {
        setErrorMsg(data.error);
        return;
      }
      window.location.href = next;
    } catch {
      setErrorMsg("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <p className="text-terracotta-600 font-bold tracking-widest text-xs mb-2">ESPACE PROF</p>
      <h1 className="font-display font-extrabold text-2xl text-ink mb-2">Se connecter</h1>
      <p className="text-ink/60 mb-8 text-sm">
        Utilise l&rsquo;identifiant et le code d&rsquo;accès reçus de l&rsquo;équipe Sema.
      </p>

      {errorMsg && (
        <p className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{errorMsg}</p>
      )}

      <input
        className="w-full border border-ink/20 rounded-lg px-4 py-3 mb-4"
        placeholder="Identifiant (ex. PROF-XXXXXX)"
        value={identifiant}
        onChange={(e) => setIdentifiant(e.target.value)}
      />
      <input
        className="w-full border border-ink/20 rounded-lg px-4 py-3 mb-6"
        placeholder="Code d'accès"
        value={codeAcces}
        onChange={(e) => setCodeAcces(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && seConnecter()}
      />
      <button
        onClick={seConnecter}
        disabled={loading}
        className="w-full bg-brown-600 text-cream font-semibold rounded-full py-3 hover:bg-brown-700 transition disabled:opacity-50"
      >
        Se connecter
      </button>
    </div>
  );
}
