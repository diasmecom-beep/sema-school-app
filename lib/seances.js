import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { genererDatesSeances } from "@/lib/calendrier";
import { GROUPES } from "@/lib/content";

// Toutes les données ici passent par supabaseAdmin (clé service_role) — à
// n'appeler que depuis des server components ou des routes API, jamais
// depuis un composant client.

// Liste les séances d'un groupe (déjà pré-créées par scripts/initialiser.mjs)
// avec leurs matériaux, triées par date. Si une séance attendue par le
// calendrier n'existe pas encore en base, elle est quand même renvoyée avec
// des champs vides (ne bloque jamais l'affichage).
export async function listerSeancesGroupe(groupeId) {
  const groupe = GROUPES.find((g) => g.id === groupeId);
  if (!groupe || !supabaseAdmin) return [];

  const datesAttendues = genererDatesSeances(groupe.jour);

  const { data: seances } = await supabaseAdmin
    .from("seances")
    .select("id, date, echeance_devoir, notes, replay_lien")
    .eq("groupe_id", groupeId)
    .order("date", { ascending: true });

  const parDate = new Map((seances || []).map((s) => [s.date, s]));

  const seanceIds = (seances || []).map((s) => s.id);
  let materiauxParSeance = new Map();
  if (seanceIds.length) {
    const { data: materiaux } = await supabaseAdmin
      .from("materiaux")
      .select("id, seance_id, type, titre, url, created_at")
      .in("seance_id", seanceIds)
      .order("created_at", { ascending: true });
    materiauxParSeance = new Map();
    for (const m of materiaux || []) {
      if (!materiauxParSeance.has(m.seance_id)) materiauxParSeance.set(m.seance_id, []);
      materiauxParSeance.get(m.seance_id).push(m);
    }
  }

  return datesAttendues.map((date) => {
    const existante = parDate.get(date);
    const id = existante?.id || `${groupeId}__${date}`;
    return {
      id,
      groupeId,
      date,
      echeanceDevoir: existante?.echeance_devoir || null,
      notes: existante?.notes || "",
      replayLien: existante?.replay_lien || "",
      materiaux: materiauxParSeance.get(id) || [],
    };
  });
}

// Récupère, pour un groupe, les devoirs remis par élève (map seance_id ->
// tableau de devoirs). Si eleveIdentifiant est fourni, ne renvoie que ceux
// de cet élève (vue élève) ; sinon tous (vue prof).
export async function listerDevoirsGroupe(groupeId, eleveIdentifiant = null) {
  if (!supabaseAdmin) return new Map();

  const { data: seances } = await supabaseAdmin.from("seances").select("id").eq("groupe_id", groupeId);
  const seanceIds = (seances || []).map((s) => s.id);
  if (!seanceIds.length) return new Map();

  let query = supabaseAdmin
    .from("devoirs_remis")
    .select("id, seance_id, eleve_identifiant, fichier_nom, chemin_storage, soumis_at")
    .in("seance_id", seanceIds)
    .order("soumis_at", { ascending: false });

  if (eleveIdentifiant) query = query.eq("eleve_identifiant", eleveIdentifiant);

  const { data: devoirs } = await query;

  const parSeance = new Map();
  for (const d of devoirs || []) {
    if (!parSeance.has(d.seance_id)) parSeance.set(d.seance_id, []);
    parSeance.get(d.seance_id).push(d);
  }
  return parSeance;
}

// S'assure qu'une séance existe en base (créée à la volée si le seed n'a pas
// encore tourné) — utilisé avant tout INSERT qui référence seance_id.
export async function assurerSeance(groupeId, date) {
  const id = `${groupeId}__${date}`;
  await supabaseAdmin.from("seances").upsert({ id, groupe_id: groupeId, date }, { onConflict: "id" });
  return id;
}
