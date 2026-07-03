export type User = {
  id?: string;
  name: string;
  email: string;

  budget_mensuel: number | string;
  budget_journalier?: number | string;
  salaire_mensuel?: number | string;
  devise: string;

  date_debut: string;

  avatar?: string;

  created_at?: string;
  updated_at?: string;
};

export type Provision = {
  id: string;
  user_id?: string;

  nom: string;

  quantite_initiale: number;
  quantite_restante: number;

  categorie?: string;

  image?: string;

  unite: string;

  prix_total: number;
  prix_unitaire: number;

  consommation_estimee_par_jour?: number;

  date_achat: string;
  created_at: string;
};

export type BudgetTracker = {
  id: string;
  user_id: string;

  mois: string;

  budget_mensuel: number;
  depense_totale: number;

  budget_journalier_calcule: number;
  reste: number;

  jour_actuel: number;
};

export type Goal = {
  id: string;
  user_id?: string;

  titre: string;

  montant_cible: number;
  montant_actuel: number;

  date_limite: string;

  type: "epargne" | "reduction_depense";

  image?: string;

  created_at: string;
};

export type DepenseItem = {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  image?: string;
  total_price: number;
  unit?: string;
};

export type Depense = {
  id: string;
  montant: number;
  categorie?: string;
  description?: string;
  date: string;

  items?: DepenseItem[];
};

export type BudgetState = {
  devise: string;
  budgetJournalier: number;
  budgetMensuel: number;
  depenses: Depense[];

  setBudget: (b: number) => void;
  addDepense: (d: Depense) => void;
  removeDepense?: (id: string) => void;
  updateDepense?: (d: Depense) => void;
  setDevise?: (d: string) => void;
  removeAllDepenses?: () => void;
};