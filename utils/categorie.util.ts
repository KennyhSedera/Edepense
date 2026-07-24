import { LEGUMES, FRUITS, EPICERIE, LOGEMENT, ABONNEMENT, TRANSPORT } from '@/constants/produit_malg';

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
  { nom: 'Transports', exemples: 'bus, train, avion, bateau, frais, colis, etc.' },
  { nom: 'Autres', exemples: '' },
];

export function genererBlocCategories(): string {
  const parCategorie = new Map<string, string[]>();
  for (const p of [...LEGUMES, ...FRUITS, ...EPICERIE, ...LOGEMENT, ...ABONNEMENT, ...TRANSPORT]) {
    const cat = (p as any).category ?? (p as any).categorie ?? 'Autre';
    const nom = (p as any).name ?? (p as any).nom;
    if (!parCategorie.has(cat)) parCategorie.set(cat, []);
    if (nom && parCategorie.get(cat)!.length < 4) parCategorie.get(cat)!.push(nom.toLowerCase());
  }

  const RENOMMAGE: Record<string, string> = {
    'Épicerie': 'Épicerie sèche',
    'Fruit': 'Fruits',
    'Légume': 'Légumes',
    'Légumes': 'Légumes',
    'Fruits': 'Fruits',
    'Viande': 'Viandes',
    'Viandes': 'Viandes',
  };

  const lignesCatalogue = Array.from(parCategorie.entries()).map(([cat, exemples]) => {
    const nomOfficiel = RENOMMAGE[cat] ?? cat;
    return `  - ${nomOfficiel}(${exemples.join(', ')}, etc.)`;
  });

  const lignesHorsCatalogue = CATEGORIES_HORS_CATALOGUE.map(
    (c) => `  - ${c.nom}${c.exemples ? ` (${c.exemples})` : ''}`
  );

  return [...lignesCatalogue, ...lignesHorsCatalogue].join('\n');
}

export function obtenirListeCategories(): string[] {
  const parCategorie = new Map<string, string[]>();
  for (const p of [...LEGUMES, ...FRUITS, ...EPICERIE, ...LOGEMENT, ...ABONNEMENT, ...TRANSPORT]) {
    const cat = (p as any).category ?? (p as any).categorie ?? 'Autre';
    if (!parCategorie.has(cat)) parCategorie.set(cat, []);
  }

  const RENOMMAGE: Record<string, string> = {
    'Épicerie': 'Épicerie sèche',
    'Fruit': 'Fruits',
    'Légume': 'Légumes',
    'Légumes': 'Légumes',
    'Fruits': 'Fruits',
    'Viande': 'Viandes',
    'Viandes': 'Viandes',
  };

  const nomsCatalogue = Array.from(parCategorie.keys()).map((cat) => RENOMMAGE[cat] ?? cat);
  const nomsHorsCatalogue = CATEGORIES_HORS_CATALOGUE.map((c) => c.nom);

  return Array.from(new Set([...nomsCatalogue, ...nomsHorsCatalogue]));
}

export const GROUPES_BUDGET_SUGGERES: Record<string, string[]> = {
  'Alimentaire': [
    'Légumes', 'Fruits', 'Épicerie sèche', 'Viandes',
    'Poissons et Fruits de mer', 'Produits laitiers', 'Boissons', 'Snacks et Confiseries',
  ],
  'Maison': ['Produits ménagers', 'Hygiène et Beauté'],
  'Famille': ['Vêtements et Accessoires', 'Jouets et Jeux', 'Education et Loisirs', 'Aliments pour animaux'],
  'Transports': ['Transports'],
  'Autres': ['Autres'],
}