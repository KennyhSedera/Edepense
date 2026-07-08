import React from "react";
import { ImageSourcePropType } from "react-native";

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
  user_id: string;

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
  depense: Depense[];
  provision: Provision[];
}

export type Message = {
  id: string;
  user_id: string;
  message: string;
  sender_type: "app" | "user";
  type: "text" | "image" | "audio";
  reponse_id?: string;
  read: boolean;
  action?: string | string[] | null | undefined | number | Date | boolean | object | any | any[] | ImageSourcePropType;
  created_at: string;
  updated_at: string;
};