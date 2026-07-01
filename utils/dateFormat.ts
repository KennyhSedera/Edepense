export function toISODate(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateForDisplay(isoDate: string) {
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

export const MOIS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export function formatDateStringForDisplay(isoDate: string) {
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const [year, month, day] = parts;
  const monthIndex = parseInt(month, 10) - 1;
  const monthName = MOIS_FR[monthIndex] ?? month;
  return `${parseInt(day, 10)} ${monthName} ${year}`;
}

export function getDaysInMonth(year: number, month: number) {
  // month: 1-12
  return new Date(year, month, 0).getDate();
}

export function buildYearRange(centerYear: number, span: number) {
  const years: number[] = [];
  for (let y = centerYear - span; y <= centerYear; y++) {
    years.push(y);
  }
  return years;
}

export function formatDateLong(isoDate: string) {
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const [year, month, day] = parts;
  const monthName = MOIS_FR[parseInt(month, 10) - 1] ?? month;
  return `${parseInt(day, 10)} ${monthName} ${year}`;
}

export function getDateFin(dateDebut: string): string {
  const debut = new Date(dateDebut);

  const fin = new Date(debut);
  fin.setMonth(fin.getMonth() + 1);
  fin.setDate(fin.getDate() - 1);

  return fin.toISOString().split("T")[0];
}

export function getInfosPeriode(dateDebut: string) {
  const debut = new Date(dateDebut);

  const fin = new Date(debut);
  fin.setMonth(fin.getMonth() + 1);
  fin.setDate(fin.getDate() - 1);

  const aujourdHui = new Date();

  debut.setHours(0, 0, 0, 0);
  fin.setHours(0, 0, 0, 0);
  aujourdHui.setHours(0, 0, 0, 0);

  const nombreJours =
    Math.floor((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const joursRestants = Math.max(
    0,
    Math.floor((fin.getTime() - aujourdHui.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );

  const joursEcoules = Math.max(
    0,
    Math.floor((aujourdHui.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24))
  );

  return {
    dateDebut: debut.toISOString().split("T")[0],
    dateFin: fin.toISOString().split("T")[0],
    nombreJours,
    joursRestants,
    joursEcoules,
    totalSemaines: Math.ceil(nombreJours / 7),
    semainesRestantes: Math.ceil(joursRestants / 7),
  };
}

export function getSemaines(dateDebut: string) {
  const debut = new Date(dateDebut);

  const fin = new Date(debut);
  fin.setMonth(fin.getMonth() + 1);
  fin.setDate(fin.getDate() - 1);

  const semaines = [];

  let debutSemaine = new Date(debut);

  while (debutSemaine <= fin) {
    const finSemaine = new Date(debutSemaine);
    finSemaine.setDate(finSemaine.getDate() + 6);

    // Ne pas dépasser la fin de période
    if (finSemaine > fin) {
      finSemaine.setTime(fin.getTime());
    }

    semaines.push({
      dateDebut: debutSemaine.toISOString().split("T")[0],
      dateFin: finSemaine.toISOString().split("T")[0],
    });

    debutSemaine = new Date(finSemaine);
    debutSemaine.setDate(debutSemaine.getDate() + 1);
  }

  return semaines;
}


export function getDepenseParSemaine(date: string, depenses: any[]) {
  const debut = new Date(date);

  const fin = new Date(debut);
  fin.setMonth(fin.getMonth() + 1);
  fin.setDate(fin.getDate() - 1);

  const semaines = [];

  let start = new Date(debut);
  let index = 1;

  while (start <= fin) {
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    if (end > fin) {
      end.setTime(fin.getTime());
    }

    const total = depenses
      .filter((d) => {
        const dDate = new Date(d.date);
        return dDate >= start && dDate <= end;
      })
      .reduce((sum, d) => sum + Number(d.montant || 0), 0);

    semaines.push({
      id: `S${index}`,
      total,
    });

    index++;

    start = new Date(end);
    start.setDate(start.getDate() + 1);
  }

  return semaines;
}

export function getCycleStart(date: string, jourFixe: number) {
  const d = new Date(date);

  let start = new Date(d.getFullYear(), d.getMonth(), jourFixe);

  if (d.getDate() < jourFixe) {
    start.setMonth(start.getMonth() - 1);
  }

  return start;
}