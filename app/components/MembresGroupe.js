import { listerMembresGroupe } from "@/lib/groupeMembres";
import Avatar from "./Avatar";

// Trombinoscope du groupe : les élèves voient la photo et le prénom des
// autres membres (et du prof) - juste de quoi mettre un visage sur un nom
// dans le forum, rien de plus.
export default async function MembresGroupe({ groupeId }) {
  const { eleves, profs } = await listerMembresGroupe(groupeId);
  if (eleves.length === 0 && profs.length === 0) return null;

  return (
    <div className="mb-4 bg-white border border-ink/10 rounded-xl p-4">
      <p className="text-xs font-semibold text-ink/60 mb-3">Membres du groupe</p>
      <div className="flex flex-wrap gap-3">
        {profs.map((p) => (
          <div key={p.identifiant} className="flex flex-col items-center gap-1 w-14">
            <Avatar prenom={p.prenom} nom={p.nom} photoChemin={p.photo_chemin} taille={10} />
            <span className="text-[11px] text-ink/70 text-center leading-tight truncate w-full">
              {p.prenom || p.nom}
            </span>
            <span className="text-[9px] text-terracotta-600 font-semibold uppercase -mt-1">Prof</span>
          </div>
        ))}
        {eleves.map((e) => (
          <div key={e.identifiant} className="flex flex-col items-center gap-1 w-14">
            <Avatar prenom={e.prenom} nom={e.nom} photoChemin={e.photo_chemin} taille={10} />
            <span className="text-[11px] text-ink/70 text-center leading-tight truncate w-full">
              {e.prenom || e.nom}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
