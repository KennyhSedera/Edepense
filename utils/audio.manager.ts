import { Audio } from "expo-av";

let currentSound: Audio.Sound | null = null;
let currentId: string | null = null;

const listeners = new Set<(id: string | null) => void>();

export function subscribeAudio(callback: (id: string | null) => void) {
  listeners.add(callback);
  return () => { listeners.delete(callback); };
}

function notify(id: string | null) {
  listeners.forEach((callback) => callback(id));
}


export async function playGlobalAudio(id: string, uri: string, onStatusUpdate: any) {

  if (currentSound && currentId !== id) {
    await currentSound.stopAsync();
    await currentSound.unloadAsync();
    currentSound = null;
    notify(null);
  }

  if (currentSound && currentId === id) {
    const status = await currentSound.getStatusAsync();
    if (status.isLoaded && status.isPlaying) {
      await currentSound.pauseAsync();
      notify(null);
      return false;
    }
    await currentSound.playAsync();
    notify(id);
    return true;
  }
  const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true, }, onStatusUpdate);
  currentSound = sound;
  currentId = id;
  notify(id);
  return true;
}

export async function stopGlobalAudio() {
  if (!currentSound) return;
  await currentSound.stopAsync();
  await currentSound.unloadAsync();
  currentSound = null;
  currentId = null;
  notify(null);
}