import { useEffect, useRef, useState } from "react";
import { AVPlaybackStatus } from "expo-av";
import { playGlobalAudio, stopGlobalAudio, subscribeAudio } from "@/utils/audio.manager";
import { useLockSuspend } from "@/contexts/LockSuspendContext";

export default function useAudioPlayer(id: string, uri: string) {
  const { suspendLock, resumeLock } = useLockSuspend();

  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [dureeAudio, setDureeAudio] = useState(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const unsubscribe = subscribeAudio((activeId) => {
      if (!mounted.current) return;
      if (activeId !== id) {
        setIsPlaying(false);
        setPosition(0);
      }
    });
    return () => {
      mounted.current = false;
      unsubscribe();
    };
  }, [id]);

  function onStatusUpdate(status: AVPlaybackStatus) {
    if (!mounted.current) return;
    if (!status.isLoaded) return;
    setPosition(status.positionMillis);
    setDureeAudio(status.durationMillis ?? 0);
    if (status.didJustFinish) {
      setIsPlaying(false);
      setPosition(0);
    }
  }

  async function togglePlay() {
    suspendLock();
    try {
      const playing = await playGlobalAudio(id, uri, onStatusUpdate);
      setIsPlaying(playing);
    } finally {
      resumeLock();
    }
  }

  async function stop() {
    suspendLock();
    try {
      await stopGlobalAudio();
      setIsPlaying(false);
      setPosition(0);
    } finally {
      resumeLock();
    }
  }

  const progression = dureeAudio > 0 ? (position / dureeAudio) * 100 : 0;

  function formatDureeLecture(ms: number) {
    const secondes = Math.floor(ms / 1000);
    const minutes = Math.floor(secondes / 60);
    const reste = secondes % 60;
    return `${minutes.toString().padStart(2, "0")}:${reste.toString().padStart(2, "0")}`;
  }

  return {
    position,
    isPlaying,
    dureeAudio,
    progression,
    stop,
    togglePlay,
    formatDureeLecture,
  };
}