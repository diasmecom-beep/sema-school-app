"use client";

import { useEffect, useRef, useState } from "react";

// Chat texte simple, un fil par groupe, entre élèves et prof. Rafraîchi par
// sondage (pas de dépendance temps réel) — largement suffisant pour du Q&A
// de cours.
export default function Chat({ groupeId, role }) {
  const [messages, setMessages] = useState([]);
  const [texte, setTexte] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const finRef = useRef(null);
  const premierChargement = useRef(true);

  async function charger() {
    try {
      const res = await fetch(`/api/messages?groupeId=${encodeURIComponent(groupeId)}`);
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch {
      // silencieux — on réessaiera au prochain sondage
    } finally {
      if (premierChargement.current) {
        premierChargement.current = false;
      }
    }
  }

  useEffect(() => {
    charger();
    const id = setInterval(charger, 4000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupeId]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);

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
      setMessages((m) => [...m, data.message]);
    } catch {
      setErreur("Échec de l'envoi.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="flex flex-col border border-ink/10 rounded-xl overflow-hidden bg-white">
      <div className="max-h-80 overflow-y-auto px-4 py-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-sm text-ink/40 text-center py-6">
            Aucun message pour l&rsquo;instant — pose ta première question ici.
          </p>
        )}
        {messages.map((m) => {
          const estMoi = m.auteur_type === role;
          return (
            <div key={m.id} className={`flex ${estMoi ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  m.auteur_type === "prof"
                    ? "bg-sage-800 text-cream"
                    : "bg-cream text-ink border border-ink/10"
                }`}
              >
                <p className="text-[11px] font-semibold opacity-70 mb-0.5">
                  {m.auteur_type === "prof" ? "Prof" : m.auteur_nom} ·{" "}
                  {new Date(m.created_at).toLocaleString("fr-BE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="whitespace-pre-wrap break-words">{m.contenu}</p>
              </div>
            </div>
          );
        })}
        <div ref={finRef} />
      </div>

      {erreur && <p className="text-xs text-red-600 px-4">{erreur}</p>}

      <div className="flex items-center gap-2 border-t border-ink/10 px-3 py-2">
        <input
          className="flex-1 text-sm px-3 py-2 rounded-full border border-ink/15 focus:outline-none focus:border-terracotta-600"
          placeholder="Écris ta question..."
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && envoyer()}
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
  );
}
