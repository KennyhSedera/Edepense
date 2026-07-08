import { Depense } from "@/types/db";
import { db } from "../db";


export const ExpenseService = {

  add(depense: Depense) {
    db.runSync(
      `INSERT INTO depenses 
      (id, montant, categorie, description, date, items)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        depense.id,
        depense.montant,
        depense.categorie ?? "",
        depense.description ?? "",
        depense.date,
        JSON.stringify(depense.items ?? [])
      ]
    );
  },

  getAll(): Depense[] {
    const rows = db.getAllSync(`SELECT * FROM depenses ORDER BY date DESC`);

    return rows.map((r: any) => ({
      ...r,
      items: r.items ? JSON.parse(r.items) : []
    }));
  },

  delete(id: string) {
    db.runSync(`DELETE FROM depenses WHERE id = ?`, [id]);
  },

  getTotal(): number {
    const res: any = db.getAllSync(
      `SELECT SUM(montant) as total FROM depenses`
    );

    return res?.[0]?.total ?? 0;
  }
};