import { LEGUMES, FRUITS, EPICERIE } from '@/constants/produit_malg';

// ============================================================================
// NORMALISATION DU CATALOGUE (les 3 listes ont des formes différentes)
// ============================================================================

export interface Produit {
  id: string;
  name: string;
  category: string;
  aliases: string[];
  units: string[];
}

function normaliserTexte(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // retire les accents
}

function normaliserEntree(raw: any): Produit {
  // Format A: { id, name, category, aliases, units }
  // Format B: { id, nom, malagasy, categorie, synonymes }
  const name = raw.name ?? raw.nom ?? '';
  const category = raw.category ?? raw.categorie ?? 'Autre';
  const aliasesBrutes = [
    ...(raw.aliases ?? []),
    ...(raw.synonymes ?? []),
    ...(raw.malagasy ? [raw.malagasy] : []),
  ];

  const aliases = Array.from(
    new Set([name, ...aliasesBrutes].filter(Boolean).map(normaliserTexte))
  );

  return {
    id: String(raw.id),
    name,
    category,
    aliases,
    units: raw.units ?? [],
  };
}

const CATALOGUE: Produit[] = [...LEGUMES, ...FRUITS, ...EPICERIE].map(normaliserEntree);

// Index alias -> produit, pour un lookup exact en O(1)
const INDEX_ALIAS = new Map<string, Produit>();
for (const produit of CATALOGUE) {
  for (const alias of produit.aliases) {
    // en cas de collision (alias partagé par 2 produits), le premier gagne
    if (!INDEX_ALIAS.has(alias)) INDEX_ALIAS.set(alias, produit);
  }
}

// ============================================================================
// MATCHING
// ============================================================================

/**
 * Retrouve un produit du catalogue à partir d'une description libre
 * (ex: "T-shirt", "Tomate", "2 vary", "riz gasy").
 * Essaie d'abord un match exact sur les alias, puis un match par inclusion.
 */
export function matchProduit(description: string): Produit | null {
  const texte = normaliserTexte(description.trim());
  if (!texte) return null;

  // 1. Match exact
  const exact = INDEX_ALIAS.get(texte);
  if (exact) return exact;

  // 2. Match par mot exact (ex: description = "2 tomates bien mûres")
  const mots = texte.split(/\s+/);
  for (const mot of mots) {
    const parMot = INDEX_ALIAS.get(mot);
    if (parMot) return parMot;
  }

  // 3. Match par inclusion — le plus long alias qui apparaît dans le texte
  //    (évite qu'un alias court comme "ail" matche à tort dans "détail")
  let meilleur: { produit: Produit; longueur: number } | null = null;
  for (const [alias, produit] of INDEX_ALIAS) {
    if (alias.length < 3) continue; // évite les faux positifs sur alias trop courts
    const regex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    if (regex.test(texte) && (!meilleur || alias.length > meilleur.longueur)) {
      meilleur = { produit, longueur: alias.length };
    }
  }

  return meilleur?.produit ?? null;
}

/**
 * Enrichit une liste d'articles détectés avec le produit du catalogue correspondant.
 * Utile pour corriger/normaliser le nom et assigner une catégorie fiable par article.
 */
export function enrichirArticles<T extends { description: string; unit?: string | null }>(
  items: T[]
): (T & { produit: Produit | null; categorie: string })[] {
  return items.map((item) => {
    const produit = matchProduit(item.description);
    return {
      ...item,
      produit,
      categorie: produit?.category ?? 'Autre',
      // Si l'unité n'était pas détectée, on peut suggérer l'unité par défaut du produit
      unit: item.unit ?? produit?.units?.[0] ?? null,
    };
  });
}

/**
 * Déduit la catégorie globale d'une dépense à partir de ses articles enrichis
 * (la catégorie la plus fréquente parmi les articles matchés).
 */
export function categorieDominante(articlesEnrichis: { categorie: string }[]): string {
  if (articlesEnrichis.length === 0) return 'Autre';

  const compte = new Map<string, number>();
  for (const a of articlesEnrichis) {
    compte.set(a.categorie, (compte.get(a.categorie) ?? 0) + 1);
  }

  let meilleure = 'Autre';
  let max = 0;
  for (const [cat, n] of compte) {
    if (n > max) { max = n; meilleure = cat; }
  }
  return meilleure;
}