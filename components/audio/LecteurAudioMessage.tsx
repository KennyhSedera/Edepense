import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Play, Pause } from "lucide-react-native";
import BarAudio, { } from "./BarAudio";
import { BARHEIGHTSMESSAGE } from "@/constants/type";
import useAudioPlayer from "@/hooks/useAudioPlayer";


export function LecteurAudioMessage({ uri }: { uri: string }) {
  const { isPlaying, position, progression, togglePlay, formatDureeLecture } = useAudioPlayer(uri, uri);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 6,
        borderRadius: 14,
        width: "100%",
      }}
    >
      <TouchableOpacity
        onPress={togglePlay}
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isPlaying ? (
          <Pause color="white" size={18} fill="white" />
        ) : (
          <Play color="white" size={18} fill="white" />
        )}
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        <BarAudio barHeights={BARHEIGHTSMESSAGE} progression={progression} backgroundColor={"#fff"} />
      </View>
      <Text style={{ color: "white", fontSize: 11, marginTop: 4 }}>
        {formatDureeLecture(position)}
      </Text>
    </View>
  );
}
