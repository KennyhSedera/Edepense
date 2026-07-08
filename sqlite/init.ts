import { db } from "@/sqlite/db";


export function initDB() {

  // =========================
  // 👤 USERS
  // =========================
  db.execSync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      budget_mensuel REAL,
      budget_journalier REAL,
      salaire_mensuel REAL,
      devise TEXT,
      date_debut TEXT,
      avatar TEXT,
      created_at TEXT,
      updated_at TEXT
    );
  `);

  // 👇 migration safe
  const cols = db.getAllSync(`PRAGMA table_info(users);`) as Array<{ name: string }>;
  const hasPassword = cols.some((c: { name: string }) => c.name === "password");
  const hasSalt = cols.some((c: { name: string }) => c.name === "password_salt");

  if (!hasPassword) {
    db.execSync(`ALTER TABLE users ADD COLUMN password TEXT;`);
  }

  if (!hasSalt) {
    db.execSync(`ALTER TABLE users ADD COLUMN password_salt TEXT;`);
  }

  // =========================
  // 💸 DEPENSES
  // =========================
  db.execSync(`
    CREATE TABLE IF NOT EXISTS depenses (
      id TEXT PRIMARY KEY,
      montant REAL NOT NULL,
      categorie TEXT,
      description TEXT,
      date TEXT NOT NULL,
      items TEXT
    );
  `);

  db.execSync(`
    CREATE INDEX IF NOT EXISTS idx_depenses_date
    ON depenses(date);
  `);

  db.execSync(`
    CREATE INDEX IF NOT EXISTS idx_depenses_categorie
    ON depenses(categorie);
  `);

  // =========================
  // 📦 PROVISIONS (stock)
  // =========================
  db.execSync(`
    CREATE TABLE IF NOT EXISTS provisions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      nom TEXT NOT NULL,
      quantite_initiale REAL,
      quantite_restante REAL,
      categorie TEXT,
      image TEXT,
      unite TEXT,
      prix_total REAL,
      prix_unitaire REAL,
      consommation_estimee_par_jour REAL,
      date_achat TEXT,
      created_at TEXT
    );
  `);

  // =========================
  // 🎯 GOALS
  // =========================
  db.execSync(`
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      titre TEXT NOT NULL,
      montant_cible REAL,
      montant_actuel REAL,
      date_limite TEXT,
      type TEXT,
      image TEXT,
      created_at TEXT
    );
  `);

  db.execSync(`
    CREATE INDEX IF NOT EXISTS idx_goals_user
    ON goals(user_id);
  `);

  // =========================
  // 📊 BUDGET TRACKER
  // =========================
  db.execSync(`
    CREATE TABLE IF NOT EXISTS budget_tracker (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      mois TEXT NOT NULL,
      budget_mensuel REAL,
      depense_totale REAL,
      budget_journalier_calcule REAL,
      reste REAL,
      jour_actuel INTEGER
    );
  `);

  db.execSync(`
    CREATE INDEX IF NOT EXISTS idx_budget_user_mois
    ON budget_tracker(user_id, mois);
  `);

  // =========================
  // ⚙️ SETTINGS (optionnel mais utile)
  // =========================
  db.execSync(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      theme TEXT,
      langue TEXT,
      notifications INTEGER
    );
  `);

  // =========================
  // 🧾 LOGS (optionnel debug / audit)
  // =========================
  db.execSync(`
    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      type TEXT,
      message TEXT,
      date TEXT
    );
  `);

}