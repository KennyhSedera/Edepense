import React from "react";
import { View, Text, Pressable } from "react-native";
import { Camera, MessageCirclePlus } from "lucide-react-native";
import { router } from "expo-router";
import { useAppColors } from "@/hooks/useAppColors";
import QuickAdd from "@/components/modal/QuickAdd";

interface QuickActionsProps {
  quickAddOpen: boolean;
  setQuickAddOpen: (v: boolean) => void;
}

function ActionTile({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  const { cardBg, border, textColor } = useAppColors();

  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: "center",
        gap: 6,
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: cardBg,
        borderWidth: 1,
        borderColor: border,
      }}
    >
      {icon}
      <Text style={{ fontSize: 12, fontWeight: "600", color: textColor, textAlign: "center" }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function QuickActions({ quickAddOpen, setQuickAddOpen }: QuickActionsProps) {
  const { sectionColor, textColor } = useAppColors();

  return (
    <View style={{ gap: 10 }}>
      <Text style={{ fontSize: 15, fontWeight: "700", color: textColor, marginLeft: 2 }}>
        Actions rapides
      </Text>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <ActionTile
          icon={<Camera color={sectionColor} size={22} />}
          label={"Scanner un ticket"}
          onPress={() => router.push("/scan-ticket")}
        />
        <ActionTile
          icon={<MessageCirclePlus color={sectionColor} size={22} />}
          label={"Ajout rapide"}
          onPress={() => router.push("/type-whatsapp")}
        />
        {/* <ActionTile
          icon={<Mic color={sectionColor} size={22} />}
          label={"Note\nvocale"}
          onPress={() => router.push("/voice-recorder")}
        /> */}
      </View>

      <QuickAdd visible={quickAddOpen} onChange={() => setQuickAddOpen(false)} />
    </View>
  );
}