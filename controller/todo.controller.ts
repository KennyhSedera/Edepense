import { STORAGE_TODO_KEY } from "@/constants/storage";
import { Todo } from "@/types/db";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserId } from "./user.controller";

export async function getAllTodos(): Promise<Todo[]> {
  const data = await AsyncStorage.getItem(STORAGE_TODO_KEY);
  return JSON.parse(data || "[]") as Todo[];
}

export async function getTodos(): Promise<Todo[]> {
  const todos = await getAllTodos();
  const uId = await getUserId();
  return todos.filter((t) => t.user_id === uId);
}

export async function getTodoById(id: string): Promise<Todo | null> {
  const todos = await getAllTodos();
  return todos.find((t) => t.id === id) ?? null;
}

export async function addTodo(todo: Todo) {
  const data = await getAllTodos();
  const newData = [...data, todo];
  await AsyncStorage.setItem(STORAGE_TODO_KEY, JSON.stringify(newData));

  return JSON.stringify({ success: true, message: "Tâche ajoutée avec succès.", todo });
}

export async function updateTodo(todo: Todo) {
  const data = await getAllTodos();
  const newData = data.map((t) => (t.id === todo.id ? todo : t));
  await AsyncStorage.setItem(STORAGE_TODO_KEY, JSON.stringify(newData));

  return JSON.stringify({ success: true, message: "Tâche mise à jour avec succès.", todo });
}

export async function toggleTodo(id: string) {
  const data = await getAllTodos();
  const newData = data.map((t) =>
    t.id === id ? { ...t, completed: !t.completed, updated_at: new Date().toISOString() } : t
  );
  await AsyncStorage.setItem(STORAGE_TODO_KEY, JSON.stringify(newData));

  return JSON.stringify({ success: true, message: "Tâche mise à jour avec succès." });
}

export async function deleteTodo(id: string) {
  const data = await getAllTodos();
  const uId = await getUserId();
  const newData = data.filter((t) => !(t.id === id && t.user_id === uId));
  await AsyncStorage.setItem(STORAGE_TODO_KEY, JSON.stringify(newData));

  return JSON.stringify({ success: true, message: "Tâche supprimée avec succès." });
}