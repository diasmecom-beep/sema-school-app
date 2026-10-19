"use client";

import { useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { BUCKET_FICHIERS, TAILLE_MAX_OCTETS } from "@/lib/fichiers";

const ICONES = { pdf: "📄", image: "🖼️", audio: "🎧", lien: "🔗" };

function typeDepuisFichier(fichier) {
  if (fichier.type.startsWith("image/")) return "image";
  if (fichier.type.startsWith("audio/")) return "audio";
  return "pdf";
}

// Dossier "Cours" d'un groupe : documents de référence indépendants des
// dates de séance. En lecture seule pour les élèves ; le prof (editable) peut
// y ajouter ou retirer des documents.
export default function DossierCours({ groupeId, ressourcesInitiales, editable = false }) {
  const [ressources, setRessources] = useState(ressourcesInitiales || []);
  const [mode, setMode] = useState("fichier");
  const [titre, setTitre] = useState("");
  const [lien, setLien] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  if (!editable && ressources.length === 0) return null;

  async function ajouter(e) {
    e.preventDefault();
    const fichier = e.target.elements.fichier?.files?.[0];
    if (!titre.trim()) return setErreur("Titre requis.");
    if (mode === "fichier" && !fichier) return setErreur("Fichier requis.");
    if (mode === "lien" && !lien.trim()) return setErreur("Lien requis.");
    if (fichier && fichier.size > TAILLE_MAX_OCTETS) {
      return setErreur(`Le fichier dépasse la taille maximale autorisée (${TAILLE_MAX_OCTETS / (1024 * 1024)} Mo).`);
    }

    setEnvoi(true);
    setErreur("");
    try {
      let cheminStorage = null;
      if (mode === "fichier") {
        const resPrep = await fetch("/api/materiaux/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seanceId: `${groupeId}__cours`, nomFichier: fichier.name, tailleOctets: fichier.size }),
        });
        const dataPrep = await resPrep.json();
        if (dataPrep.error) return setErreur(dataPrep.error);

        const { error: uploadErr } = await supabaseClient.storage
          .from(BUCKET_FICHIERS)
          .uploadToSignedUrl(dataPrep.chemin, dataPrep.token, fichier);
        if (uploadErr) return setErreur("Échec de l'envoi du fichier.");
        cheminStorage = dataPrep.chemin;
      }

      const res = await fetch("/api/ressources-cours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupeId,
          type: mode === "lien" ? "lien" : typeDepuisFichier(fichier),
          titre: titre.trim(),
          url: mode === "lien" ? lien.trim() : undefined,
          cheminStorage,
        }),
      });
      const data = await res.json();
      if (data.error) return setErreur(data.error);

      setRessources((r) => [...r, data.ressource]);
      setTitre("");
      setLien("");
      e.target.reset();
    } catch {
      setErreur("Échec de l'envoi.");
    } finally {
      setEnvoi(false);
    }
  }

  async function supprimer(id) {
    if (!window.confirm("Retirer ce document du dossier Cours ?")) return;
    setRessources((r) => r.filter((x) => x.id !== id));
    await fetch(`/api/ressources-cours?id=${id}`, { method: "DELETE" });
  }

  return (
    <div className="mb-4 bg-white border border-ink/10 rounded-xl p-4">
      <p className="text-sm font-semibold text-ink mb-1">📚 Cours</p>
      <p className="text-[11px] text-ink/50 mb-3">Documents de référence du cours, toujours disponibles.</p>

      {ressources.length === 0 ? (
        <p className="text-xs text-ink/40 mb-3">Aucun document pour l&rsquo;instant.</p>
      ) : (
        <ul className="space-y-2 mb-1">
          {ressources.map((r) => (
            <li key={r.id} className="flex items-center gap-2 text-sm">
              <span aria-hidden>{ICONES[r.type] || "📄"}</span>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 font-semibold text-terracotta-600 hover:underline break-words"
              >
                {r.titre}
              </a>
              {editable && (
                <button
                  type="button"
                  onClick={() => supprimer(r.id)}
                  className="text-xs text-ink/40 hover:text-red-600 transition"
                  aria-label={`Retirer ${r.titre}`}
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {editable && (
        <form onSubmit={ajouter} className="mt-3 pt-3 border-t border-ink/10 space-y-2">
          <div className="flex gap-2 text-xs">
            {["fichier", "lien"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-full px-3 py-1 font-semibold ${
                  mode === m ? "bg-sage-800 text-cream" : "bg-cream text-ink/60"
                }`}
              >
                {m === "fichier" ? "Fichier" : "Lien"}
              </button>
            ))}
          </div>
          <input
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Titre du document"
            className="w-full rounded border border-ink/15 px-3 py-2 text-sm"
          />
          {mode === "fichier" ? (
            <input name="fichier" type="file" className="w-full text-xs" />
          ) : (
            <input
              value={lien}
              onChange={(e) => setLien(e.target.value)}
              placeholder="https://..."
              className="w-full rounded border border-ink/15 px-3 py-2 text-sm"
            />
          )}
          {erreur && <p className="text-xs text-red-600">{erreur}</p>}
          <button
            type="submit"
            disabled={envoi}
            className="bg-sage-800 text-cream text-sm font-semibold rounded-full px-4 py-2 hover:bg-sage-900 transition disabled:opacity-50"
          >
            {envoi ? "Envoi..." : "Ajouter au dossier"}
          </button>
        </form>
      )}
    </div>
  );
}
