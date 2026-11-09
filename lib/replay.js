// Le champ « lien du replay » accepte soit un lien seul, soit exactement ce que
// Zoom copie avec « Copier le lien avec le code secret » :
// "https://...zoom.us/rec/share/...  Mot de passe: XXXX". On en tire le lien
// (pour le bouton) et le code (affiché dessous, à saisir sur la page Zoom).
export function analyserReplay(valeur) {
  const texte = (valeur || "").trim();
  const lien = texte.match(/https?:\/\/\S+/)?.[0] || texte;
  const code = texte.match(/(?:mot de passe|passcode|code(?: secret)?)\s*:\s*(\S+)/i)?.[1] || null;
  return { lien, code };
}
