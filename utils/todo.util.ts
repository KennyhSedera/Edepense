
export function calculerPriorite(dateEcheance?: string): "basse" | "normale" | "haute" | undefined {
  if (!dateEcheance) return undefined;

  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);

  const echeance = new Date(dateEcheance);
  echeance.setHours(0, 0, 0, 0);

  const diffJours = Math.round((echeance.getTime() - aujourdhui.getTime()) / (1000 * 60 * 60 * 24));

  if (diffJours <= 1) return "haute";
  if (diffJours <= 3) return "normale";
  return "basse";
}