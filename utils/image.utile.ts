import TextRecognition from '@react-native-ml-kit/text-recognition';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { normalizeCurrency } from './numberFormat';

export const takePhoto = async (setImage: (uri: string) => void) => {
  try {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      console.warn('Permission caméra refusée');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  } catch (error) {
    console.log(error);
  }
};

export const pickFromGallery = async (setImage: (uri: string) => void) => {
  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      console.warn('Permission galerie refusée');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  } catch (error) {
    console.log(error);

  }

};

export interface ReceiptItem {
  description: string;
  amount: string;
  quantity: string | null;
  unit: string | null;
}

export interface ParsedReceipt {
  rawText: string;
  total: string | null;
  currency: string | null;
  date: string | null;
  merchant: string | null;
  observation: string | null;
  items: ReceiptItem[];
  isUncertain: boolean;
  categorie: string | null;
}

export async function textRecognize(uri: string): Promise<string> {
  const result = await TextRecognition.recognize(uri);
  return result.text;
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

function cleanLeadingZeros(value: string): string {
  const [intPart, decPart] = value.split('.');
  const cleanedInt = intPart.replace(/^0+(?=\d)/, '') || '0';
  return decPart ? `${cleanedInt}.${decPart}` : cleanedInt;
}

function extractMerchant(lines: string[]): string | null {
  const noise = /^(ks|photos?|une,?\s*\d*|page\s*\d*)$/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 2) continue;
    if (noise.test(trimmed)) continue;
    if (/^\d+$/.test(trimmed)) continue;
    return trimmed;
  }
  return null;
}

function extractItems(lines: string[]): ReceiptItem[] {
  const numberPattern = /(\d{1,3}(?:[\s]\d{3})+(?:[.,]\d{2})?|\d{1,6}[.,]\d{2})/g;

  const excludeLine =
    /(total|tel|t[ée]l|nif|stat|client|date|page|signature|adresse|fianarantsoa|antananarivo|^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|n[°o]|num[ée]ro|recu|ticket)/i;

  const items: ReceiptItem[] = [];

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

    items.push({ description, amount, quantity: null, unit: null });
  }

  return items;
}

export function parseReceipt(rawText: string): ParsedReceipt {
  let total: string | null = null;
  let currency: string | null = null;
  let isUncertain = false;

  const currencyPattern = '(ariary|mga|eur|ar|€|a)';
  const numberPattern = '(\\d{1,3}(?:[\\s]\\d{3})+(?:[.,]\\d{2})?|\\d{1,6}[.,]\\d{2}|\\d{1,5})';

  const lines = rawText.split('\n');
  const candidates: { value: string; currency: string }[] = [];

  const excludeBefore = /(facture|postpaid|n[°o]\.?|num(?:éro)?|compte|ref(?:erence)?|id|code)\s*$/i;

  for (const line of lines) {
    const currencyBeforeNumber = new RegExp(`\\b${currencyPattern}\\s{0,3}${numberPattern}\\b`, 'gi');
    const numberBeforeCurrency = new RegExp(`\\b${numberPattern}\\s{0,3}${currencyPattern}\\b`, 'gi');

    let m;
    while ((m = currencyBeforeNumber.exec(line)) !== null) {
      const before = line.slice(0, m.index);
      if (excludeBefore.test(before)) continue;
      candidates.push({ value: m[2], currency: m[1].toUpperCase() });
    }
    while ((m = numberBeforeCurrency.exec(line)) !== null) {
      const before = line.slice(0, m.index);
      if (excludeBefore.test(before)) continue;
      candidates.push({ value: m[1], currency: m[2].toUpperCase() });
    }
  }

  if (candidates.length === 0) {
    const looseCurrencyBeforeNumber = new RegExp(
      `\\b${currencyPattern}\\b(?:\\s+\\S+){0,3}?\\s+${numberPattern}\\b`,
      'gi'
    );

    for (const line of lines) {
      let m;
      while ((m = looseCurrencyBeforeNumber.exec(line)) !== null) {
        const before = line.slice(0, m.index);
        if (excludeBefore.test(before)) continue;
        candidates.push({ value: m[2], currency: m[1].toUpperCase() });
      }
    }
    if (candidates.length > 0) isUncertain = true;
  }

  if (candidates.length > 0) {
    const best = candidates.reduce((a, b) => {
      const aNum = parseFloat(a.value.replace(/\s/g, '').replace(',', '.'));
      const bNum = parseFloat(b.value.replace(/\s/g, '').replace(',', '.'));
      return bNum > aNum ? b : a;
    });
    total = cleanLeadingZeros(best.value.replace(/\s/g, '').replace(',', '.'));
    currency = normalizeCurrency(best.currency) || 'MGA';
    isUncertain = isUncertain || candidates.length > 1;
  }

  if (!total) isUncertain = true;

  const date = normalizeDate(rawText);
  if (!date) isUncertain = true;

  const merchant = extractMerchant(lines);
  const items = extractItems(lines);

  return { rawText, total, currency, date, merchant, items, isUncertain, observation: null, categorie: "Autre" };
}

export async function scanReceipt(uri: string): Promise<ParsedReceipt> {
  const text = await textRecognize(uri);
  return parseReceipt(text);
}

const GEMINI_PROMPT = `Analyse ce ticket de caisse et retourne UNIQUEMENT un JSON valide sans texte avant ou après:
{
  "merchant": "nom du commerce ou émetteur",
  "observation": "remarque utile sur le ticket (ex: PAYÉ, IMPAYÉ, mode de paiement, numéro de reçu...)",
  "total": "montant total en STRING décimal (ex: \\"66500.00\\")",
  "currency": "devise: utilise AR pour Ariary/MGA, EUR pour euro, USD pour dollar",
  "date": "date au format yyyy-mm-dd",
  "items": [
    {
      "description": "nom article ou service",
      "amount": "prix en STRING décimal",
      "quantity": "quantité en STRING ou 1 si non précisée",
      "unit": "unité (ex: x, kg, L, pcs...) ou piece si non précisée"
    }
  ],
  "rawText": "tout le texte visible sur le ticket",
  "categorie": "verifie que c'est bien un ticket de caisse, et examiner pour déterminer si   "Alimentation" ou "Transport" ou "Santé" ou "Loisirs" ou "Logement" ou "Autre" est le plus approprié pour la catégorie de dépense. Si aucune catégorie ne correspond, retourne "Autre".",
}
IMPORTANT: total et amount doivent être des STRINGS, pas des nombres.
Si une info est absente mets null. Pour items retourne [] si aucun article distinct n'est visible.`;

const GEMINI_KEYS = [
  process.env.EXPO_PUBLIC_GEMINI_API_KEY_1,
  process.env.EXPO_PUBLIC_GEMINI_API_KEY_2,
  process.env.EXPO_PUBLIC_GEMINI_API_KEY_3,
].filter(Boolean) as string[];

const GEMINI_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
];

async function callGeminiWithRetry(base64: string, maxRetries = 2): Promise<any> {
  const body = {
    contents: [
      {
        parts: [
          { inline_data: { mime_type: 'image/jpeg', data: base64 } },
          { text: GEMINI_PROMPT },
        ],
      },
    ],
  };

  for (const key of GEMINI_KEYS) {
    for (const model of GEMINI_MODELS) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (data.error?.code === 503 && attempt < maxRetries) {
          const delay = (attempt + 1) * 5000;
          console.warn(`Gemini 503 [${model}], retry ${attempt + 1}/${maxRetries}...`);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        if (data.error?.code === 503) {
          console.warn(`Gemini 503 [${model}] persistant, essai modèle suivant...`);
          break;
        }

        if (data.error?.code === 429) {
          console.warn(`Clé quota épuisé [${model}], essai clé suivante...`);
          break;
        }

        if (data.error?.code === 400) {
          console.warn(`Clé invalide [${model}], essai clé suivante...`);
          break;
        }

        return data;
      }
    }
  }

  return { error: { code: 503, message: 'Toutes les clés/modèles Gemini indisponibles' } };
}

export async function scanReceiptWithAI(uri: string): Promise<ParsedReceipt> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const data = await callGeminiWithRetry(base64);

  if (data.error) {
    console.warn(`Gemini error ${data.error.code}: ${data.error.message}`);
    if (data.error.code === 429 || data.error.code === 503) {
      console.warn('Fallback MLKit offline...');
      const text = await textRecognize(uri);
      return { ...parseReceipt(text), isUncertain: true };
    }
    throw new Error(`Gemini API error ${data.error.code}: ${data.error.message}`);
  }

  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Réponse Gemini invalide');
  }

  const text = data.candidates[0].content.parts[0].text;

  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());

    const normalizeAmount = (val: unknown): string | null => {
      if (val === null || val === undefined) return null;
      return String(val);
    };

    return {
      rawText: parsed.rawText ?? '',
      total: normalizeAmount(parsed.total),
      currency: normalizeCurrency(parsed.currency),
      date: parsed.date ?? null,
      merchant: parsed.merchant ?? null,
      observation: parsed.observation ?? null,
      categorie: parsed.categorie ?? 'Autre',
      items: (parsed.items ?? []).map((item: {
        description: string;
        amount: unknown;
        quantity: unknown;
        unit: unknown;
      }) => ({
        description: item.description ?? '',
        amount: normalizeAmount(item.amount) ?? '',
        quantity: item.quantity ? String(item.quantity) : "1",
        unit: item.unit ? item.unit !== "x" ? String(item.unit) : "piece" : "piece",
      })),
      isUncertain: false,
    };
  } catch (e) {
    console.error('Erreur parsing JSON Gemini:', e, text);
    console.warn('JSON malformé, fallback MLKit...');
    const fallbackText = await textRecognize(uri);
    return { ...parseReceipt(fallbackText), isUncertain: true };
  }
}