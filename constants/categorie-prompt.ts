import { LEGUMES, FRUITS, EPICERIE } from '@/constants/produit_malg';

// Catégories "non-alimentaires" : pas de catalogue produit dédié pour l'instant,
// donc listées manuellement (à étoffer si tu crées des catalogues Vêtements, Hygiène, etc.)
const CATEGORIES_HORS_CATALOGUE: { nom: string; exemples: string }[] = [
  { nom: 'Viandes', exemples: 'zébu, porc, poulet, viande hachée, saucisse, etc.' },
  { nom: 'Poissons et Fruits de mer', exemples: 'poisson, crevette, calamar, crustacé, etc.' },
  { nom: 'Produits laitiers', exemples: 'lait, fromage, yaourt, beurre, etc.' },
  { nom: 'Boissons', exemples: 'eau, jus, soda, bière, boissons diverses' },
  { nom: 'Snacks et Confiseries', exemples: 'biscuits, bonbons, chocolat, chips' },
  { nom: 'Produits ménagers', exemples: 'savon, lessive, détergent, papier toilette, etc.' },
  { nom: 'Hygiène et Beauté', exemples: 'shampoing, dentifrice, cosmétique, etc.' },
  { nom: 'Aliments pour animaux', exemples: 'viande pour animaux, graines pour animaux, etc.' },
  { nom: 'Vêtements et Accessoires', exemples: 'vetements, chaussures, accessoires, etc.' },
  { nom: 'Jouets et Jeux', exemples: 'jouets, jeux, etc.' },
  { nom: 'Education et Loisirs', exemples: 'livres, jeux video, livres de poche, etc.' },
  { nom: 'Autres', exemples: '' },
];

/**
 * Construit dynamiquement le bloc "liste de catégories" à insérer dans les prompts,
 * en dérivant les catégories alimentaires depuis le catalogue produits (source unique de vérité)
 * et en complétant avec les catégories hors-catalogue.
 */
export function genererBlocCategories(): string {
  // Catégories du catalogue produit, dédupliquées, avec quelques exemples de noms
  const parCategorie = new Map<string, string[]>();
  for (const p of [...LEGUMES, ...FRUITS, ...EPICERIE]) {
    const cat = (p as any).category ?? (p as any).categorie ?? 'Autre';
    const nom = (p as any).name ?? (p as any).nom;
    if (!parCategorie.has(cat)) parCategorie.set(cat, []);
    if (nom && parCategorie.get(cat)!.length < 4) parCategorie.get(cat)!.push(nom.toLowerCase());
  }

  // Normalisation des noms de catégorie catalogue -> noms "officiels" du prompt
  const RENOMMAGE: Record<string, string> = {
    'Épicerie': 'Épicerie sèche',
    'Fruit': 'Fruits',
    'Légumes': 'Légumes',
    'Fruits': 'Fruits',
  };

  const lignesCatalogue = Array.from(parCategorie.entries()).map(([cat, exemples]) => {
    const nomOfficiel = RENOMMAGE[cat] ?? cat;
    return `  - ${nomOfficiel}(${exemples.join(', ')}, etc.)`;
  });

  const lignesHorsCatalogue = CATEGORIES_HORS_CATALOGUE.map(
    (c) => `  - ${c.nom}${c.exemples ? ` (${c.exemples})` : ''}`
  );

  // Dédoublonnage (Fruits/Légumes pourraient apparaître une seule fois grâce au Map, ok)
  return [...lignesCatalogue, ...lignesHorsCatalogue].join('\n');
}