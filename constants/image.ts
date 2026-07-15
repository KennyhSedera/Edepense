const DEPENSE_IMAGES: Record<string, any> = {
  "Fruits & Légumes": require('@/assets/images/depense/fruit_legume.jpg'),
  "Fruits": require('@/assets/images/depense/fruit.jpg'),
  "Légumes": require('@/assets/images/depense/legume.jpg'),
  "Alimentation": require('@/assets/images/depense/fruit_legume.jpg'),
  "Viandes": require('@/assets/images/depense/viande.jpg'),
  "Épicerie": require('@/assets/images/depense/epicerie.jpg'),
  "Plats": require('@/assets/images/depense/plats.jpg'),
  "Épicerie sèche": require('@/assets/images/depense/epicerie.jpg'),
  "Produits laitiers": require('@/assets/images/depense/laitier.jpg'),
  "Viande & Poisson": require('@/assets/images/depense/viande-poisson.jpg'),
  "Boissons": require('@/assets/images/depense/boisson.jpg'),
  "Hygiène": require('@/assets/images/depense/medicaments.jpg'),
  "Vêtements": require('@/assets/images/depense/vetement.jpg'),
  "Vêtements et Accessoires": require('@/assets/images/depense/vetement.jpg'),
  "Autre": require('@/assets/images/depense/loisirs.webp'),
};

function depenseCoverImage(type: string) {
  return DEPENSE_IMAGES[type] ?? DEPENSE_IMAGES["Autre"];
}

function goalCoverImage(type: string) {
  const url = (() => {
    switch (type) {
      case 'epargne':
        return require('@/assets/images/depense/epargne.jpg');
      default:
        return require('@/assets/images/depense/reduction.jpg');
    }
  })();

  return url;
}

export { depenseCoverImage, goalCoverImage };