const HEURE_DEBUTANT = "19h30 – 20h30";
const HEURE_INTERMEDIAIRE = "20h45 – 21h45";

// Un groupe = un jour + une langue + un niveau. Chaque groupe aura, à terme,
// sa propre visioconférence (voir la discussion sur l'accès Zoom par groupe).
export const GROUPES = [
  { id: "tshiluba-debutant", jour: "LUNDI", langue: "Tshiluba", niveau: "débutant", horaire: HEURE_DEBUTANT },
  { id: "tshiluba-intermediaire", jour: "LUNDI", langue: "Tshiluba", niveau: "intermédiaire", horaire: HEURE_INTERMEDIAIRE },
  { id: "swahili-debutant", jour: "MARDI", langue: "Swahili", niveau: "débutant", horaire: HEURE_DEBUTANT },
  { id: "swahili-intermediaire", jour: "MARDI", langue: "Swahili", niveau: "intermédiaire", horaire: HEURE_INTERMEDIAIRE },
  { id: "lingala-debutant", jour: "MERCREDI", langue: "Lingala", niveau: "débutant", horaire: HEURE_DEBUTANT },
  { id: "lingala-intermediaire", jour: "MERCREDI", langue: "Lingala", niveau: "intermédiaire", horaire: HEURE_INTERMEDIAIRE },
  { id: "kikongo-debutant", jour: "JEUDI", langue: "Kikongo", niveau: "débutant", horaire: HEURE_DEBUTANT },
  { id: "kikongo-intermediaire", jour: "JEUDI", langue: "Kikongo", niveau: "intermédiaire", horaire: HEURE_INTERMEDIAIRE },
];

export function groupesParJour() {
  const jours = ["LUNDI", "MARDI", "MERCREDI", "JEUDI"];
  return jours.map((jour) => ({
    jour,
    groupes: GROUPES.filter((g) => g.jour === jour),
  }));
}

export const ETAPES = [
  { n: 1, titre: "Définis tes besoins et tes objectifs" },
  { n: 2, titre: "Teste ton niveau" },
  { n: 3, titre: "Rejoins ton groupe" },
];

// Les textes sont incrustés directement dans les photos (pas de texte à
// dupliquer par-dessus).
export const TEMOIGNAGES = [
  { photo: "/images/slider/slide-pas-a-pas.jpg" },
  { photo: "/images/slider/slide-tout-age.jpg" },
  { photo: "/images/slider/slide-etudiant.jpg" },
  { photo: "/images/slider/slide-oser-parler.jpg" },
  { photo: "/images/slider/slide-racines.jpg" },
  { photo: "/images/slider/slide-opportunites.jpg" },
];

export const FORMULES = [
  {
    id: "annuel",
    nom: "Annuel",
    prix: 320,
    frequence: null,
    valabilite: "Valable 8 mois",
    features: ["Cours en ligne", "Accès à la communauté", "Exercices supplémentaires"],
    populaire: false,
    stripeLink: "https://buy.stripe.com/00wdR8bh30UYb0d8hh7g409",
  },
  {
    id: "trimestriel",
    nom: "Trimestriel",
    prix: 130,
    frequence: null,
    valabilite: "Valable 8 mois",
    features: ["Cours en ligne", "Accès à la communauté", "Exercices supplémentaires"],
    populaire: false,
    stripeLink: "https://buy.stripe.com/aFacN4cl7bzC1pDbtt7g408",
  },
  {
    id: "mensuel",
    nom: "Mensuel",
    prix: 49,
    frequence: "Tous les mois",
    valabilite: "Valable 8 mois",
    features: ["Cours en ligne", "Accès à la communauté", "Exercices complémentaires"],
    populaire: true,
    stripeLink: "https://buy.stripe.com/bJe3cu2KxdHKb0d4117g402",
  },
  {
    id: "etudiant",
    nom: "Étudiant·es",
    prix: 35,
    frequence: "Tous les mois",
    conditions: "Disposer d'une carte d'étudiant·e valable - avoir maximum 25 ans",
    valabilite: "Valable 8 mois",
    features: ["Cours en ligne", "Accès à la communauté", "Exercices complémentaires"],
    populaire: false,
    stripeLink: "https://buy.stripe.com/dRmcN4dpbcDG7O1fJJ7g403",
  },
];
