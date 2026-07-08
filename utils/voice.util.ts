import { AudioDepense, FichierAudioInfo } from "@/types/global";
import { GROQ_KEYS } from "./scan.ticket.util";
import * as FileSystem from 'expo-file-system';
import { Depense } from "@/types/db";
import { getDepense } from "@/controller/depense.controller";

async function transcribe(uri: string, maxRetries = 1): Promise<string> {
  const extension = uri.split('.').pop() || 'm4a';
  const mimeType = extension === 'caf' ? 'audio/x-caf' : `audio/${extension}`;

  for (const key of GROQ_KEYS) {
    if (!key) continue;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const formData: any = new FormData();
        formData.append("file", {
          uri,
          name: `audio.${extension}`,
          type: mimeType,
        });
        formData.append("model", "whisper-large-v3");
        formData.append("language", "fr");

        const response = await fetch(
          "https://api.groq.com/openai/v1/audio/transcriptions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key}`,
            },
            body: formData,
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);

        const data = await response.json();

        if (data.text) {
          return data.text;
        }

        const errorCode = data.error?.code ?? response.status;

        if (errorCode === 429) {
          console.warn('Quota épuisé sur cette clé Groq (audio), clé suivante...');
          break;
        }

        if (errorCode === 503 && attempt < maxRetries) {
          console.warn('Groq 503 (audio), retry...');
          await new Promise((r) => setTimeout(r, 3000));
          continue;
        }

        console.warn(`Échec transcription (${errorCode}), clé suivante...`);
        break;
      } catch (err: any) {
        clearTimeout(timeoutId);
        console.error('Erreur réseau transcription:', err);
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }
        break;
      }
    }
  }

  throw new Error('Impossible de transcrire l\'audio (toutes les clés épuisées)');
}

const DOSSIER_AUDIOS = `${FileSystem.documentDirectory}audios/`;

async function assurerDossierExiste() {
  const infos = await FileSystem.getInfoAsync(DOSSIER_AUDIOS);
  if (!infos.exists) {
    await FileSystem.makeDirectoryAsync(DOSSIER_AUDIOS, { intermediates: true });
  }
}

async function sauvegarderAudioDefinitivement(uriTemporaire: string): Promise<string> {
  await assurerDossierExiste();

  const nomFichier = `voice_${Date.now()}.m4a`;
  const cheminFinal = `${DOSSIER_AUDIOS}${nomFichier}`;

  await FileSystem.copyAsync({
    from: uriTemporaire,
    to: cheminFinal,
  });

  return cheminFinal;
}

async function supprimerAudio(uri: string | null | undefined): Promise<boolean> {
  if (!uri) return false;

  if (!uri.startsWith(DOSSIER_AUDIOS)) {
    console.warn('supprimerAudio: chemin hors du dossier audios, suppression ignorée:', uri);
    return false;
  }

  try {
    const infos = await FileSystem.getInfoAsync(uri);
    if (!infos.exists) return false;

    await FileSystem.deleteAsync(uri, { idempotent: true });
    return true;
  } catch (error) {
    console.error('Erreur suppression audio:', error);
    return false;
  }
}

async function supprimerAudios(uris: (string | null | undefined)[]): Promise<void> {
  await Promise.all(uris.map((uri) => supprimerAudio(uri)));
}

async function nettoyerAudiosOrphelins(urisReferences: string[]): Promise<number> {
  await assurerDossierExiste();

  const infosDossier = await FileSystem.readDirectoryAsync(DOSSIER_AUDIOS);
  const setReferences = new Set(urisReferences);

  let compteurSupprimes = 0;

  for (const nomFichier of infosDossier) {
    const cheminComplet = `${DOSSIER_AUDIOS}${nomFichier}`;

    if (!setReferences.has(cheminComplet)) {
      try {
        await FileSystem.deleteAsync(cheminComplet, { idempotent: true });
        compteurSupprimes++;
      } catch (error) {
        console.warn(`Impossible de supprimer le fichier orphelin ${nomFichier}:`, error);
      }
    }
  }

  if (compteurSupprimes > 0) {
    console.log(`Nettoyage: ${compteurSupprimes} fichier(s) audio orphelin(s) supprimé(s)`);
  }

  return compteurSupprimes;
}

async function calculerEspaceAudiosMo(): Promise<number> {
  await assurerDossierExiste();

  const fichiers = await FileSystem.readDirectoryAsync(DOSSIER_AUDIOS);
  let totalOctets = 0;

  for (const nomFichier of fichiers) {
    const infos = await FileSystem.getInfoAsync(`${DOSSIER_AUDIOS}${nomFichier}`);
    if (infos.exists && !infos.isDirectory) {
      totalOctets += infos.size ?? 0;
    }
  }

  return totalOctets / (1024 * 1024);
}

async function listerFichiersAudioBruts(): Promise<FichierAudioInfo[]> {
  await assurerDossierExiste();

  const noms = await FileSystem.readDirectoryAsync(DOSSIER_AUDIOS);

  const infos = await Promise.all(
    noms.map(async (nom) => {
      const uri = `${DOSSIER_AUDIOS}${nom}`;
      const detail = await FileSystem.getInfoAsync(uri, { size: true });

      return {
        uri,
        nom,
        tailleOctets: detail.exists ? (detail.size ?? 0) : 0,
        dateModification: detail.exists ? (detail.modificationTime ?? 0) : 0,
      };
    })
  );

  return infos.sort((a, b) => b.dateModification - a.dateModification);
}

async function listerAudiosDepenses(): Promise<AudioDepense[]> {
  const depenses: Depense[] = await getDepense();

  return depenses
    .filter((dep) => Boolean(dep.audio_uri))
    .map((dep) => ({
      uri: dep.audio_uri as string,
      depenseId: dep.id,
      description: dep.description,
      categorie: dep.categorie,
      montant: dep.montant,
      date: dep.date,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

async function verifierAudio(uri: string) {
  try {
    const info = await FileSystem.getInfoAsync(uri);

    if (!info.exists) {
      return {
        exists: false,
        message: "Fichier audio introuvable",
      };
    }

    return {
      exists: true,
      size: info.size,
      uri: info.uri,
      isDirectory: info.isDirectory,
    };

  } catch (error) {
    return {
      exists: false,
      error,
    };
  }
}

export { transcribe, sauvegarderAudioDefinitivement, supprimerAudio, supprimerAudios, nettoyerAudiosOrphelins, calculerEspaceAudiosMo, listerFichiersAudioBruts, listerAudiosDepenses, verifierAudio };