"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// Fait ressortir les @mentions dans un message ("@Fatou" devient un mot
// mis en avant) — purement visuel, aucune notification n'est envoyée.
function rendreContenu(contenu) {
  const parts = contenu.split(/(@[\p{L}][\p{L}0-9._-]*)/gu);
  return parts.map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="font-semibold text-terracotta-600">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function cleVu(groupeId) {
  return `sema-forum-vu-${groupeId}`;
}

// Forum texte simple, un fil par groupe, entre élèves, prof et admin. On
// peut taguer quelqu'un avec @ (autocomplétion parmi les membres du
// groupe) ou écrire "à tous" pour s'adresser à tout le monde. Rafraîchi par
// sondage (pas de dépendance temps réel) — largement suffisant pour du
// Q&A de cours. Une bannière signale les nouveaux messages, et en
// particulier si l'utilisateur·rice a été tagué·e.
export default function Chat({ groupeId, role, moi, titre = "Forum du groupe", description }) {
  const [messages, setMessages] = useState([]);
  const [texte, setTexte] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [membres, setMembres] = useState([]);
  const [suggestions, setSuggestions] = useState(null);
  const [dernierVu, setDernierVu] = useState(null);
  const finRef = useRef(null);
  const inputRef = useRef(null);

  const monTag = moi ? `@${moi.prenom ? `${moi.prenom}${moi.nom}` : moi.nom}`.replace(/\s+/g, "") : null;

  useEffect(() => {
    try {
      setDernierVu(localStorage.getItem(cleVu(groupeId)) || "1970-01-01T00:00:00.000Z");
    } catch {
      setDernierVu("1970-01-01T00:00:00.000Z");
    }
  }, [groupeId]);

  async function charger() {
    try {
      const res = await fetch(`/api/messages?groupeId=${encodeURIComponent(groupeId)}`);
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch {
      // silencieux — on réessaiera au prochain sondage
    }
  }

  useEffect(() => {
    charger();
    const id = setInterval(charger, 4000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupeId]);

  useEffect(() => {
    fetch(`/api/groupe-membres?groupeId=${encodeURIComponent(groupeId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          const tous = [
            ...(data.eleves || []).map((e) => ({ ...e, role: "eleve" })),
            ...(data.profs || []).map((p) => ({ ...p, role: "prof" })),
          ];
          setMembres(tous);
        }
      })
      .catch(() => {});
  }, [groupeId]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);

  const nonLus = useMemo(() => {
    if (!dernierVu) return [];
    return messages.filter((m) => m.created_at > dernierVu);
  }, [messages, dernierVu]);
  const jeSuisTague = monTag && nonLus.some((m) => m.contenu.toLowerCase().includes(monTag.toLowerCase()));

  function marquerCommeLu() {
    const maintenant = new Date().toISOString();
    try {
      localStorage.setItem(cleVu(groupeId), maintenant);
    } catch {
      // stockage indisponible — pas grave, juste pas de mémorisation
    }
    setDernierVu(maintenant);
  }

  function nomAffiche(m) {
    return m.prenom ? `${m.prenom} ${m.nom}` : m.nom;
  }

  function surChangementTexte(e) {
    const val = e.target.value;
    setTexte(val);

    const curseur = e.target.selectionStart;
    const avant = val.slice(0, curseur);
    const match = avant.match(/@([\p{L}0-9._-]*)$/u);
    if (match) {
      const requete = match[1].toLowerCase();
      const options = membres.filter((m) => nomAffiche(m).toLowerCase().includes(requete)).slice(0, 6);
      setSuggestions({ options, debut: curseur - match[0].length });
    } else {
      setSuggestions(null);
    }
  }

  function choisirMention(m) {
    if (!suggestions) return;
    const avant = texte.slice(0, suggestions.debut);
    const apres = texte.slice(inputRef.current.selectionStart);
    const nouveau = `${avant}@${nomAffiche(m).replace(/\s+/g, "")} ${apres}`;
    setTexte(nouveau);
    setSuggestions(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  async function envoyer() {
    if (!texte.trim() || envoi) return;
    setEnvoi(true);
    setErreur("");
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupeId, contenu: texte }),
      });
      const data = await res.json();
      if (data.error) {
        setErreur(data.error);
        return;
      }
      setTexte("");
      setSuggestions(null);
      setMessages((m) => [...m, data.message]);
      marquerCommeLu();
    } catch {
      setErreur("Échec de l'envoi.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div>
      <h2 className="font-display font-extrabold text-xl text-ink mb-2 flex items-center gap-2">
        💬 {titre}
        {nonLus.length > 0 && (
          <span
            className={`text-[11px] font-bold rounded-full px-2 py-0.5 ${
              jeSuisTague ? "bg-terracotta-600 text-cream" : "bg-sage-800 text-cream"
            }`}
          >
            {nonLus.length}
          </span>
        )}
      </h2>
      {description && <p className="text-xs text-ink/50 mb-3">{description}</p>}

      <div className="flex flex-col border border-ink/10 rounded-xl overflow-hidden bg-white h-full">
        {nonLus.length > 0 && (
          <button
            type="button"
            onClick={marquerCommeLu}
            className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between gap-2 transition ${
              jeSuisTague ? "bg-terracotta-600 text-cream hover:opacity-90" : "bg-sage-800 text-cream hover:opacity-90"
            }`}
          >
            <span>
              {jeSuisTague ? "🔔 On t'a tagué·e — " : "🔵 "}
              {nonLus.length} nouveau{nonLus.length > 1 ? "x" : ""} message{nonLus.length > 1 ? "s" : ""}
            </span>
            <span className="underline">Marquer comme lu</span>
          </button>
        )}

        <div className="flex-1 min-h-[16rem] max-h-[28rem] overflow-y-auto px-4 py-3 space-y-2">
          {messages.length === 0 && (
            <p className="text-sm text-ink/40 text-center py-6">
              Aucun message pour l&rsquo;instant — pose ta première question, ou tague quelqu&rsquo;un avec @.
            </p>
          )}
          {messages.map((m) => {
            const estMoi = m.auteur_type === role;
            return (
              <div key={m.id} className={`flex ${estMoi ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    m.auteur_type === "prof"
                      ? "bg-sage-800 text-cream"
                      : "bg-cream text-ink border border-ink/10"
                  }`}
                >
                  <p className="text-[11px] font-semibold opacity-70 mb-0.5">
                    {m.auteur_type === "prof" ? "Prof" : m.auteur_nom} ·{" "}
                    {new Date(m.created_at).toLocaleString("fr-BE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="whitespace-pre-wrap break-words">{rendreContenu(m.contenu)}</p>
                </div>
              </div>
            );
          })}
          <div ref={finRef} />
        </div>

        {erreur && <p className="text-xs text-red-600 px-4">{erreur}</p>}

        <div className="relative border-t border-ink/10 px-3 py-2">
          {suggestions && suggestions.options.length > 0 && (
            <div className="absolute bottom-full left-3 right-3 mb-1 bg-white border border-ink/10 rounded-lg shadow-lg overflow-hidden z-10">
              {suggestions.options.map((m) => (
                <button
                  key={m.identifiant}
                  type="button"
                  onClick={() => choisirMention(m)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-cream transition flex items-center gap-2"
                >
                  <span className={m.role === "prof" ? "text-sage-800 font-semibold" : "text-ink"}>
                    {nomAffiche(m)}
                  </span>
                  {m.role === "prof" && <span className="text-[10px] text-ink/40 uppercase">Prof</span>}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              className="flex-1 text-sm px-3 py-2 rounded-full border border-ink/15 focus:outline-none focus:border-terracotta-600"
              placeholder="Écris un message, @ pour taguer quelqu'un..."
              value={texte}
              onChange={surChangementTexte}
              onKeyDown={(e) => e.key === "Enter" && !suggestions && envoyer()}
            />
            <button
              type="button"
              onClick={envoyer}
              disabled={envoi || !texte.trim()}
              className="shrink-0 bg-terracotta-600 text-cream text-sm font-semibold rounded-full px-4 py-2 hover:opacity-90 transition disabled:opacity-40"
            >
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
