import { MESSAGE_KEY } from "@/constants/storage";
import { getUserId } from "./user.controller";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Message } from "@/types/db";
import { supprimerAudio, verifierAudio } from "@/utils/voice.util";

async function getMessages() {
  const uId = await getUserId();

  const data = JSON.parse(
    (await AsyncStorage.getItem(`${MESSAGE_KEY}_${uId}`)) || "[]"
  ) as Message[];

  const newData = (
    await Promise.all(
      data.map(async (d) => {
        if (d.type !== "audio") { return d; }
        const existe = await verifierAudio(d.message);
        console.log(existe);

        return existe.exists ? d : null;
      })
    )
  ).filter(Boolean) as Message[];

  if (newData.length !== data.length) {
    await AsyncStorage.setItem(`${MESSAGE_KEY}_${uId}`, JSON.stringify(newData));
  }
  return newData;
}

async function sendMessage(params: Message) {
  const uId = await getUserId();

  const data = await getMessages();

  data.push({
    ...params,
    user_id: uId || "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  await AsyncStorage.setItem(
    `${MESSAGE_KEY}_${uId}`,
    JSON.stringify(data)
  );

  return JSON.stringify({
    success: true,
    message: "Message envoyé avec succès.",
    messages: data,
  });
}
async function removeAllMessages() {
  const uId = await getUserId();
  const data = await getMessages();

  await Promise.all(
    data.map(async (d) => {
      if (d.type === "audio") {
        await supprimerAudio(d.message);
      }
    })
  );

  await AsyncStorage.removeItem(`${MESSAGE_KEY}_${uId}`);

  return JSON.stringify({
    success: true,
    message: "Tous les messages supprimés avec succès.",
  });
}

async function removeMessages(ids: string[]) {
  const uId = await getUserId();
  const data = await getMessages();

  const messagesASupprimer = data.filter((d) => ids.includes(d.id));

  await Promise.all(
    messagesASupprimer.map(async (d) => {
      if (d.type === "audio") {
        await supprimerAudio(d.message);
      }
    })
  );

  const newData = data.filter((d) => !ids.includes(d.id));

  await AsyncStorage.setItem(
    `${MESSAGE_KEY}_${uId}`,
    JSON.stringify(newData)
  );

  return JSON.stringify({
    success: true,
    message: "Messages supprimés avec succès.",
    messages: newData,
  });
}

async function removeMessage(id: string) {
  const uId = await getUserId();
  const data = await getMessages();

  const message = data.find((d) => d.id === id);

  if (message?.type === "audio") {
    await supprimerAudio(message.message);
  }

  const newData = data.filter((d) => d.id !== id);

  await AsyncStorage.setItem(
    `${MESSAGE_KEY}_${uId}`,
    JSON.stringify(newData)
  );

  return JSON.stringify({
    success: true,
    message: "Message supprimé avec succès.",
    messages: newData,
  });
}

async function readAllMessages() {
  const uId = await getUserId();
  const data = await getMessages();
  const newData = data.map((d: any) => ({ ...d, read: true })) as Message[];
  await AsyncStorage.setItem(`${MESSAGE_KEY}_${uId}`, JSON.stringify(newData));

  return JSON.stringify({ success: true, message: "Tous les messages marqués comme lu avec succès.", messages: newData });
}

async function readMessage(id: string) {
  const uId = await getUserId();
  const data = await getMessages();
  const newData = data.map((d: any) => (d.id === id ? { ...d, read: true } : d)) as Message[];
  await AsyncStorage.setItem(`${MESSAGE_KEY}_${uId}`, JSON.stringify(newData));

  return JSON.stringify({ success: true, message: "Message marqué comme lu avec succès.", messages: newData });
}

async function readMessages(ids: string[]) {
  const uId = await getUserId();
  const data = await getMessages();
  const newData = data.map((d: any) => (ids.includes(d.id) ? { ...d, read: true } : d)) as Message[];
  await AsyncStorage.setItem(`${MESSAGE_KEY}_${uId}`, JSON.stringify(newData));

  return JSON.stringify({ success: true, message: "Messages marqués comme lu avec succès.", messages: newData });
}

async function updateMessages(messages: Message[]) {
  const uId = await getUserId();
  const data = await getMessages();
  const newData = data.map((d: any) => (messages.find((m) => m.id === d.id) ? messages.find((m) => m.id === d.id) : d)) as Message[];
  await AsyncStorage.setItem(`${MESSAGE_KEY}_${uId}`, JSON.stringify(newData));

  return JSON.stringify({ success: true, message: "Messages mis à jour avec succès.", messages: newData });
}

export { getMessages, sendMessage, removeMessage, removeMessages, readMessage, readMessages, updateMessages, readAllMessages, removeAllMessages };