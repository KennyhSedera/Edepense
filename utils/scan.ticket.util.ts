import * as FileSystem from 'expo-file-system';
import { analyseText, extraireTexteEtJson, parseDataGroq } from "./depense.util";
import { Depense, DepenseItem, ScanResult } from "@/types/db";
import TextRecognition from "@react-native-ml-kit/text-recognition";
import { GEMINI_RECEIPT_PROMPT } from '@/constants/prompt';
import { ParsedReceipt, ReceiptItem } from '@/types/global';
import { CATEGORY_EMOJIS } from '@/constants/type';
import { normalizeCurrency } from './number.util';
import { formatDateLong, toISODate } from './date.util';
import { categorieDominante, enrichirArticles } from './produit-matcher';

// With Groq
export const GROQ_KEYS = [
  process.env.EXPO_PUBLIC_GROQ_API_KEY,
  process.env.EXPO_PUBLIC_GROQ_API_KEY_2,
].filter(Boolean) as string[];
export const GROQ_VISION_MODELS = [
  'qwen/qwen3.6-27b',
  'meta-llama/llama-4-maverick-17b-128e-instruct',
];
export async function callGroqVisionWithRetry(
  base64: string | null,
  text: string,
  maxRetries = 2
): Promise<any> {
  if (!base64) {
    return { error: { code: 400, message: 'Aucune image fournie pour callGroqVisionWithRetry' } };
  }

  const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;

  const body = {
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text },
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${cleanBase64}` },
          },
        ],
      },
    ],
    temperature: 0.2,
    max_completion_tokens: 4096,
  };

  for (const model of GROQ_VISION_MODELS) {
    console.log(`[Groq Vision] Tentative globale avec ${model}...`);

    keyLoop: for (const key of GROQ_KEYS) {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({ ...body, model }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          const data = await response.json();


          if (!data.error) {
            const text = data.choices[0].message.content;

            const textAnysed = await analyseText(text);

            const { texteClair, json } = extraireTexteEtJson(textAnysed);

            return {
              depense: json?.depense ?? [],
              provision: json?.provision ?? [],
              textClair: texteClair,
            };
          }

          const errorCode = data.error?.code ?? response.status;

          if ((errorCode === 503 || response.status === 503) && attempt < maxRetries) {
            const delay = attempt === 0 ? 3000 : 5000;
            console.warn(`Groq 503 [${model}], attente de ${delay}ms avant retry...`);
            await new Promise((r) => setTimeout(r, delay));
            continue;
          }

          if (errorCode === 429 || response.status === 429) {
            console.warn(`[${model}] Quota épuisé sur cette clé. Clé suivante.`);
            continue keyLoop;
          }

          if (errorCode === 400 || errorCode === 401 || response.status === 401) {
            console.warn(`[${model}] Clé invalide ou requête rejetée (${errorCode}). Clé suivante.`);
            continue keyLoop;
          }

          console.warn(`[${model}] Échec code ${errorCode} sur cette clé. Clé suivante.`);
          continue keyLoop;
        } catch (fetchError: any) {
          clearTimeout(timeoutId);

          if (fetchError.name === 'AbortError') {
            console.warn(`[${model}] Requête expirée (Timeout 15s) sur cette clé.`);
          } else {
            console.error(`Erreur réseau sur [${model}]:`, fetchError);
          }

          if (attempt < maxRetries) {
            await new Promise((r) => setTimeout(r, 2000));
            continue;
          }
          continue keyLoop;
        }
      }
      await new Promise((r) => setTimeout(r, 300));
    }
    console.warn(`[${model}] Épuisé sur toutes les clés. Modèle suivant...`);
  }
  return { error: { code: 503, message: 'Toutes les clés/modèles Groq Vision indisponibles' } };
}

// With Gemini
export const GEMINI_KEYS = [
  process.env.EXPO_PUBLIC_GEMINI_API_KEY_1,
  process.env.EXPO_PUBLIC_GEMINI_API_KEY_2,
  process.env.EXPO_PUBLIC_GEMINI_API_KEY_3,
  process.env.EXPO_PUBLIC_GEMINI_API_KEY_4,
  process.env.EXPO_PUBLIC_GEMINI_API_KEY_5,
  process.env.EXPO_PUBLIC_GEMINI_API_KEY_6,
];
export const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
];
export async function callGeminiWithRetry(base64: string | null, text: string, maxRetries = 2): Promise<any> {
  const parts: any[] = [];

  if (base64) {
    const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } });
  }
  parts.push({ text });
  const body = { contents: [{ parts }] };

  for (const model of GEMINI_MODELS) {
    console.log(`[Modèle ciblé] Tentative globale avec ${model}...`);

    for (const key of GEMINI_KEYS) {
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);

        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          const data = await response.json();

          if (!data.error) {
            const text = data.contents[0].parts[1].text;

            const { depense, provision, textClair } = parseDataGroq(text);
            return { depense, provision, textClair };
          }

          const errorCode = data.error.code;

          if (errorCode === 503 && attempt < maxRetries) {
            const delay = attempt === 0 ? 3000 : 5000;
            console.warn(`Gemini 503 [${model}], attente de ${delay}ms avant retry...`);
            await new Promise((r) => setTimeout(r, delay));
            continue;
          }

          if (errorCode === 429) {
            console.warn(`[${model}] Quota épuisé sur cette clé. Passage à la clé suivante.`);
            break;
          }

          if (errorCode === 400) {
            console.warn(`[${model}] Clé invalide (400). Passage à la clé suivante.`);
            break;
          }

          console.warn(`[${model}] Échec code ${errorCode} sur cette clé. Clé suivante.`);
          break;
        } catch (fetchError: any) {
          clearTimeout(timeoutId);

          if (fetchError.name === 'AbortError') {
            console.warn(`[${model}] Requête expirée (Timeout 7s) sur cette clé.`);
            return { error: { code: 503, message: 'Requête expirée (Timeout 7s) sur cette clé.' } };
          } else {
            console.error(`Erreur réseau sur [${model}]:`, fetchError);
          }

          if (attempt < maxRetries) {
            await new Promise((r) => setTimeout(r, 2000));
            continue;
          }
          break;
        }
      }
      await new Promise((r) => setTimeout(r, 300));
    }
    console.warn(`[${model}] Épuisé sur toutes les clés. Modèle suivant...`);
  }
  return { error: { code: 429, message: 'Toutes les requêtes ont expiré ou ont été rejetées.' } };
}


// Function principal
export async function scanReceipt(base64: string, prompt: string, uri: string) {
  let result = await callGroqVisionWithRetry(base64, prompt, 2);

  // if (result.error || result === null || result === undefined) {
  //   console.warn('Groq Vision indisponible, fallback vers Gemini...');
  //   result = await callGeminiWithRetry(base64, prompt, 2);
  // }

  // if (result.error || result === null || result === undefined) {
  //   console.warn('Gemini indisponible, fallback vers OCR...');
  //   result = await scanReceiptOffline(uri);
  // }

  return result;
}

export async function sendDataToScan(uri: string): Promise<ScanResult> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  let res: any;

  try {
    res = await scanReceipt(base64, GEMINI_RECEIPT_PROMPT(), uri);
  } catch (error) {
    console.warn(error);
  }

  return res;
}


// Function offline OCR
async function textRecognize(uri: string): Promise<string> {
  const result = await TextRecognition.recognize(uri);
  return result.text;
}
export async function scanReceiptOffline(uri: string): Promise<ScanResult> {
  const text = await textRecognize(uri);
  const result = await scanReceiptOfflineText(text);
  return result;
}
function nettoyerOCR(rawText: string): string {
  return rawText.replace(/(\d)[oO](?=\D|$)/g, '$10').replace(/[oO](\d)/g, '0$1');
}
export function parseReceipt(rawTextBrut: string): ParsedReceipt {
  const rawText = nettoyerOCR(rawTextBrut);
  const lines = rawText.split('\n');
  let total: string | null = null;
  let currency: string | null = null;
  let isUncertain = false;
  const currencyPattern = '(ariary|mga|eur|usd|ar|a|€|\\$)';
  const numberPattern = '(\\d{1,3}(?:[\\s]\\d{3})*(?:[.,]\\d{2})?|\\d{1,6}[.,]\\d{2}|\\d{1,5})';
  const candidates: {
    value: string;
    currency: string;
    line: string;
  }[] = [];

  const isMessyReceipt = /destqhelion|impaye|exp[eé]diteur|destinataire|colis|transport/i.test(rawText);
  const isBank = /banque|virement|compte|access|deposit/i.test(rawText);

  const lignesMontant = lines.filter(line => /(total|montant|paiement|pay[eé]|à payer|a payer|net à payer)/i.test(line));

  for (const line of lignesMontant) {
    const match = line.match(/(\d{1,3}(?:\s\d{3})*(?:[.,]\d{2})?)/);
    if (match) {
      total = cleanLeadingZeros(match[1].replace(/\s/g, '').replace(',', '.'));
      break;
    }
  }

  for (const line of lines) {
    const currencyBeforeNumber = new RegExp(`\\b${currencyPattern}\\s{0,3}${numberPattern}\\b`, 'gi');
    const numberBeforeCurrency = new RegExp(`\\b${numberPattern}\\s{0,3}${currencyPattern}\\b`, 'gi');
    let m;

    while ((m = currencyBeforeNumber.exec(line)) !== null) {
      const valeur = m[2].replace(/\s/g, '').replace(',', '.');
      const nombre = parseFloat(valeur);
      if (nombre < 1 || nombre > 1000000) continue;
      if (/^\d{9,12}$/.test(valeur)) continue;

      candidates.push({ value: m[2], currency: m[1].toUpperCase(), line });
    }

    while ((m = numberBeforeCurrency.exec(line)) !== null) {
      const valeur = m[1].replace(/\s/g, '').replace(',', '.');
      const nombre = parseFloat(valeur);
      if (nombre < 1 || nombre > 1000000) continue;
      if (/^\d{9,12}$/.test(valeur)) continue;
      candidates.push({ value: m[1], currency: m[2].toUpperCase(), line });
    }
  }

  if (!total && candidates.length) {
    let filtered = [...candidates];
    filtered = filtered.filter(c => {
      const n = parseFloat(c.value.replace(/\s/g, '').replace(',', '.'));
      if (n < 1) return false;
      if (n > 1000000) return false;
      if (isMessyReceipt && n > 100000) return false;
      if (isBank && n < 100) return false;
      return true;
    });

    const scored = filtered.map(c => {
      const n = parseFloat(c.value.replace(/\s/g, '').replace(',', '.'));
      let score = 0;
      if (n < 10000) score += 120;
      if (n < 100000) score += 40;
      if (/total|montant|paiement|payer|a payer/i.test(c.line)) score += 100;
      if (/^\s*[\$€aAr]+\s*\d/i.test(c.line)) score += 60;
      if (n > 100000) score -= 200;
      return { ...c, score };
    });

    if (scored.length) {
      const best = scored.reduce((a, b) => b.score > a.score ? b : a);
      total = cleanLeadingZeros(best.value.replace(/\s/g, '').replace(',', '.'));
      currency = normalizeCurrency(best.currency) || "MGA";
    }
  }

  const date = normalizeDate(rawText);
  if (!date) isUncertain = true;

  const merchant = extractMerchant(lines);
  const items = extractItems(lines, rawText);

  total = extractTotal(rawText);

  return {
    rawText, total, currency, date, merchant, items, isUncertain,
    observation: null,
    categorie: deduireCategorie(rawText, merchant),
  };
}

function estUneFactureFormelle(rawText: string): boolean {
  return /(recu\s*n|montant total|facture postpaid|mode de r[eè]glement)/i.test(rawText);
}
function extraireLignesAvecDevise(lines: string[]): { description: string; amount: string }[] {
  const pattern = /\bAr\s*(\d{1,3}(?:[\s]\d{3})*(?:[.,]\d{2})?)\b/gi;
  const results: { description: string; amount: string }[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 3) continue;

    let m;
    while ((m = pattern.exec(trimmed)) !== null) {
      const amount = m[1].replace(/\s/g, '').replace(',', '.');
      const description = trimmed.slice(0, m.index).trim();
      results.push({ description: description || 'Montant', amount });
    }
  }

  return results;
}
function extractMerchant(lines: string[]): string | null {
  const noise = /^(ks|photos?|une,?\s*\d*|page\s*\d*)$/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 2) continue;
    if (noise.test(trimmed)) continue;
    if (/^\d+$/.test(trimmed)) continue;
    if (/^[A-Z0-9\-]{8,}$/.test(trimmed)) continue;
    if (/\d{6,}/.test(trimmed)) continue;
    if (/(client|montant|compte|date|recu|facture)/i.test(trimmed)) continue;
    if (/(tel|phone|nif|rcs|id|ref|compte|client)/i.test(line)) continue;

    return trimmed.replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return null;
}
function deduireCategorie(rawText: string, merchant: string | null): string {
  const texte = `${rawText} ${merchant ?? ''}`.toLowerCase();
  if (/(accessbank|banque|depot|versement)/i.test(texte)) return "Banque";
  if (/(garderie|école|universite|université|frais scolaire)/i.test(texte)) return "Education";
  if (/(socks|shirt|pants|shoe|t-shirt)/i.test(texte)) return "Vêtements";
  if (/(transport|expediteur|destinataire|colis)/i.test(texte)) return "Transport";
  if (/(orange|telma|airtel|postpaid|forfait|recharge|credit.*telephon)/i.test(texte)) return 'Téléphonie';
  if (/orange money/i.test(rawText)) return 'Téléphonie';
  if (/(jirama|electricit|eau|facture.*logement|loyer)/i.test(texte)) return 'Logement';
  if (/(pharmacie|clinique|hopital|medecin|medicament)/i.test(texte)) return 'Santé';
  if (/(taxi|bus|transport|carburant|essence|gasoil)/i.test(texte)) return 'Transport';
  if (/(expediteur|destinataire|transport|colis)/i.test(rawText)) return "Transport";
  if (/access|banque|deposit|voucher|compte/i.test(rawText)) return "Banque";

  return 'Autre';
}
interface LigneArticle {
  quantite: number;
  description: string;
}
function extraireLignesArticles(lines: string[]): LigneArticle[] {
  const pattern = /^(\d+)\s*[xX]\s*(.+)$/;
  const articles: LigneArticle[] = [];

  for (const line of lines) {
    const match = line.trim().match(pattern);
    if (match) {
      articles.push({ quantite: Number(match[1]), description: match[2].trim() });
    }
  }
  return articles;
}
function extrairePrixIsoles(lines: string[]): number[] {
  const pattern = /^[\$€]?\s*(\d{1,3}(?:[\s.,]\d{3})*(?:[.,]\d{2})?)\s*$/;
  const prix: number[] = [];

  for (const line of lines) {
    const match = line.trim().match(pattern);
    if (match) {
      const valeur = parseFloat(match[1].replace(/\s/g, '').replace(',', '.'));
      if (!isNaN(valeur) && valeur > 0) prix.push(valeur);
    }
  }
  return prix;
}
function extractItems(lines: string[], rawText: string): ReceiptItem[] {
  if (estUneFactureFormelle(rawText)) {
    const ligneMontantTotal = lines.find((l) => /montant total/i.test(l));
    if (ligneMontantTotal) {
      const match = ligneMontantTotal.match(/Ar\s*(\d{1,3}(?:[\s]\d{3})*(?:[.,]\d{2})?)/i);
      if (match) {
        const amount = match[1].replace(/\s/g, '').replace(',', '.');
        return [{ description: 'Facture Postpaid', amount, quantity: '1', unit: null }];
      }
    }
    const lignesAvecDevise = extraireLignesAvecDevise(lines);
    if (lignesAvecDevise.length > 0) {
      const meilleur = lignesAvecDevise.reduce((a, b) =>
        parseFloat(b.amount) > parseFloat(a.amount) ? b : a
      );
      return [{ description: meilleur.description || 'Facture', amount: meilleur.amount, quantity: '1', unit: null }];
    }
    return [];
  }

  const numberPattern = /(\d{1,3}(?:[\s]\d{3})+(?:[.,]\d{2})?|\d{1,6}[.,]\d{2})/g;
  const excludeLine =
    /(total|tel|t[ée]l|nif|stat|client|date|page|signature|adresse|fianarantsoa|antananarivo|^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|n[°o]|num[ée]ro|recu|ticket|rcs|cif|agent|cash|change|thank you)/i;

  const itemsMemeLigne: ReceiptItem[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 4) continue;
    if (excludeLine.test(trimmed)) continue;

    const matches = [...trimmed.matchAll(numberPattern)];
    if (matches.length === 0) continue;

    const lastMatch = matches[matches.length - 1];
    const amount = lastMatch[0].replace(/\s/g, '').replace(',', '.');
    const description = trimmed.slice(0, lastMatch.index).trim();
    if (description.length < 2) continue;

    itemsMemeLigne.push({ description, amount, quantity: null, unit: null });
  }

  if (itemsMemeLigne.length > 0) return itemsMemeLigne;

  const articles = extraireLignesArticles(lines);
  const prixIsoles = extrairePrixIsoles(lines);

  if (articles.length > 0 && prixIsoles.length >= articles.length) {
    return articles.map((art, index) => ({
      description: art.description,
      amount: prixIsoles[index].toFixed(2),
      quantity: String(art.quantite),
      unit: null,
    }));
  }

  return [];
}
function cleanLeadingZeros(value: string): string {
  const [intPart, decPart] = value.split('.');
  const cleanedInt = intPart.replace(/^0+(?=\d)/, '') || '0';
  return decPart ? `${cleanedInt}.${decPart}` : cleanedInt;
}
const MONTHS_FR: Record<string, string> = {
  jan: '01', fév: '02', mar: '03', avr: '04', mai: '05', juin: '06',
  juil: '07', août: '08', sep: '09', oct: '10', nov: '11', déc: '12',
};
function normalizeDate(rawText: string): string | null {
  const dateNumeric = rawText.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (dateNumeric) {
    let [, day, month, year] = dateNumeric;
    if (year.length === 2) year = `20${year}`;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const dateText = rawText.match(
    /(\d{1,2})\s+(jan|fév|mar|avr|mai|juin|juil|août|sep|oct|nov|déc)\w*\.?\s+(\d{4})/i
  );
  if (dateText) {
    const [, day, monthAbbrev, year] = dateText;
    const month = MONTHS_FR[monthAbbrev.toLowerCase()];
    if (month) return `${year}-${month}-${day.padStart(2, '0')}`;
  }

  return null;
}
function extractTotal(rawText: string): string | null {
  const priorityKeywords = [
    'total', 'montant total', 'net à payer', 'à payer', 'a payer', 'paiement', 'payé'
  ];

  const lines = rawText.split('\n');

  for (const line of lines) {
    if (priorityKeywords.some(k => line.toLowerCase().includes(k))) {
      const match = line.match(/(\d{1,3}(?:[\s]\d{3})*(?:[.,]\d{2})?)/);
      if (match) {
        return match[1].replace(/\s/g, '').replace(',', '.');
      }
    }
  }

  const numbers = extractNumbers(rawText);
  if (numbers.length === 0) return null;

  return Math.max(...numbers).toFixed(2);
}
function extractNumbers(rawText: string): number[] {
  const lines = rawText.split('\n');
  const regex = /(\d{1,3}(?:[\s]\d{3})*(?:[.,]\d{2})?|\d{1,6}[.,]\d{2})/g;
  const results: number[] = [];

  for (const line of lines) {
    let match;
    while ((match = regex.exec(line)) !== null) {
      let value = match[1].replace(/\s/g, '').replace(',', '.');
      const num = parseFloat(value);

      if (isNaN(num)) continue;
      if (num <= 0) continue;
      if (num > 5_000_000) continue;
      if (/^\d{7,}$/.test(value)) continue;

      results.push(num);
    }
  }

  return results;
}
type ItemPattern = {
  regex: RegExp;
  extract: (m: RegExpMatchArray) => ReceiptItem | null;
};
const USER_ITEM_PATTERNS: ItemPattern[] = [
  {
    regex: /^[•\-\*]?\s*(.+?)\s*\(x(\d+(?:[.,]\d+)?)\)\s*[—\-–]\s*([\d\s]+(?:[.,]\d{2})?)/i,
    extract: (m) => ({
      description: m[1].trim(),
      amount: m[3].replace(/\s/g, '').replace(',', '.'),
      quantity: m[2].replace(',', '.'),
      unit: null,
    }),
  },
  // "T-shirt x1 19$"  |  "Riz x2 5000 ar"
  {
    regex: /^[•\-\*]?\s*(.+?)\s+x\s*(\d+(?:[.,]\d+)?)\s+([\d\s]+(?:[.,]\d{2})?)/i,
    extract: (m) => ({
      description: m[1].trim(),
      amount: m[3].replace(/\s/g, '').replace(',', '.'),
      quantity: m[2].replace(',', '.'),
      unit: null,
    }),
  },
  // "2 T-shirt 19$"  |  "1 Riz 5000 ar"  (quantité en début de ligne)
  {
    regex: /^[•\-\*]?\s*(\d+(?:[.,]\d+)?)\s+(.+?)\s+([\d\s]+(?:[.,]\d{2})?)\s*(\$|€|ar\b|mga|ariary)?$/i,
    extract: (m) => ({
      description: m[2].trim(),
      amount: m[3].replace(/\s/g, '').replace(',', '.'),
      quantity: m[1].replace(',', '.'),
      unit: null,
    }),
  },
  // "T-shirt: 19$"  |  "Riz - 5000 ar"  (pas de quantité → défaut 1)
  {
    regex: /^[•\-\*]?\s*(.+?)\s*[:\-—–]\s*([\d\s]+(?:[.,]\d{2})?)\s*(\$|€|ar\b|mga|ariary)?$/i,
    extract: (m) => ({
      description: m[1].trim(),
      amount: m[2].replace(/\s/g, '').replace(',', '.'),
      quantity: '1',
      unit: null,
    }),
  },
  // "T-shirt 19$"  (juste nom + prix collé, dernier recours)
  {
    regex: /^[•\-\*]?\s*(.+?)\s+([\d\s]+(?:[.,]\d{2})?)\s*(\$|€|ar\b|mga|ariary)$/i,
    extract: (m) => ({
      description: m[1].trim(),
      amount: m[2].replace(/\s/g, '').replace(',', '.'),
      quantity: '1',
      unit: null,
    }),
  },
];
const excludeUserLine = /(montant total|sous[\s\-]total|total\s*:|^total\b)/i;
function extractItemsFromUserText(lines: string[]): ReceiptItem[] {
  const items: ReceiptItem[] = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (trimmed.length < 3) continue;
    if (excludeUserLine.test(trimmed)) continue;

    for (const { regex, extract } of USER_ITEM_PATTERNS) {
      const match = trimmed.match(regex);
      if (!match) continue;

      const item = extract(match);
      if (!item || item.description.length < 2) continue;

      const n = parseFloat(item.amount);
      if (isNaN(n) || n <= 0) continue;

      items.push(item);
      break;
    }
  }

  return items;
}
function extractTotalFromUserText(rawText: string): string | null {
  const match = rawText.match(/(?:montant total|total)\D{0,15}(\d{1,3}(?:[\s]\d{3})*(?:[.,]\d{2})?)/i);
  return match ? match[1].replace(/\s/g, '').replace(',', '.') : null;
}
function extractCurrencyFromUserText(rawText: string): string | null {
  if (/\$/.test(rawText)) return 'USD';
  if (/€/.test(rawText)) return 'EUR';
  if (/\b(ar|ariary|mga)\b/i.test(rawText)) return 'MGA';
  return null;
}
export interface ParsedUserText extends ParsedReceipt {
  needsAIFallback: boolean;
}
export function parseUserText(rawTextBrut: string): ParsedUserText {
  const rawText = rawTextBrut; // pas de nettoyerOCR : pas de bruit de scan ici
  const lines = rawText.split('\n');

  const items = extractItemsFromUserText(lines);

  // Aucun item détecté mais le texte contient des chiffres → probablement
  // du langage naturel libre, pas un format semi-structuré → fallback IA
  const needsAIFallback = items.length === 0 && /\d/.test(rawText);

  const total = extractTotalFromUserText(rawText) ??
    (items.length > 0
      ? items.reduce((acc, it) => acc + parseFloat(it.amount) * parseFloat(it.quantity ?? '1'), 0).toFixed(2)
      : null);

  const currency = extractCurrencyFromUserText(rawText);
  const date = normalizeDate(rawText);

  return {
    rawText,
    total,
    currency,
    date,
    merchant: null,
    items,
    isUncertain: !date || needsAIFallback,
    observation: null,
    categorie: deduireCategorie(rawText, null),
    needsAIFallback,
  };
}
function getCategoryEmoji(categorie: string): string {
  return CATEGORY_EMOJIS[categorie] ?? "📦";
}
function formatMontant(montant: number, devise: string = "Ar"): string {
  return `${montant.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${devise}`;
}
function formatItemLine(item: DepenseItem, devise: string = "Ar"): string {
  const quantitePart =
    item.quantity && item.unit
      ? ` (x${item.quantity} ${item.unit})`
      : item.quantity
        ? ` (x${item.quantity})`
        : "";

  return `  • ${item.name}${quantitePart} — ${formatMontant(item.total_price, devise)}`;
}
export function formatDepenseAsText(depenses: Depense[], devise: string = "Ar"): string {
  const groupes = new Map<string, DepenseItem[]>();

  for (const depense of depenses ?? []) {
    const cat = depense.categorie ?? "";
    for (const item of depense.items ?? []) {
      if (!groupes.has(cat)) groupes.set(cat, []);
      groupes.get(cat)!.push(item);
    }
  }

  const blocs: string[] = [];

  for (const [categorie, items] of groupes) {
    const emoji = getCategoryEmoji(categorie);
    const lignes = items.map((item) => formatItemLine(item, devise)).join("\n");
    blocs.push(`${emoji} ${categorie}\n${lignes}`);
  }

  return blocs.join("\n\n");
}

// SCAN — OCR
export async function scanReceiptOfflineText(text: string): Promise<any> {
  const parsed = parseReceipt(text);

  const itemsFormates = parsed.items.map((item, index) => ({
    id: `${Date.now()}_${index}`,
    name: item.description,
    quantity: Number(item.quantity ?? 1),
    unit: item.unit ?? "piece",
    unit_price: Number(item.amount) || 0,
    total_price: Number(item.amount) || 0,
    image: "",
  }));

  const montantCalcule = itemsFormates.length > 0
    ? itemsFormates.reduce((acc, it) => acc + it.total_price, 0)
    : Number(parsed.total ?? 0);

  let depense: Depense[] = [
    {
      id: Date.now().toString(),
      description: parsed.merchant ?? "Ticket",
      montant: montantCalcule,
      date: parsed.date ?? new Date().toISOString(),
      categorie: parsed.categorie ?? "Autre",
      user_id: "",
      items: itemsFormates,
    },
  ];

  const montantTotal = depense.reduce((total, d) => total + d.montant, 0);
  const textDepense = formatDepenseAsText(depense, parsed.currency ?? "AR");

  let textClair = "";

  if (montantTotal > 0) {
    textClair = ` 🛒 Résumé de la Liste de Courses.\n\n${textDepense} \n\n💰 Montant total: ${montantTotal.toFixed(2)} ${parsed.currency ?? "AR"} \n📆 Date: ${formatDateLong(toISODate(new Date()))}`;
  } else {
    textClair = `💡 Oups ! Cette image ne semble pas correspondre à un reçu ou à une facture. Pouvez-vous vérifier votre document ?`;
    depense = [];
  }

  return {
    textClair,
    merchant: parsed.merchant,
    devise: parsed.currency ?? "AR",
    observation: parsed.observation,
    rawText: parsed.rawText,
    depense,
    provision: [],
  };
}

// SCAN — TEXTE UTILISATEUR
export async function scanUserText(text: string): Promise<any> {
  const parsed = parseUserText(text);

  if (parsed.needsAIFallback) {
    return { needsAIFallback: true, rawText: text };
  }

  const articlesEnrichis = enrichirArticles(parsed.items);

  const itemsFormates = articlesEnrichis.map((item, index) => ({
    id: `${Date.now()}_${index}`,
    name: item.produit?.name ?? item.description,
    quantity: Number(item.quantity ?? 1),
    unit: item.unit ?? "piece",
    unit_price: Number(item.amount) || 0,
    total_price: Number(item.amount) || 0,
    image: "",
  }));

  const categorie = categorieDominante(articlesEnrichis) !== 'Autre'
    ? categorieDominante(articlesEnrichis)
    : deduireCategorie(parsed.rawText, parsed.merchant);


  const montantCalcule = itemsFormates.length > 0
    ? itemsFormates.reduce((acc, it) => acc + it.total_price * it.quantity, 0)
    : Number(parsed.total ?? 0);

  const depense: Depense[] = [
    {
      id: Date.now().toString(),
      description: parsed.merchant ?? "Liste de courses",
      montant: montantCalcule,
      date: parsed.date ?? new Date().toISOString(),
      categorie: parsed.categorie ?? "Autre",
      user_id: "",
      items: itemsFormates,
    },
  ];

  const textDepense = formatDepenseAsText(depense, parsed.currency ?? "AR");
  const textClair = ` 🛒 Résumé de la Liste de Courses.\n\n${textDepense} \n\n💰 Montant total: ${montantCalcule.toFixed(2)} ${parsed.currency ?? "AR"} \n📆 Date: ${formatDateLong(depense[0].date || toISODate(new Date()))}`;

  return {
    textClair,
    merchant: parsed.merchant,
    devise: parsed.currency ?? "AR",
    observation: parsed.observation,
    rawText: parsed.rawText,
    depense,
    provision: [],
  };
}

// DISPATCHER UNIQUE
export async function scanText(text: string, source: 'ocr' | 'user' = 'ocr'): Promise<any> {
  return source === 'user' ? scanUserText(text) : scanReceiptOfflineText(text);
}
