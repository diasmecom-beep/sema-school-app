"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GROUPES, FORMULES } from "@/lib/content";

const ATTENTES = ["Professionnelles", "Personnelles", "Loisirs", "Autres"];
const CONNU_VIA = ["Réseaux sociaux", "Site internet", "Evenement", "Bouche à oreille", "Autre"];

const inputClass = "w-full bg-sage-800 text-cream rounded px-4 py-3 outline-none focus:ring-2 focus:ring-terracotta-500";
const labelClass = "text-terracotta-600 font-semibold text-sm mb-2 block";

export default function InscriptionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formuleId = searchParams.get("formule") || "";
  const formuleChoisie = FORMULES.find((f) => f.id === formuleId);

  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    anneeNaissance: "",
    telephone: "",
    email: "",
    paysResidence: "",
    groupeId: searchParams.get("groupe") || "",
    attentes: "",
    connuVia: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function envoyer() {
    setErrorMsg("");
    if (
      !form.prenom.trim() ||
      !form.nom.trim() ||
      !form.anneeNaissance.trim() ||
      !form.telephone.trim() ||
      !form.email.trim() ||
      !form.paysResidence.trim()
    ) {
      setErrorMsg("Merci de compléter tous les champs.");
      return;
    }
    if (!form.groupeId) {
      setErrorMsg("Merci de choisir un cours.");
      return;
    }
    if (!form.attentes) {
      setErrorMsg("Merci d'indiquer tes attentes.");
      return;
    }
    if (!form.connuVia) {
      setErrorMsg("Merci d'indiquer comment tu as connu Sema.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, formuleId }),
      });
      const data = await res.json();
      if (data.error) {
        setErrorMsg(data.error);
        return;
      }
      if (formuleChoisie?.stripeLink) {
        window.location.href = formuleChoisie.stripeLink;
      } else {
        router.push("/tarifs");
      }
    } catch {
      setErrorMsg("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-display font-extrabold text-2xl text-ink mb-6">
        Complétez les informations suivantes
      </h1>
      <hr className="border-ink/10 mb-8" />

      {formuleChoisie && (
        <p className="bg-sage-800/10 text-sage-900 text-sm rounded-lg px-4 py-3 mb-6">
          Formule choisie : <strong>{formuleChoisie.nom}</strong> - {formuleChoisie.prix}€
          {formuleChoisie.frequence ? ` (${formuleChoisie.frequence.toLowerCase()})` : ""}
        </p>
      )}

      {errorMsg && (
        <p className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">{errorMsg}</p>
      )}

      <div className="space-y-6">
        <div>
          <label className={labelClass}>Prénom *</label>
          <input className={inputClass} value={form.prenom} onChange={(e) => update("prenom", e.target.value)} />
        </div>

        <div>
          <label className={labelClass}>Nom de famille *</label>
          <input className={inputClass} value={form.nom} onChange={(e) => update("nom", e.target.value)} />
        </div>

        <div>
          <label className={labelClass}>Année de naissance *</label>
          <input
            className={inputClass}
            value={form.anneeNaissance}
            onChange={(e) => update("anneeNaissance", e.target.value)}
            placeholder="AAAA"
          />
        </div>

        <div>
          <label className={labelClass}>Téléphone *</label>
          <input
            className={inputClass}
            type="tel"
            value={form.telephone}
            onChange={(e) => update("telephone", e.target.value)}
            placeholder="+32 ..."
          />
        </div>

        <div>
          <label className={labelClass}>E-mail *</label>
          <input
            className={inputClass}
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Pays de résidence *</label>
          <input
            className={inputClass}
            value={form.paysResidence}
            onChange={(e) => update("paysResidence", e.target.value)}
          />
        </div>

        <fieldset>
          <legend className={labelClass}>Cours choisi *</legend>
          <div className="space-y-2">
            {GROUPES.map((g) => (
              <label key={g.id} className="flex items-center gap-2 text-ink text-sm">
                <input
                  type="radio"
                  name="groupeId"
                  checked={form.groupeId === g.id}
                  onChange={() => update("groupeId", g.id)}
                />
                {g.langue} {g.niveau}
              </label>
            ))}
          </div>
          <p className="text-xs italic text-ink/50 mt-2">Un cours par formulaire.</p>
        </fieldset>

        <fieldset>
          <legend className={labelClass}>Quelles sont vos attentes ? *</legend>
          <div className="space-y-2">
            {ATTENTES.map((a) => (
              <label key={a} className="flex items-center gap-2 text-ink text-sm">
                <input
                  type="radio"
                  name="attentes"
                  checked={form.attentes === a}
                  onChange={() => update("attentes", a)}
                />
                {a}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className={labelClass}>Comment avez-vous connu Sema ? *</legend>
          <div className="space-y-2">
            {CONNU_VIA.map((c) => (
              <label key={c} className="flex items-center gap-2 text-ink text-sm">
                <input
                  type="radio"
                  name="connuVia"
                  checked={form.connuVia === c}
                  onChange={() => update("connuVia", c)}
                />
                {c}
              </label>
            ))}
          </div>
        </fieldset>

        <button
          onClick={envoyer}
          disabled={loading}
          className="w-full bg-sage-800 text-cream font-semibold rounded py-4 hover:bg-sage-900 transition disabled:opacity-50"
        >
          Continuer vers le paiement
        </button>
        <p className="text-xs text-ink/50 text-center">
          {formuleChoisie
            ? "Après validation, tu seras redirigé·e vers le paiement sécurisé Stripe."
            : "Après validation, choisis ta formule d’abonnement sur la page suivante."}
        </p>
      </div>
    </div>
  );
}
