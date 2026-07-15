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

  password?: string;
  password_salt?: string;

  created_at?: string;
  updated_at?: string;
};

export type Provision = {
  id: string;
  user_id: string;
  nom: string;
  quantite_initiale: number;
  quantite_restante: number;
  categorie?: string;
  image?: string;
  unite: string;
  prix_total: number;
  prix_unitaire: number;
  consommation_estimee_par_jour?: number;
  alerte_stock_envoyee?: boolean;
  date_achat: string;
  created_at: string;
};

export type ProvisionConsommation = {
  id: string;
  provision_id: string;
  user_id: string;
  quantite: number;
  date: string;
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

export type GoalFrequency = "unique" | "journalier" | "hebdomadaire" | "mensuel";

export type Goal = {
  id: string;
  user_id: string;
  titre: string;
  type: "epargne" | "reduction_depense";
  frequence?: GoalFrequency;

  montant_regulier?: number;
  source?: string;

  montant_cible?: number;
  montant_actuel: number;

  image?: string | null;

  date_limite?: string;
  created_at: string;
};

export type DepenseItem = {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  image?: string | null;
  total_price: number;
  unit?: string;
};

export type Depense = {
  id: string;
  montant: number;
  categorie?: string;
  description?: string;
  date: string;
  user_id: string;

  audio_uri?: string;

  items?: DepenseItem[];
};

export type Budget = {
  id: string;
  budgetName: string;
  budgetTotal: number;
  budgetRestant: number;
  budgetDateReinitialise: string;
  budgetImage?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type UserConnected = {
  id: string;
  name: string;
  email: string;
  budget_mensuel: number;
  budget_journalier: number;
  salaire_mensuel: number;
  devise: string;
  date_debut: string;
  avatar: string | null;
  created_at: string;
  updated_at: string;
};

export interface ScanResult {
  merchant: string | null;
  devise: string;
  observation: string | null;
  rawText?: string | null;
  textClair?: string | null;
  depense: Depense[];
  provision: Provision[];
}

export type Action = {
  value: "Copier" | "Modifier" | "Supprimer" | "Annuler" | "Valider" | "Voir";
  label: string;
}

export type Message = {
  id: string;
  user_id: string;
  message: string;
  sender_type: "app" | "user";
  type: "text" | "image" | "audio";
  reponse_id?: string;
  read: boolean;
  action?: Action[] | null;
  data?: any;
  created_at: string;
  updated_at: string;
};

export type Todo = {
  id: string;
  titre: string;
  description?: string;
  completed: boolean;
  date_echeance?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type CourseItem = {
  id: string;
  nom: string;
  quantite?: number;
  unite?: string;
  achete: boolean;
  produit_id?: string;
};

export type ListeCourse = {
  id: string;
  titre: string;
  items: CourseItem[];
  user_id: string;
  date_achat?: string | undefined;
  created_at: string;
  updated_at: string;
};

export type NotificationType =
  | "budget_alert"
  | "budget_reminder"
  | "depense_alert"
  | "depense_reminder"
  | "depense_new"
  | "provision_new"
  | "provision_alert"
  | "provision_reminder"
  | "goal_achieved"
  | "goal_reminder"
  | "todo_reminder"
  | "system"
  | "info";

export interface NotificationData {
  pathName?: string;
  id?: string;
  [key: string]: any;
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data?: NotificationData;
  created_at: string;
  updated_at: string;
}