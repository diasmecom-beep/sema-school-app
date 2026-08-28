// Petite photo de profil ronde, ou des initiales si aucune photo n'a été
// ajoutée. Marche aussi bien en server component (pas de hooks).
//
// Tailwind doit voir les classes complètes dans le code source pour les
// générer - d'où cette table plutôt qu'un template `h-${taille}`.
const DIMENSIONS = {
  6: "h-6 w-6",
  8: "h-8 w-8",
  10: "h-10 w-10",
  12: "h-12 w-12",
  20: "h-20 w-20",
};

export default function Avatar({ prenom, nom, photoChemin, taille = 8 }) {
  const initiales = `${prenom?.[0] || ""}${nom?.[0] || ""}`.toUpperCase() || "?";
  const dimension = DIMENSIONS[taille] || DIMENSIONS[8];

  if (photoChemin) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/api/fichier?chemin=${encodeURIComponent(photoChemin)}`}
        alt=""
        className={`${dimension} rounded-full object-cover border border-ink/10 shrink-0`}
      />
    );
  }

  return (
    <span
      className={`${dimension} rounded-full bg-sage-800 text-cream flex items-center justify-center font-display font-extrabold shrink-0`}
      style={{ fontSize: taille <= 8 ? "0.6rem" : "0.9rem" }}
    >
      {initiales}
    </span>
  );
}
