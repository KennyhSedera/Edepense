import { sauvegarderAudioDefinitivement, transcribe } from "@/utils/voice.util";
import { Audio } from "expo-av";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, ToastAndroid } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useLockSuspend } from "@/contexts/LockSuspendContext";

// 👇 Référence GLOBALE (module-level), partagée entre toutes les instances du hook,
// pour refléter l'état réel de l'unique Recording natif autorisé par expo-av.
let globalRecording: Audio.Recording | null = null;

async function nettoyerEnregistrementResiduel() {
  if (globalRecording) {
    try {
      await globalRecording.stopAndUnloadAsync();
    } catch (e) {
      // déjà déchargé ou invalide, on ignore
    }
    globalRecording = null;
  }
}

export default function useVoiceRecord(barLength?: number) {
  const { suspendLock, resumeLock } = useLockSuspend();

  const recordingRef = useRef<Audio.Recording | null>(null);
  const startingRef = useRef(false);
  const stoppingRef = useRef(false);

  const [audio, setAudio] = useState<string | null>(null);
  const [transcription, setTranscription] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duree, setDuree] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => {
        setDuree((v) => v + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording, isPaused]);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const barAnims = useRef(
    Array.from({ length: barLength ?? 24 }, () => new Animated.Value(0.2))
  ).current;

  useEffect(() => {
    if (isRecording && !isPaused) {
      const loops = barAnims.map((anim, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: Math.random() * 0.8 + 0.2,
              duration: 250 + (i % 5) * 60,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: Math.random() * 0.5 + 0.15,
              duration: 250 + (i % 5) * 60,
              useNativeDriver: false,
            }),
          ])
        )
      );
      loops.forEach((loop) => loop.start());
      return () => {
        loops.forEach((loop) => loop.stop());
      };
    }
    if (!isRecording) {
      barAnims.forEach((anim) => {
        anim.setValue(0.2);
      });
    }
  }, [isRecording, isPaused]);

  function formatDuree(secondes: number) {
    const m = Math.floor(secondes / 60);
    const s = secondes % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  const startRecording = useCallback(async () => {
    if (startingRef.current) return;
    if (recordingRef.current) return;
    startingRef.current = true;
    suspendLock();

    try {
      // 👇 Nettoyage préventif : si un enregistrement précédent traîne encore
      // (crash, remount, navigation rapide), on le libère avant d'en créer un nouveau.
      await nettoyerEnregistrementResiduel();

      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        alert("Permission microphone refusée");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      globalRecording = recording; // 👈 synchronise la référence globale
      setIsRecording(true);
      setIsPaused(false);
      setDuree(0);
      setTranscription("");
    } catch (e) {
      console.log("START RECORD ERROR", e);
      recordingRef.current = null;
      globalRecording = null;
    } finally {
      startingRef.current = false;
      resumeLock();
    }
  }, [suspendLock, resumeLock]);

  const pauseRecording = useCallback(async () => {
    try {
      await recordingRef.current?.pauseAsync();
      setIsPaused(true);
    } catch (e) {
      console.log("pause error", e);
    }
  }, []);

  const resumeRecording = useCallback(async () => {
    try {
      await recordingRef.current?.startAsync();
      setIsPaused(false);
    } catch (e) {
      console.log("resume error", e);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (stoppingRef.current) return null;
    stoppingRef.current = true;
    suspendLock();

    try {
      const current = recordingRef.current;
      if (!current) return null;
      await current.stopAndUnloadAsync();
      const uriTemp = current.getURI();
      recordingRef.current = null;
      globalRecording = null; // 👈 synchronise
      setIsRecording(false);
      setIsPaused(false);
      if (uriTemp) {
        const permanent = await sauvegarderAudioDefinitivement(uriTemp);
        setAudio(permanent);
        return permanent;
      }
      return null;
    } catch (e) {
      console.log("STOP RECORD ERROR", e);
      recordingRef.current = null;
      globalRecording = null; // 👈 nettoie même en cas d'erreur
      return null;
    } finally {
      stoppingRef.current = false;
      resumeLock();
    }
  }, [suspendLock, resumeLock]);

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => { });
        recordingRef.current = null;
        globalRecording = null; // 👈 nettoie aussi au démontage
      }
    };
  }, []);

  async function transcribeText(audio: string | null | undefined) {
    if (!audio) return;
    setLoading(true);
    try {
      const texte = await transcribe(audio);
      setTranscription(texte);
      return texte;
    } catch (e) {
      console.log(e);
      alert("Impossible de transcrire");
    } finally {
      setLoading(false);
    }
  }

  async function copierTexte() {
    if (!transcription) return;
    await Clipboard.setStringAsync(transcription);
    setIsCopied(true);
    ToastAndroid.show("Texte copié", ToastAndroid.SHORT);
    setTimeout(() => setIsCopied(false), 2000);
  }

  return {
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    transcribeText,
    copierTexte,
    formatDuree,
    setAudio,
    setTranscription,
    isRecording,
    isPaused,
    duree,
    barAnims,
    pulseAnim,
    audio,
    transcription,
    loading,
    isCopied,
  };
}