function depenseCoverImage(type: string) {
  const url = (() => {
    switch (type) {
      case 'Alimentation':
        return require('@/assets/images/depense/10861192.webp');
      case 'Transport':
        return require('@/assets/images/depense/bus.jpg');
      case 'Santé':
        return require('@/assets/images/depense/medicaments.jpg');
      case 'Loisirs':
        return require('@/assets/images/depense/loisirs.webp');
      case "Logement":
        return require('@/assets/images/depense/log.jpg');
      default:
        return require('@/assets/images/depense/loisirs.webp');
    }
  })();

  return url;
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