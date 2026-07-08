import { Depense, Provision } from "@/types/db";
import { PriceMode } from "@/types/global";

export function parseExpense(
  text: string,
  prix: PriceMode = "unit_price",
  categorie: string = "Alimentation"
): any {
  const cleaned = text
    .replace(/€/g, "")
    .replace(/Ar/gi, "")
    .trim();

  const parts = cleaned.split(/,|\n/);

  function parseWhatsAppParts(parts: string[]) {
    const items = [];

    const normalizeUnit = (u: string) =>
      u
        .toLowerCase()
        .replace(/pièces|pièce|pieces/g, "piece");

    const unitRegex =
      /\b(kg|g|l|ml|piece|pièce|pièces|kapoaka|sac)\b/i;

    const parseFraction = (value: string): number => {
      if (/^\d+\/\d+$/.test(value)) {
        const [a, b] = value.split("/").map(Number);
        return a / b;
      }
      return Number(value);
    };

    // Heuristique : détermine si un item est une provision selon unité + quantité
    const isProvision = (unit: string, quantity: number): boolean => {
      const uniteNormalisee = unit.toLowerCase();

      // "sac" est toujours une provision (achat en gros volume par nature)
      if (uniteNormalisee === "sac") return true;

      // Légumineuses/oléagineux en kapoaka, à partir de 2-3 unités = stock
      if (uniteNormalisee === "kapoaka" && quantity >= 2) return true;

      // Grosse quantité en kg (riz, farine, etc.) = provision
      if (uniteNormalisee === "kg" && quantity >= 3) return true;

      // Grosse quantité en litres (huile, etc.)
      if (uniteNormalisee === "l" && quantity >= 2) return true;

      return false;
    };

    for (const part of parts) {
      const tokens = part.trim().split(" ");
      if (!tokens.length) continue;

      let quantity = 1;
      let unit = "autre";

      const unitMatch = part.match(unitRegex);

      if (unitMatch) {
        unit = normalizeUnit(unitMatch[1]);
      }

      const qtyMatch = part.match(/(\d+\/\d+|\d+(\.\d+)?)/);

      if (qtyMatch) {
        if (qtyMatch[1].includes("/")) {
          const [a, b] = qtyMatch[1].split("/").map(Number);
          quantity = a / b;
        } else {
          quantity = Number(qtyMatch[1]);
        }
      }

      const numbers = tokens
        .map(t => Number(t.replace(/[^\d]/g, "")))
        .filter(n => !isNaN(n) && n > 0);

      const price =
        Number(tokens[tokens.length - 1].replace(/[^\d]/g, "")) ||
        Math.max(...numbers) ||
        0;

      const name = tokens
        .filter(t => {
          const clean = t.toLowerCase();

          if (unitRegex.test(clean)) return false;
          if (/^\d+$/.test(clean)) return false;
          if (/^\d+\/\d+$/.test(clean)) return false;
          if (clean === "") return false;

          return true;
        })
        .join(" ")
        .trim();

      if (!name || !price) continue;

      const safeQuantity = quantity > 0 ? quantity : 1;

      let unit_price = 0;
      let total_price = 0;

      if (prix === "unit_price") {
        unit_price = price;
        total_price = Math.round(price * safeQuantity);
      } else {
        total_price = price;
        unit_price =
          safeQuantity > 0
            ? Math.round(price / safeQuantity)
            : price;
      }

      items.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        quantity: safeQuantity,
        unit,
        unit_price,
        total_price,
        est_une_provision: isProvision(unit, safeQuantity),
      });
    }

    return items;
  }

  const items = parseWhatsAppParts(parts);

  const total = items.reduce(
    (acc, item) => acc + item.total_price,
    0
  );

  const depense: Depense = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    categorie,
    montant: total,
    description: "",
    user_id: "",
    items,
  };

  const provision = items.filter((item) => item.est_une_provision).map((prod, i) => ({
    id: `${Date.now().toString()}_${i}`,
    nom: prod.name,
    quantite_initiale: prod.quantity,
    quantite_restante: prod.quantity,
    categorie: categorie,
    unite: prod.unit,
    prix_unitaire: prod.unit_price,
    prix_total: prod.total_price,
    image: null,
    date_achat: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }));

  return { depense, provision };
}

function GROQ_PROMPT(text: string, prixMode: 'unit_price' | 'total_price'): string {
  return `
  Agis comme un extracteur de données, un expert en formatage JSON et un analyste de données de consommation.

  Prends la liste de courses brute fournie ci-dessous, analyse chaque ligne, regroupe et fusionne les produits appartenant à la MÊME CATÉGORIE, puis convertis le tout en un objet JSON standardisé.

  Voici la liste brute à traiter :
  ${text}

  Consignes strictes d'analyse et de calcul :
  1. CATÉGORISER : Déduis automatiquement la catégorie logique de chaque produit (ex: "Épicerie", "Légumes", "Céréales", "Légumineuses", etc.) en fonction de son nom.
  2. MODE DE PRIX IMPOSE : Tous les prix listés par l'utilisateur dans le texte brut doivent obligatoirement être interprétés comme étant des "${prixMode}".
  3. CALCULS MATHÉMATIQUES CONCORDANTS (applique EXACTEMENT ces formules, ne dévie pas) :
     - "prix_fourni" : Le montant exact extrait de la liste brute, sans modification.
     - "type_prix_fourni" : Doit obligatoirement valoir la chaîne exacte "${prixMode}".
     
     ${prixMode === 'unit_price' ? `
     Le mode imposé est "unit_price" (le prix donné par l'utilisateur est un PRIX UNITAIRE) :
     - "prix_unitaire" = prix_fourni (copie exacte, sans calcul)
     - "prix_total" = quantite × prix_fourni

     Exemple concret : quantite=3, prix_fourni=1200
       -> prix_unitaire = 1200
       -> prix_total = 3 × 1200 = 3600
     ` : `
     Le mode imposé est "total_price" (le prix donné par l'utilisateur est un PRIX TOTAL déjà calculé) :
     - "prix_unitaire" = prix_fourni ÷ quantite
     - "prix_total" = prix_fourni (copie exacte, sans calcul)

     Exemple concret : quantite=3, prix_fourni=3600
       -> prix_unitaire = 3600 ÷ 3 = 1200
       -> prix_total = 3600
     `}

     - "montant_total_categorie" : Somme exacte de tous les "prix_total" des produits de cette catégorie.
     - "montant_total_liste" : Somme exacte de tous les "montant_total_categorie".

  4. COMBINER PAR CATÉGORIE : Regroupe les produits par catégorie. Le tableau final "categories_combinees" contient les catégories. Chacune embarque une courte description de la catégorie et la liste de ses produits dans "elements_inclus".
  5. ÉLÉMENT PROVISION : Évalue pour CHAQUE produit s'il constitue une "provision" (achat de stockage à long terme ou gros volume, ex: Sac de riz) -> true, ou s'il s'agit d'une consommation courante (petite quantité, produit frais) -> false.
  6. ANALYSE GLOBALE : Rédige une description textuelle globale qui résume l'objectif de la liste de courses et son coût.

  Structure attendue du JSON final :
  {
    "description_globale": "Texte décrivant globalement la liste de courses après analyse...",
    "montant_total_liste": 0,
    "categories_combinees": [
      {
        "categorie": "Nom de la catégorie (ex: Légumes)",
        "description_categorie": "Une courte phrase résumant l'usage ou le type d'articles de cette catégorie spécifique...",
        "montant_total_categorie": 0,
        "elements_inclus": [
          {
            "nom": "Nom du produit",
            "quantite": 0,
            "unite": "Unité de mesure",
            "prix_fourni": 0,
            "prix_unitaire": 0,
            "type_prix_fourni": "${prixMode}",
            "prix_total": 0,
            "est_une_provision": false
          }
        ]
      }
    ]
  }

  Retourne UNIQUEMENT le code JSON valide. N'ajoute aucun texte explicatif, aucune introduction, ni aucune conclusion. Ne mets pas de commentaires dans le JSON.
  `;
}

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

export async function groq(text: string, priceMode: PriceMode): Promise<any> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: GROQ_PROMPT(text, priceMode) }],
    }),
  });

  const data = await response.json();

  const final = data.choices[0].message.content;

  const { depense, provision } = parseDataGroq(final, priceMode);

  const result = JSON.stringify({ depense, provision }, null, 2);

  return result;
}

export function parseDataGroq(params: string, priceMode?: PriceMode) {

  function extraireJSON(text: string): string {
    const debut = text.indexOf('{');
    const fin = text.lastIndexOf('}');

    if (debut === -1 || fin === -1) {
      throw new Error('Aucun JSON trouvé dans la réponse: ' + text);
    }

    return text.substring(debut, fin + 1);
  }

  let parsed: any = null;

  try {
    const texteNettoye = extraireJSON(params);
    parsed = JSON.parse(texteNettoye);
  } catch (err) {
    console.error('Erreur extraction/parsing JSON:', err);
    console.error('Contenu brut reçu:', params);
    throw new Error("Impossible de parser la réponse de l'IA");
  }

  function recalculerPrix(prod: any, prixModeGlobal?: PriceMode) {
    const quantite = prod.quantite || 1;
    const prixFourni = prod.prix_fourni;

    const modeEffectif: PriceMode = prixModeGlobal ?? prod.type_prix_fourni ?? 'total_price';

    if (modeEffectif === 'unit_price') {
      return {
        ...prod,
        prix_unitaire: prixFourni,
        prix_total: quantite * prixFourni,
        type_prix_fourni: modeEffectif,
      };
    } else {
      return {
        ...prod,
        prix_unitaire: prixFourni / quantite,
        prix_total: prixFourni,
        type_prix_fourni: modeEffectif,
      };
    }
  }

  const dataFinal = {
    merchant: parsed.merchant ?? null,
    date: parsed.date ?? null,
    observation: parsed.observation ?? null,
    rawText: parsed.rawText ?? null,
    description_globale: parsed.description_globale,
    montant_total_liste: parsed.montant_total_liste,
    categories_combinees: fusionnerCategoriesDupliquees(
      parsed.categories_combinees.map((cat: any) => ({
        categorie: cat.categorie,
        description_categorie: cat.description_categorie,
        montant_total_categorie: cat.montant_total_categorie,
        elements_inclus: cat.elements_inclus.map((prod: any) => recalculerPrix(prod, priceMode)),
      }))
    ),
  };

  const depense: Depense[] = dataFinal.categories_combinees.map((cat: any, index: number) => ({
    id: `${Date.now().toString()}_${index}`,
    description: cat.description_categorie,
    montant: cat.elements_inclus.reduce((acc: number, prod: any) => acc + prod.prix_total, 0),
    date: dataFinal.date ?? new Date().toISOString(),
    categorie: cat.categorie,
    user_id: "",
    items: cat.elements_inclus.map((prod: any, i: number) => ({
      id: `${Date.now().toString()}_${index}_${i}`,
      name: prod.nom,
      quantity: prod.quantite,
      unit: prod.unite,
      unit_price: prod.prix_unitaire,
      total_price: prod.prix_total,
      image: null,
    })),
  }));

  const provision: Provision[] = dataFinal.categories_combinees.flatMap((cat: any, index: number) =>
    cat.elements_inclus
      .filter((prod: any) => prod.est_une_provision)
      .map((prod: any, i: number) => ({
        id: `${Date.now().toString()}_${index}_${i}`,
        nom: prod.nom,
        quantite_initiale: prod.quantite,
        quantite_restante: prod.quantite,
        categorie: cat.categorie,
        unite: prod.unite,
        prix_unitaire: prod.prix_unitaire,
        prix_total: prod.prix_total,
        image: null,
        date_achat: dataFinal.date ?? new Date().toISOString(),
        created_at: new Date().toISOString(),
      }))
  );

  return { depense, provision };
}


function fusionnerCategoriesDupliquees(categories: any[]): any[] {
  const map = new Map<string, any>();

  for (const cat of categories) {
    const cle = cat.categorie.trim().toLowerCase();

    if (map.has(cle)) {
      const existante = map.get(cle);
      existante.elements_inclus.push(...cat.elements_inclus);
      existante.montant_total_categorie += cat.montant_total_categorie;
    } else {
      map.set(cle, { ...cat, elements_inclus: [...cat.elements_inclus] });
    }
  }

  return Array.from(map.values());
}