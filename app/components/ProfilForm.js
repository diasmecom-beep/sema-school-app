"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilForm({ prenom: prenomInitial, nom: nomInitial, photoChemin: photoCheminInitial }) {
  const router = useRouter();
  const [prenom, setPrenom] = useState(prenomInitial || "");
  const [nom, setNom] = useState(nomInitial || "");
  const [photoChemin, setPhotoChemin] = useState(photoCheminInitial || "");
  const [apercu, setApercu] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState("");

  const [motDePasseOuvert, setMotDePasseOuvert] = useState(false);
  const [motDePasseActuel, setMotDePasseActuel] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [envoiMotDePasse, setEnvoiMotDePasse] = useState(false);
  const [messageMotDePasse, setMessageMotDePasse] = useState("");

  const photoUrl = apercu || (photoChemin ? `/api/fichier?chemin=${encodeURIComponent(photoChemin)}` : null);
  const initiales = `${prenom?.[0] || ""}${nom?.[0] || ""}`.toUpperCase() || "?";

  function choisirPhoto(e) {
    const fichier = e.target.files?.[0];
    if (fichier) setApercu(URL.createObjectURL(fichier));
  }

  async function enregistrer(e) {
    e.preventDefault();
    setEnvoi(true);
    setMessage("");
    try {
      const form = new FormData(e.target);
      const res = await fetch("/api/profil", { method: "PATCH", body: form });
      const data = await res.json();
      if (data.error) {
        setMessage(data.error);
        return;
      }
      if (data.photo_chemin) setPhotoChemin(data.photo_chemin);
      setMessage("Profil mis à jour ✓");
      router.refresh();
    } catch {
      setMessage("Échec de l'enregistrement.");
    } finally {
      setEnvoi(false);
    }
  }

  async function changerMotDePasse(e) {
    e.preventDefault();
    setEnvoiMotDePasse(true);
    setMessageMotDePasse("");
    try {
      const res = await fetch("/api/profil/mot-de-passe", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motDePasseActuel, nouveauMotDePasse }),
      });
      const data = await res.json();
      if (data.error) {
        setMessageMotDePasse(data.error);
        return;
      }
      setMessageMotDePasse("Mot de passe mis à jour ✓");
      setMotDePasseActuel("");
      setNouveauMotDePasse("");
    } catch {
      setMessageMotDePasse("Échec de l'enregistrement.");
    } finally {
      setEnvoiMotDePasse(false);
    }
  }

  return (
    <div className="w-full flex flex-col gap-6">
    <form onSubmit={enregistrer} className="flex flex-col sm:flex-row gap-6 items-start">
      <div className="flex flex-col items-center gap-2 shrink-0">
        <label className="cursor-pointer group relative">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt="Photo de profil"
              className="h-20 w-20 rounded-full object-cover border border-ink/10"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-sage-800 text-cream flex items-center justify-center font-display font-extrabold text-xl">
              {initiales}
            </div>
          )}
          <span className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-cream text-xs font-semibold">
            Changer
          </span>
          <input type="file" name="photo" accept="image/*" onChange={choisirPhoto} className="hidden" />
        </label>
      </div>

      <div className="flex-1 grid sm:grid-cols-2 gap-3 w-full">
        <label className="block">
          <span className="text-xs font-semibold text-ink/60">Prénom</span>
          <input
            type="text"
            name="prenom"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className="mt-1 w-full text-sm rounded-lg border border-ink/15 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-ink/60">Nom</span>
          <input
            type="text"
            name="nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="mt-1 w-full text-sm rounded-lg border border-ink/15 px-3 py-2"
          />
        </label>
        <div className="sm:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={envoi}
            className="text-xs font-semibold bg-terracotta-600 text-cream rounded-full px-4 py-2 hover:opacity-90 transition disabled:opacity-40"
          >
            {envoi ? "..." : "Enregistrer"}
          </button>
          {message && <span className="text-xs text-ink/60">{message}</span>}
        </div>
      </div>
    </form>

    <div>
      <button
        type="button"
        onClick={() => setMotDePasseOuvert((v) => !v)}
        className="text-xs font-semibold text-terracotta-600 hover:underline"
      >
        {motDePasseOuvert ? "Annuler" : "Changer mon mot de passe"}
      </button>

      {motDePasseOuvert && (
        <form onSubmit={changerMotDePasse} className="mt-3 grid sm:grid-cols-2 gap-3 max-w-md">
          <label className="block">
            <span className="text-xs font-semibold text-ink/60">Mot de passe actuel</span>
            <input
              type="password"
              value={motDePasseActuel}
              onChange={(e) => setMotDePasseActuel(e.target.value)}
              className="mt-1 w-full text-sm rounded-lg border border-ink/15 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-ink/60">Nouveau mot de passe</span>
            <input
              type="password"
              value={nouveauMotDePasse}
              onChange={(e) => setNouveauMotDePasse(e.target.value)}
              className="mt-1 w-full text-sm rounded-lg border border-ink/15 px-3 py-2"
            />
          </label>
          <div className="sm:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={envoiMotDePasse}
              className="text-xs font-semibold bg-sage-800 text-cream rounded-full px-4 py-2 hover:bg-sage-900 transition disabled:opacity-40"
            >
              {envoiMotDePasse ? "..." : "Valider le nouveau mot de passe"}
            </button>
            {messageMotDePasse && <span className="text-xs text-ink/60">{messageMotDePasse}</span>}
          </div>
        </form>
      )}
    </div>
    </div>
  );
}
