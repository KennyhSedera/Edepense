import { Calendar, ListChecks, MessageSquareText, PiggyBank, ScanLine, Sparkles, TrendingUp, Wallet } from "lucide-react-native";
import { Dimensions } from "react-native";

function getGoalType(type: string) {
  const t = (() => {
    switch (type) {
      case "epargne":
        return "Epargné";
      case "reduction_depense":
        return "Réduction depense";
      default:
        "Réduction dépense";
    }
  })();

  return t;
}

const CATEGORIES = [
  "Alimentation",
  "Transport",
  "Santé",
  "Loisirs",
  "Logement",
  "Autre",
];

const CATEGORIES_PROVISION = [
  "légumes", "céréales", "autre"
];

const UNITE = [
  { label: "Kg", value: "kg" },
  { label: "g", value: "g" },
  { label: "L", value: "L" },
  { label: "Pièces", value: "piece" },
  { label: "Plaquette", value: "plaquette" },
  { label: "Paquet", value: "paquet" },
  { label: "Carton", value: "carton" },
  { label: "Sac", value: "sac" },
  { label: "Autre", value: "autre" }
];

function getUnitLabel(v: string): string {
  const label =
    UNITE.find(
      u => u.value?.toLowerCase() === v?.toLowerCase()
    )?.label;

  const text = label || v?.toLowerCase() || "Autre";

  return text.charAt(0).toUpperCase() + text.slice(1);
}

const ITEMS_DATE = [
  {
    value: 'yesterday',
    label: 'Hier'
  },
  {
    value: 'today',
    label: 'Aujourd\'hui'
  },
  {
    value: 'currentMonth',
    label: 'Cette mois'
  },
  {
    value: 'currentYear',
    label: 'Cette année'
  },
  {
    value: 'all',
    label: 'Toutes'
  }
];

const DIMENSION = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
}

const FEATURESWELCOME = [
  { icon: ScanLine, title: "Scan de tickets", desc: "OCR intelligent, remplissage automatique.", color: "#6366F1", bg: "#d9ddff" },
  { icon: Wallet, title: "Budget maîtrisé", desc: "Plafond mensuel et journalier, alertes incluses.", color: "#F59E0B", bg: "#FEF6E7" },
  { icon: ListChecks, title: "Dépenses par article", desc: "Détail précis, prix unitaire et total.", color: "#10B981", bg: "#E9F9F3" },
  { icon: MessageSquareText, title: "Saisie éclair", desc: "Ajoutez une dépense en une phrase.", color: "#EC4899", bg: "#FDEEF5" },
  { icon: PiggyBank, title: "Objectifs d'épargne", desc: "Suivez votre progression en direct.", color: "#8B5CF6", bg: "#F2EEFE" },
  { icon: TrendingUp, title: "Prévisions", desc: "Anticipez votre solde de fin de mois.", color: "#0EA5E9", bg: "#E8F6FD" },
  { icon: Calendar, title: "Rappels", desc: "Dépenses récurrentes planifiées.", color: "#F43F5E", bg: "#FEECEF" },
  { icon: Sparkles, title: "Statistiques", desc: "Graphiques clairs de vos finances.", color: "#14B8A6", bg: "#E7F9F6" },
];

const BARHEIGHTS = [
  12, 24, 18, 32, 20, 28, 14, 36,
  26, 16, 30, 22, 10, 34, 20, 28,
  18, 32, 24, 14, 30, 22, 36, 16,
  12, 24, 18, 32, 20, 28, 14, 36,
  26, 16, 30, 22, 10, 34, 20,
];

const BARHEIGHTSMESSAGE = [
  6, 12, 9, 16, 10, 14, 7, 18,
  13, 8, 15, 11, 5, 17, 10, 14,
  9, 16, 12, 7, 15, 11, 18, 8,
  6, 12, 9, 16, 10, 14, 7, 18,
  13, 8,
];

export { getGoalType, getUnitLabel, CATEGORIES, CATEGORIES_PROVISION, UNITE, ITEMS_DATE, DIMENSION, FEATURESWELCOME, BARHEIGHTS, BARHEIGHTSMESSAGE };