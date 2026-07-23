import { ANALYSE_PROMPT, GROQ_PROMPT } from "@/constants/prompt";
import { Depense, Provision } from "@/types/db";
import { PriceMode } from "@/types/global";

function parseExpense(
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

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

async function groq(text: string, priceMode: PriceMode): Promise<any> {
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

  const { depense, provision, textClair } = parseDataGroq(final, priceMode);

  const result = JSON.stringify({ depense, provision, textClair }, null, 2);

  return result;
}

function retirerBlocReflexion(texte: string): string {
  return texte.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

function parseDataGroq(params: string, priceMode?: PriceMode) {
  function extraireJSON(text: string): string {
    const texteNettoye = retirerBlocReflexion(text);
    const debut = texteNettoye.indexOf('{');
    const fin = texteNettoye.lastIndexOf('}');

    if (debut === -1 || fin === -1) {
      throw new Error('Aucun JSON trouvé dans la réponse: ' + text);
    }

    return texteNettoye.substring(debut, fin + 1);
  }

  let parsed: any = null;

  try {
    const texteNettoye = extraireJSON(params);
    parsed = JSON.parse(texteNettoye);
  } catch (err) {
    return { depense: [], provision: [], textClair: retirerBlocReflexion(params) };
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
        elements_inclus: !priceMode ? cat.elements_inclus : cat.elements_inclus.map((prod: any) => recalculerPrix(prod, priceMode)),
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

  return { depense, provision, textClair: parsed.textClair };
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

// ANALYSE TEXT
async function analyseText(text: string) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: ANALYSE_PROMPT(text) }],
    }),
  });

  const data = await response.json();

  const result = data.choices[0].message.content;

  return result;
}

const MESSAGE_HORS_SUJET = "Désolé, ce texte ne semble pas contenir de données relatives à des dépenses ou à des achats.";

function nettoyerCommentaireMeta(texte: string): string {
  const t = texte.trim();

  if (t.includes(MESSAGE_HORS_SUJET)) {
    return MESSAGE_HORS_SUJET;
  }

  return t;
}

function extraireJsonDeReponse<T = any>(texte: string): T | null {
  const matchAvecLangage = texte.match(/```json\s*([\s\S]*?)```/i);
  if (matchAvecLangage) {
    try {
      return JSON.parse(matchAvecLangage[1].trim());
    } catch (e) {
      console.warn("Échec parsing JSON (bloc ```json):", e);
    }
  }

  const matchGenerique = texte.match(/```\s*([\s\S]*?)```/);
  if (matchGenerique) {
    try {
      return JSON.parse(matchGenerique[1].trim());
    } catch (e) {
      console.warn("Échec parsing JSON (bloc générique):", e);
    }
  }

  const indexDebut = texte.indexOf("{");
  const indexFin = texte.lastIndexOf("}");

  if (indexDebut !== -1 && indexFin !== -1 && indexFin > indexDebut) {
    const candidat = texte.slice(indexDebut, indexFin + 1);
    try {
      return JSON.parse(candidat);
    } catch (e) {
      console.warn("Échec parsing JSON (extraction brute):", e);
    }
  }

  return null;
}

function extraireTexte(texte: string): string {
  let texteClair = texte.trim();

  const matchComplet = texte.match(
    /(?:---|###)\s*PARTIE\s*1\s*:\s*TEXTE\s*CLAIR\s*(.*?)\s*(?:---|###)\s*PARTIE\s*2\s*:\s*FORMAT\s*JSON/si
  );

  if (matchComplet?.[1]) {
    texteClair = matchComplet[1].trim();
  } else {
    const matchPartie2 = texte.match(/(?:---|###)\s*PARTIE\s*2\s*:\s*FORMAT\s*JSON/si);
    if (matchPartie2?.index !== undefined) {
      texteClair = texte.slice(0, matchPartie2.index).trim();
    } else {
      const separateurJson = texte.indexOf("```json");
      if (separateurJson !== -1) {
        texteClair = texte.slice(0, separateurJson).trim();
      } else {
        const indexAccolade = texte.indexOf('{');
        if (indexAccolade !== -1) {
          texteClair = texte.slice(0, indexAccolade).trim();
        }
      }
    }
  }

  texteClair = nettoyerSeparateursOrphelins(texteClair);
  texteClair = nettoyerCommentaireMeta(texteClair);
  return texteClair;
}

function extraireTexteEtJson(texte: string) {
  const texteClair = extraireTexte(texte);
  const json = extraireJsonDeReponse(texte);

  if (!json) {
    return { texteClair, json: null };
  }

  const { depense, provision } = parseDataGroq(JSON.stringify(json));
  return { texteClair, json: { depense, provision } };
}

function nettoyerSeparateursOrphelins(texte: string): string {
  return texte
    .replace(/(?:---|###)\s*PARTIE\s*2\s*:\s*FORMAT\s*JSON\s*(?:---|###)?\s*$/si, "")
    .replace(/^(?:---|###)\s*PARTIE\s*1\s*:\s*TEXTE\s*CLAIR\s*(?:---|###)?\s*/si, "")
    .split('\n')
    .filter((ligne) => !/^\s*(?:-{2,}|#{2,})\s*$/.test(ligne))
    .join('\n')
    .trim();
}

export { fusionnerCategoriesDupliquees, analyseText, parseDataGroq, groq, parseExpense, extraireTexteEtJson, extraireTexte };