import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Play, Pause } from "lucide-react-native";
import { useAppColors } from "@/hooks/useAppColors";
import BarAudio, { } from "./BarAudio";
import { BARHEIGHTS } from "@/constants/type";
import useAudioPlayer from "@/hooks/useAudioPlayer";
import BarAudioAnimed from "./BarAudioAnimed";

export function LecteurAudio({ uri }: { uri: string }) {
  const { backgroundColor, border, sectionColor, labelColor } = useAppColors();
  const { togglePlay, position, isPlaying, progression, formatDureeLecture } = useAudioPlayer(uri, uri);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 12,
        borderRadius: 14,
        backgroundColor,
        borderWidth: 1,
        borderColor: border,
        width: "100%",
      }}
    >
      <TouchableOpacity
        onPress={togglePlay}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: sectionColor,
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
        {/* <BarAudio barHeights={BARHEIGHTS} progression={progression} /> */}
        <BarAudioAnimed isPlaying={isPlaying} isPaused={!isPlaying} progression={progression} />
      </View>
      <Text style={{ color: labelColor, fontSize: 11 }}>
        {formatDureeLecture(position)}
      </Text>
    </View>
  );
}