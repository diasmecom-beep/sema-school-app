"use client";

import { useState } from "react";
import { formaterDateLongue } from "@/lib/calendrier";

const ICONES = { pdf: "📄", image: "🖼️", lien: "🔗", audio: "🎧" };
const ACCEPT_PAR_TYPE = { pdf: "application/pdf", image: "image/*", audio: "audio/*,.mp3" };

function toDatetimeLocal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function SeanceProf({ seance: seanceInitiale, devoirsInitiaux, ouvertParDefaut, enAvant }) {
  const [seance, setSeance] = useState(seanceInitiale);
  const [devoirs, setDevoirs] = useState(devoirsInitiaux || []);
  const [devoirOuvert, setDevoirOuvert] = useState(null);
  const [note, setNote] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [envoiCorrection, setEnvoiCorrection] = useState(false);

  function ouvrirCorrection(d) {
    setDevoirOuvert(d.id);
    setNote(d.note || "");
    setCommentaire(d.commentaire_prof || "");
  }

  async function enregistrerCorrection(devoirId) {
    setEnvoiCorrection(true);
    try {
      const res = await fetch(`/api/devoirs/${devoirId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note, commentaire }),
      });
      const data = await res.json();
      if (!data.error) {
        setDevoirs((ds) =>
          ds.map((d) =>
            d.id === devoirId
              ? { ...d, note: note.trim() || null, commentaire_prof: commentaire.trim() || null, commente_at: new Date().toISOString() }
              : d
          )
        );
        setDevoirOuvert(null);
      }
    } finally {
      setEnvoiCorrection(false);
    }
  }

  const [typeMateriau, setTypeMateriau] = useState("pdf");
  const [titreMateriau, setTitreMateriau] = useState("");
  const [lienMateriau, setLienMateriau] = useState("");
  const [envoiMateriau, setEnvoiMateriau] = useState(false);
  const [erreurMateriau, setErreurMateriau] = useState("");

  const [echeance, setEcheance] = useState(toDatetimeLocal(seance.echeanceDevoir));
  const [notes, setNotes] = useState(seance.notes || "");
  const [replayLien, setReplayLien] = useState(seance.replayLien || "");
  const [sauvegarde, setSauvegarde] = useState("");

  async function ajouterMateriau(e) {
    e.preventDefault();
    const fichierInput = e.target.elements.fichier;
    const fichier = fichierInput?.files?.[0];
    if (!titreMateriau.trim()) {
      setErreurMateriau("Titre requis.");
      return;
    }
    if (typeMateriau !== "lien" && !fichier) {
      setErreurMateriau("Fichier requis.");
      return;
    }
    if (typeMateriau === "lien" && !lienMateriau.trim()) {
      setErreurMateriau("Lien requis.");
      return;
    }

    setEnvoiMateriau(true);
    setErreurMateriau("");
    try {
      const form = new FormData();
      form.append("seanceId", seance.id);
      form.append("date", seance.date);
      form.append("type", typeMateriau);
      form.append("titre", titreMateriau.trim());
      if (typeMateriau === "lien") form.append("url", lienMateriau.trim());
      else form.append("fichier", fichier);

      const res = await fetch("/api/materiaux", { method: "POST", body: form });
      const data = await res.json();
      if (data.error) {
        setErreurMateriau(data.error);
        return;
      }
      setSeance((s) => ({ ...s, materiaux: [...s.materiaux, data.materiau] }));
      setTitreMateriau("");
      setLienMateriau("");
      e.target.reset();
    } catch {
      setErreurMateriau("Échec de l'envoi.");
    } finally {
      setEnvoiMateriau(false);
    }
  }

  async function supprimerMateriau(id) {
    setSeance((s) => ({ ...s, materiaux: s.materiaux.filter((m) => m.id !== id) }));
    await fetch(`/api/materiaux?id=${id}`, { method: "DELETE" });
  }

  async function sauvegarderSeance() {
    setSauvegarde("...");
    try {
      const res = await fetch(`/api/seances/${encodeURIComponent(seance.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: seance.date,
          echeanceDevoir: echeance ? new Date(echeance).toISOString() : null,
          notes,
          replayLien,
        }),
      });
      const data = await res.json();
      setSauvegarde(data.error ? "Erreur" : "Enregistré ✓");
    } catch {
      setSauvegarde("Erreur");
    } finally {
      setTimeout(() => setSauvegarde(""), 2000);
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
          {seance.materiaux.length > 0 && <span>{seance.materiaux.length} doc.</span>}
          {devoirs.length > 0 && <span>{devoirs.length} devoir{devoirs.length > 1 ? "s" : ""}</span>}
          <span className="transition group-open:rotate-180">⌄</span>
        </span>
      </summary>

      <div className="px-4 pb-5 pt-1 space-y-5 border-t border-ink/5">
        {/* Matériaux */}
        <div>
          <p className="text-xs font-semibold text-ink/60 mb-2">Documents du cours</p>
          {seance.materiaux.length > 0 && (
            <ul className="space-y-1.5 mb-3">
              {seance.materiaux.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-2">
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-terracotta-600 hover:underline"
                  >
                    <span>{ICONES[m.type] || "📎"}</span>
                    {m.titre}
                  </a>
                  <button
                    type="button"
                    onClick={() => supprimerMateriau(m.id)}
                    className="text-xs text-ink/30 hover:text-red-600 transition"
                  >
                    Retirer
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={ajouterMateriau} className="flex flex-wrap items-center gap-2 bg-cream/60 rounded-lg p-2.5">
            <select
              value={typeMateriau}
              onChange={(e) => setTypeMateriau(e.target.value)}
              className="text-xs rounded-full border border-ink/15 px-2.5 py-1.5"
            >
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
              <option value="audio">Audio (MP3)</option>
              <option value="lien">Lien</option>
            </select>
            <input
              type="text"
              placeholder="Titre du document"
              value={titreMateriau}
              onChange={(e) => setTitreMateriau(e.target.value)}
              className="text-xs rounded-full border border-ink/15 px-3 py-1.5 flex-1 min-w-[140px]"
            />
            {typeMateriau === "lien" ? (
              <input
                type="url"
                placeholder="https://..."
                value={lienMateriau}
                onChange={(e) => setLienMateriau(e.target.value)}
                className="text-xs rounded-full border border-ink/15 px-3 py-1.5 flex-1 min-w-[140px]"
              />
            ) : (
              <input
                type="file"
                name="fichier"
                accept={ACCEPT_PAR_TYPE[typeMateriau]}
                className="text-xs file:mr-2 file:rounded-full file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold"
              />
            )}
            <button
              type="submit"
              disabled={envoiMateriau}
              className="text-xs font-semibold bg-sage-800 text-cream rounded-full px-4 py-1.5 hover:opacity-90 transition disabled:opacity-40"
            >
              {envoiMateriau ? "..." : "Ajouter"}
            </button>
          </form>
          {erreurMateriau && <p className="text-xs text-red-600 mt-1">{erreurMateriau}</p>}
        </div>

        {/* Échéance / notes / replay */}
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-semibold text-ink/60">Échéance du devoir</span>
            <input
              type="datetime-local"
              value={echeance}
              onChange={(e) => setEcheance(e.target.value)}
              className="mt-1 w-full text-sm rounded-lg border border-ink/15 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-ink/60">Lien du replay</span>
            <input
              type="url"
              placeholder="https://..."
              value={replayLien}
              onChange={(e) => setReplayLien(e.target.value)}
              className="mt-1 w-full text-sm rounded-lg border border-ink/15 px-3 py-2"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-xs font-semibold text-ink/60">Notes de la séance (visibles par les élèves)</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-1 w-full text-sm rounded-lg border border-ink/15 px-3 py-2"
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={sauvegarderSeance}
            className="text-xs font-semibold bg-terracotta-600 text-cream rounded-full px-4 py-1.5 hover:opacity-90 transition"
          >
            Enregistrer
          </button>
          {sauvegarde && <span className="text-xs text-ink/60">{sauvegarde}</span>}
        </div>

        {/* Devoirs reçus */}
        <div className="pt-3 border-t border-ink/5">
          <p className="text-xs font-semibold text-ink/60 mb-2">
            Devoirs reçus {devoirs.length > 0 && `(${devoirs.length})`}
          </p>
          {devoirs.length === 0 ? (
            <p className="text-sm text-ink/40">Aucun devoir remis pour l&rsquo;instant.</p>
          ) : (
            <ul className="space-y-2">
              {devoirs.map((d) => (
                <li key={d.id} className="text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <a
                      href={`/api/fichier?chemin=${encodeURIComponent(d.chemin_storage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-terracotta-600 hover:underline"
                    >
                      {d.eleveNom || d.eleve_identifiant} - {d.fichier_nom}
                    </a>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-ink/40">{new Date(d.soumis_at).toLocaleDateString("fr-BE")}</span>
                      <button
                        type="button"
                        onClick={() => (devoirOuvert === d.id ? setDevoirOuvert(null) : ouvrirCorrection(d))}
                        className="text-xs font-semibold text-sage-800 hover:underline"
                      >
                        {d.commente_at ? "Modifier la correction" : "Corriger"}
                      </button>
                    </div>
                  </div>

                  {d.commente_at && devoirOuvert !== d.id && (
                    <div className="mt-1.5 bg-cream rounded-lg px-3 py-2 text-xs text-ink/70">
                      {d.note && (
                        <p>
                          <span className="font-semibold">Note :</span> {d.note}
                        </p>
                      )}
                      {d.commentaire_prof && <p className="whitespace-pre-wrap mt-0.5">{d.commentaire_prof}</p>}
                    </div>
                  )}

                  {devoirOuvert === d.id && (
                    <div className="mt-1.5 bg-cream rounded-lg p-2.5 space-y-2">
                      <input
                        type="text"
                        placeholder="Note (ex. 8/10, Très bien...)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full text-xs rounded-lg border border-ink/15 px-2.5 py-1.5"
                      />
                      <textarea
                        placeholder="Commentaire pour l'élève"
                        value={commentaire}
                        onChange={(e) => setCommentaire(e.target.value)}
                        rows={2}
                        className="w-full text-xs rounded-lg border border-ink/15 px-2.5 py-1.5"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => enregistrerCorrection(d.id)}
                          disabled={envoiCorrection}
                          className="text-xs font-semibold bg-terracotta-600 text-cream rounded-full px-3 py-1.5 hover:opacity-90 transition disabled:opacity-40"
                        >
                          {envoiCorrection ? "..." : "Enregistrer la correction"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDevoirOuvert(null)}
                          className="text-xs text-ink/50 hover:underline"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </details>
  );
}
