import { Pressable, Text, View, FlatList, ActivityIndicator } from 'react-native'
import React, { useCallback, useState } from 'react'
import { HeaderWithSearch } from './_layout'
import { useAppColors } from '@/hooks/useAppColors';
import { MainHeader } from '@/components/header/header-main'
import { router, useFocusEffect } from 'expo-router';
import { styles } from '@/styles/styles';
import { Plus, Check, Trash2 } from 'lucide-react-native';
import { getTodos, toggleTodo, deleteTodo } from '@/controller/todo.controller';
import { calculerPriorite } from '@/utils/todo.util';
import { Todo } from '@/types/db';

const PRIORITE_COLORS: Record<string, string> = {
  haute: "#e53935",
  normale: "#fb8c00",
  basse: "#43a047",
};

export default function TodoScreen() {
  const { sectionColor, border, cardBg, textColor, dangerColor } = useAppColors();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTodos();
      setTodos(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  async function handleToggle(id: string) {
    await toggleTodo(id);
    loadData();
  }

  async function handleDelete(id: string) {
    await deleteTodo(id);
    loadData();
  }

  function renderItem({ item }: { item: Todo }) {
    const priorite = calculerPriorite(item.date_echeance);
    const couleurPriorite = priorite ? PRIORITE_COLORS[priorite] : border;

    return (
      <View
        style={[
          styles.miniCard,
          {
            backgroundColor: cardBg,
            borderColor: border,
            borderLeftColor: couleurPriorite,
            borderLeftWidth: 4,
            marginBottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          },
        ]}
      >
        <Pressable
          onPress={() => handleToggle(item.id)}
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            borderWidth: 1.5,
            borderColor: item.completed ? sectionColor : border,
            backgroundColor: item.completed ? sectionColor : "transparent",
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {item.completed ? <Check size={16} color="#fff" /> : null}
        </Pressable>

        <Pressable
          style={{ flex: 1 }}
          onPress={() => router.push({ pathname: '/todo-form', params: { id: item.id } })}
        >
          <Text
            style={[
              styles.name,
              {
                color: textColor,
                textDecorationLine: item.completed ? 'line-through' : 'none',
                opacity: item.completed ? 0.5 : 1,
              },
            ]}
          >
            {item.titre}
          </Text>
          {item.date_echeance ? (
            <Text style={[styles.date, { color: couleurPriorite, opacity: item.completed ? 0.5 : 1 }]}>
              Échéance : {item.date_echeance}
            </Text>
          ) : null}
        </Pressable>

        <Pressable onPress={() => handleDelete(item.id)}>
          <Trash2 size={18} color={dangerColor} />
        </Pressable>
      </View>
    );
  }

  return (
    <MainHeader
      height={100}
      header={() => <HeaderWithSearch searchable={false} title="Mes tâches" />}
      fab={
        <Pressable
          onPress={() => router.push("/todo-form")}
          style={({ pressed }) => [
            styles.fab,
            pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
            { backgroundColor: sectionColor, borderColor: border },
          ]}
        >
          <Plus color={"#fff"} size={24} />
        </Pressable>
      }
    >
      {loading && todos.length === 0 ? (
        <View style={{ paddingTop: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={sectionColor} />
        </View>
      ) : todos.length === 0 ? (
        <View style={{ paddingTop: 40, alignItems: 'center' }}>
          <Text style={{ color: textColor, opacity: 0.6 }}>Aucune tâche pour le moment.</Text>
        </View>
      ) : (
        <FlatList data={todos} keyExtractor={(item) => item.id} renderItem={renderItem} scrollEnabled={false} />
      )}
    </MainHeader>
  );
}