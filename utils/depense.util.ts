import { Depense, DepenseItem } from "@/types/db";
import { PriceMode } from "@/types/global";

export function parseExpense(
  text: string,
  prix: PriceMode = "unit_price",
  categorie: string = "Alimentation"
): Depense {
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
      });
    }

    return items;
  }
  const items = parseWhatsAppParts(parts);

  const total = items.reduce(
    (acc, item) => acc + item.total_price,
    0
  );

  return {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    categorie,
    montant: total,
    items,
  };

}