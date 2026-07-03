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
  const label = UNITE.find(u => u.value?.toLocaleLowerCase() === v?.toLocaleLowerCase())?.label
  return label ? label : v?.toLocaleLowerCase() || "Autre";
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
];

const DIMENSION = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
}

export { getGoalType, getUnitLabel, CATEGORIES, CATEGORIES_PROVISION, UNITE, ITEMS_DATE, DIMENSION };