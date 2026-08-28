"use client";

import { useState } from "react";
import { formaterDateLongue } from "@/lib/calendrier";

const ICONES = { pdf: "📄", image: "🖼️", lien: "🔗", audio: "🎧" };

export default function SeanceEleve({ seance, devoirInitial, ouvertParDefaut, enAvant }) {
  const [devoir, setDevoir] = useState(devoirInitial || null);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  const echeancePassee = seance.echeanceDevoir && new Date(seance.echeanceDevoir) < new Date();

  async function soumettreDevoir(e) {
    e.preventDefault();
    const fichier = e.target.elements.fichier.files[0];
    if (!fichier) return;
    setEnvoi(true);
    setErreur("");
    try {
      const form = new FormData();
      form.append("seanceId", seance.id);
      form.append("date", seance.date);
      form.append("fichier", fichier);
      const res = await fetch("/api/devoirs", { method: "POST", body: form });
      const data = await res.json();
      if (data.error) {
        setErreur(data.error);
        return;
      }
      setDevoir(data.devoir);
      e.target.reset();
    } catch {
      setErreur("Échec de l'envoi.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <details
      open={ouvertParDefaut}
      className={`group border rounded-xl overflow-hidden bg-white ${
        enAvant ? "border-terracotta-600 ring-1 ring-terracotta-600/30" : "border-ink/10"
      }`}
    >
      <summary className="cursor-pointer list-none flex items-center justify-between gap-3 px-4 py-3 hover:bg-cream/60 transition">
        <span className="font-semibold text-ink capitalize">{formaterDateLongue(seance.date)}</span>
        <span className="flex items-center gap-2 text-xs text-ink/50">
          {seance.materiaux.length > 0 && <span>{seance.materiaux.length} document{seance.materiaux.length > 1 ? "s" : ""}</span>}
          {seance.replayLien && <span title="Replay disponible">▶️</span>}
          <span className="transition group-open:rotate-180">⌄</span>
        </span>
      </summary>

      <div className="px-4 pb-4 pt-1 space-y-4 border-t border-ink/5">
        {seance.materiaux.length === 0 ? (
          <p className="text-sm text-ink/40">Aucun document déposé pour l&rsquo;instant.</p>
        ) : (
          <ul className="space-y-1.5">
            {seance.materiaux.map((m) => (
              <li key={m.id}>
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-terracotta-600 hover:underline"
                >
                  <span>{ICONES[m.type] || "📎"}</span>
                  {m.titre}
                </a>
              </li>
            ))}
          </ul>
        )}

        {seance.echeanceDevoir && (
          <p className="text-xs text-ink/60">
            <span className="font-semibold">Devoir à remettre pour :</span>{" "}
            {new Date(seance.echeanceDevoir).toLocaleString("fr-BE", { dateStyle: "long", timeStyle: "short" })}
          </p>
        )}

        {seance.notes && (
          <div className="bg-cream rounded-lg px-3 py-2">
            <p className="text-xs font-semibold text-ink/60 mb-1">Notes du prof</p>
            <p className="text-sm text-ink whitespace-pre-wrap">{seance.notes}</p>
          </div>
        )}

        {seance.replayLien && (
          <a
            href={seance.replayLien}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm bg-sage-800 text-cream rounded-full px-4 py-2 hover:opacity-90 transition"
          >
            ▶️ Revoir le cours
          </a>
        )}

        <div className="pt-2 border-t border-ink/5">
          {devoir ? (
            <p className="text-sm text-green-700">
              ✓ Devoir remis : {devoir.fichier_nom} (
              {new Date(devoir.soumis_at).toLocaleDateString("fr-BE")})
            </p>
          ) : (
            <form onSubmit={soumettreDevoir} className="flex flex-wrap items-center gap-2">
              <input
                type="file"
                name="fichier"
                required
                accept=".pdf,.png,.jpg,.jpeg,.mp3,.m4a,.wav,application/pdf,image/*,audio/*"
                className="text-xs text-ink/70 file:mr-2 file:rounded-full file:border-0 file:bg-cream file:px-3 file:py-1.5 file:text-xs file:font-semibold"
              />
              <button
                type="submit"
                disabled={envoi}
                className="text-xs font-semibold bg-terracotta-600 text-cream rounded-full px-4 py-1.5 hover:opacity-90 transition disabled:opacity-40"
              >
                {envoi ? "Envoi..." : echeancePassee ? "Remettre en retard" : "Remettre le devoir"}
              </button>
            </form>
          )}
          {!devoir && (
            <p className="text-[11px] text-ink/40 mt-1">
              PDF, image ou audio (MP3) — pour un devoir oral, enregistre-toi et dépose le fichier audio.
            </p>
          )}
          {erreur && <p className="text-xs text-red-600 mt-1">{erreur}</p>}
        </div>
      </div>
    </details>
  );
}
