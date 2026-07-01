import { Depense, DepenseItem, Goal, Provision } from "@/types/db";
import { getDepense } from "./depense";
import { getGoal } from "./goal";
import { getProvision } from "./provision";

async function search(params: string) {

}

async function getGlobalSearch(params: string) {
  const search = params.toLowerCase();

  const depense = await getDepense();
  const provision = await getProvision();
  const goal = await getGoal();

  const filteredDepense = depense.filter((d: Depense) =>
    d.categorie?.toLowerCase().includes(search) ||
    d.date?.toLowerCase().includes(search) ||
    d.description?.toLowerCase().includes(search)
  );

  const matchesSearch = (i: DepenseItem) =>
    i.name?.toLowerCase().includes(search) ||
    i.total_price?.toString().includes(search) ||
    i.unit_price?.toString().includes(search) ||
    i.quantity?.toString().includes(search) ||
    i.unit?.toLowerCase().includes(search);

  const items: DepenseItem[] = depense.flatMap((d: Depense) => d.items?.filter(matchesSearch) ?? []);

  const filteredProvision = provision.filter((d: Provision) =>
    d.nom?.toLowerCase().includes(search) ||
    d.prix_total?.toString().toLowerCase().includes(search) ||
    d.unite?.toLowerCase().includes(search) ||
    d.date_achat?.toLowerCase().includes(search) ||
    d.created_at?.toLowerCase().includes(search) ||
    d.consommation_estimee_par_jour?.toString().toLowerCase().includes(search)
  );

  const filteredGoal = goal.filter((d: Goal) =>
    d.titre?.toLowerCase().includes(search) ||
    d.type?.toLowerCase().includes(search) ||
    d.date_limite?.toLowerCase().includes(search) ||
    d.montant_actuel?.toString().toLowerCase().includes(search) ||
    d.montant_cible?.toString().toLowerCase().includes(search) ||
    d.created_at?.toLowerCase().includes(search)
  );

  return { depense: filteredDepense, provision: filteredProvision, goal: filteredGoal, items }
}

export { getGlobalSearch, search }