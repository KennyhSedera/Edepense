import { Depense, DepenseItem } from "@/types/db";

export function parseExpense(
  text: string,
  prix: string = "Prix unitaire",
  categorie: string = "Alimentation"
): Depense {
  const cleaned = text
    .replace(/€/g, "")
    .replace(/Ar/gi, "")
    .trim();

  const parts = cleaned.split(/,|\n/);

  const items: DepenseItem[] = [];
  let total = 0;

  for (let raw of parts) {
    const p = raw.trim();
    if (!p) continue;

    let name = "";
    let quantity = 1;
    let unit = "autre";
    let price = 0;

    const tokens = p.split(" ");

    const unitMatch = p.match(/(kg|g|l|ml|piece|pièces|pièce|pieces|plaquette|paquet|carton|sac)/i);
    if (unitMatch) unit = unitMatch[1].toLocaleLowerCase();

    if (unit === "pièces" || unit === "pièce" || unit === "pieces") {
      unit = "piece"
    }

    const numericValues = tokens
      .map(t => Number(t.replace(/[^\d]/g, "")))
      .filter(n => !isNaN(n) && n > 0);


    price = Math.max(...numericValues);

    const filteredWords = tokens.filter(t => Number(t.replace(/[^\d]/g, "")) !== price && t !== unitMatch?.[1]);

    const qtyMatch = filteredWords
      .map(t => Number(t.replace(/[^\d]/g, "")))
      .find(n => !isNaN(n) && n > 0);
    if (qtyMatch) {
      quantity = Number(qtyMatch);
    }

    name = filteredWords
      .filter(t => isNaN(Number(t)))
      .join(" ")
      .trim();

    if (!name) continue;
    if (!price) continue;

    const safeQuantity = quantity && quantity > 0 ? quantity : 1;
    const unit_price = prix === "Prix unitaire" ? price : Math.round(price / safeQuantity);
    const total_price = prix === "Prix unitaire" ? price * safeQuantity : price;
    const id = Date.now().toString()

    items.push({
      id,
      name,
      quantity,
      unit: unit || "autre",
      unit_price,
      total_price,
    });

    total += total_price;
  }

  return {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    categorie,
    montant: total,
    items,
  };
}