// Chaque famille a une unité de référence (base = facteur 1)
type UniteFamille = "masse" | "volume" | "unite";

const FAMILLES: Record<UniteFamille, Record<string, number>> = {
  masse: {
    kg: 1,
    g: 0.001,
    mg: 0.000001,
  },
  volume: {
    l: 1,
    cl: 0.01,
    ml: 0.001,
  },
  unite: {
    unité: 1,
    pièce: 1,
    sachet: 1,
  },
};

function getFamille(unite: string): UniteFamille | null {
  for (const [famille, unites] of Object.entries(FAMILLES)) {
    if (unite in unites) return famille as UniteFamille;
  }
  return null;
}

/**
 * Retourne la liste des unités compatibles (même famille) qu'une unité donnée,
 * pour peupler un sélecteur d'unité de consommation.
 */
export function getUnitesCompatibles(unite: string): string[] {
  const famille = getFamille(unite);
  if (!famille) return [unite];
  return Object.keys(FAMILLES[famille]);
}

/**
 * Convertit une quantité d'une unité vers une autre, si elles sont de la même famille.
 * Retourne null si la conversion est impossible (familles différentes/unité inconnue).
 */
export function convertirUnite(quantite: number, deUnite: string, versUnite: string): number | null {
  if (deUnite === versUnite) return quantite;

  const familleDe = getFamille(deUnite);
  const familleVers = getFamille(versUnite);

  if (!familleDe || !familleVers || familleDe !== familleVers) return null;

  const valeurBase = quantite * FAMILLES[familleDe][deUnite];
  return valeurBase / FAMILLES[familleVers][versUnite];
}