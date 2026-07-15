import { Button, Pressable, Text, View, FlatList, ToastAndroid } from 'react-native'
import React, { useState } from 'react'
import { MainHeader } from '@/components/header/header-main';
import { HeaderWithSearch } from './_layout';
import DeleteModal from '@/components/modal/DeleteModal';
import MenuModal from '@/components/modal/menu-modal';
import EmptyData from '@/components/ui/empty-data';
import { useRouter } from 'expo-router';
import { useAppColors } from '@/hooks/useAppColors';
import { AppNotification, NotificationType } from '@/types/db';
import { BellOff, CheckIcon, Trash2Icon } from 'lucide-react-native';
import { styles } from '@/styles/styles';
import { useNotifications } from '@/contexts/NotificationContext';

export default function NotificationScreen() {
  const TYPE_CONFIG: Record<NotificationType, { emoji: string; color: string }> = {
    budget_alert: { emoji: "⚠️", color: "#ff9500" },
    budget_reminder: { emoji: "💡", color: "#ffcc00" },
    depense_alert: { emoji: "💸", color: "#ff3b30" },
    depense_new: { emoji: "💸", color: "#34c759" },
    depense_reminder: { emoji: "🧾", color: "#ff6347" },
    provision_alert: { emoji: "🔔", color: "#ff7a00" },
    provision_new: { emoji: "📦", color: "#34c759" },
    provision_reminder: { emoji: "📌", color: "#ff9f43" },
    goal_achieved: { emoji: "🎉", color: "#34c759" },
    goal_reminder: { emoji: "🎯", color: "#0082fc" },
    todo_reminder: { emoji: "✅", color: "#5856d6" },
    system: { emoji: "⚙️", color: "#8e8e93" },
    info: { emoji: "ℹ️", color: "#0082fc" },
  };

  const { notifications, markAsRead, markAllAsRead, remove } = useNotifications();
  const { sectionColor, labelColor, textColor, backgroundColor } = useAppColors();
  const router = useRouter();
  const [selected, setSelected] = useState<AppNotification | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const getDateLabel = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

    const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays <= 7) return "Cette semaine";
    return "Plus ancien";
  };

  const groupOrder = ["Aujourd'hui", "Hier", "Cette semaine", "Plus ancien"];

  const groupedSections = React.useMemo(() => {
    const presorted = [...notifications].sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return a.created_at < b.created_at ? 1 : -1;
    });

    const groups: Record<string, AppNotification[]> = {};
    presorted.forEach(item => {
      const label = getDateLabel(item.created_at);
      if (!groups[label]) groups[label] = [];
      groups[label].push(item);
    });

    return groupOrder
      .filter(label => groups[label]?.length)
      .map(label => ({ label, data: groups[label] }));
  }, [notifications]);

  const navigateFromNotif = (notif: AppNotification) => {
    if (!notif.data?.pathName) return;
    router.push({
      pathname: notif.data.pathName as any,
      params: notif.data.id ? { id: notif.data.id } : undefined,
    });
  };

  const handlePress = async (notif: AppNotification) => {
    if (!notif.read) await markAsRead(notif.id);
    navigateFromNotif(notif);
  };

  const handleLongPress = (notif: AppNotification) => {
    setSelected(notif);
    setShowMenu(true);
  };

  const confirmDelete = async (res?: string) => {
    if (res === "delete") {
      if (selected) {
        await remove(selected.id);
        setSelected(null);
        setShowDeleteModal(false);
        setShowMenu(false);
        ToastAndroid.show("Notification supprimée", ToastAndroid.SHORT);
      }
    }
  };

  return (
    <MainHeader
      height={100}
      header={() => <HeaderWithSearch searchable={false} title="Notification" />}
    >
      {notifications.length > 0 && (
        <Pressable onPress={markAllAsRead} style={{ alignSelf: "flex-end", padding: 12 }}>
          <Text style={{ color: sectionColor, fontWeight: "600" }}>Tout marquer comme lu</Text>
        </Pressable>
      )}

      {groupedSections.length === 0 && (
        <EmptyData message="Aucune notification pour le moment" icon={<BellOff size={50} color={labelColor} />} />
      )}

      {groupedSections.map(section => (
        <View key={section.label} style={{ marginBottom: 12 }}>
          <Text style={{ color: labelColor, fontWeight: "600", fontSize: 13, marginBottom: 8, marginLeft: 4 }}>
            {section.label}
          </Text>

          {section.data.map(item => {
            const config = TYPE_CONFIG[item.type];
            return (
              <Pressable
                key={item.id}
                onPress={() => handlePress(item)}
                onLongPress={() => handleLongPress(item)}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: 12,
                  borderRadius: 12,
                  marginBottom: 8,
                  backgroundColor: item.read ? backgroundColor : `${config.color}40`,
                  borderWidth: 1,
                  borderColor: item.read ? `${sectionColor}20` : `${config.color}f0`,
                }}
              >
                <Text style={{ fontSize: 20 }}>{config.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontWeight: item.read ? "500" : "700", color: textColor, flex: 1 }}>
                      {item.title}
                    </Text>
                    {!item.read && (
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: config.color, marginLeft: 6, marginTop: 4 }} />
                    )}
                  </View>
                  <Text style={{ color: `${textColor}99`, marginTop: 2 }}>{item.message}</Text>
                  <Text style={{ color: `${textColor}66`, fontSize: 11, marginTop: 4 }}>
                    {new Date(item.created_at).toLocaleString("fr-FR")}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}

      <MenuModal
        visible={showMenu}
        onChange={() => setShowMenu(false)}
      >
        <View style={[{ gap: 10, paddingTop: 10 }]}>
          <Pressable onPress={() => handlePress(selected as AppNotification)} style={[styles.itemModal, { flexDirection: "row", alignItems: "center", gap: 6 }]}>
            <CheckIcon size={20} color={textColor} />
            <Text style={{ color: textColor }}>Marquer comme lu</Text>
          </Pressable>
          <Pressable onPress={() => setShowDeleteModal(true)} style={[styles.itemModal, { flexDirection: "row", alignItems: "center", gap: 6 }]}>
            <Trash2Icon size={20} color="red" />
            <Text style={{ color: "red" }}>Supprimer cette notification</Text>
          </Pressable>
        </View>
      </MenuModal>

      <DeleteModal
        visible={showDeleteModal}
        onChange={confirmDelete}
        message="Supprimer cette notification ?"
      />
    </MainHeader>
  )
}