import React, { } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Animated, Pressable } from "react-native";
import { Mic, Square, Pause, Play, Sparkles, Copy, Check, Trash2 } from "lucide-react-native";
import { MainHeader } from "@/components/header/header-main";
import { HeaderWithSearch } from "../(guest)/_layout";
import { useAppColors } from "@/hooks/useAppColors";
import { styles } from "@/styles/styles";
import useVoiceRecord from "@/hooks/useVoiceRecord";
import { LecteurAudio } from "@/components/audio/LecteurAudio";
import { supprimerAudio } from "@/utils/voice.util";
import BarAnimed from "@/components/audio/BarAnimed";


export default function VoiceRecorder() {
  const { isCopied, isRecording, isPaused, duree, pulseAnim, barAnims, loading, transcription, audio, formatDuree, resumeRecording, pauseRecording, stopRecording, startRecording, transcribeText, copierTexte, setAudio, setTranscription } = useVoiceRecord();
  const { dangerColor, labelColor, sectionColor, border, cardBg, inputBg } = useAppColors();

  return (
    <MainHeader
      height={100}
      header={() => <HeaderWithSearch searchable={false} title="Note vocale" />}
    >
      <View style={{ alignItems: "center", paddingVertical: 32, paddingHorizontal: 8 }}>

        {/* Timer */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "700",
              color: isRecording && !isPaused ? dangerColor : labelColor,
              fontVariant: ["tabular-nums"],
            }}
          >
            {formatDuree(duree)}
          </Text>
          {isPaused && (
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 999,
                backgroundColor: `${labelColor}20`,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "600", color: labelColor }}>
                PAUSE
              </Text>
            </View>
          )}
        </View>

        <BarAnimed barAnims={barAnims} isRecording={isRecording} isPaused={isPaused} sectionColor={sectionColor} border={border} />

        <View style={{ flexDirection: "row", alignItems: "center", gap: 20, marginTop: 32 }}>
          {isRecording && (
            <TouchableOpacity
              onPress={isPaused ? resumeRecording : pauseRecording}
              activeOpacity={0.85}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: cardBg,
                borderWidth: 1,
                borderColor: border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isPaused ? (
                <Play color={sectionColor} size={22} fill={sectionColor} />
              ) : (
                <Pause color={sectionColor} size={22} fill={sectionColor} />
              )}
            </TouchableOpacity>
          )}

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              onPress={isRecording ? stopRecording : startRecording}
              activeOpacity={0.85}
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: isRecording ? dangerColor : sectionColor,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: isRecording ? dangerColor : sectionColor,
                shadowOpacity: 0.3,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 6,
              }}
            >
              {isRecording ? (
                <Square color="white" size={30} fill="white" />
              ) : (
                <Mic color="white" size={34} />
              )}
            </TouchableOpacity>
          </Animated.View>

          {isRecording && <View style={{ width: 56 }} />}
        </View>

        <Text style={{ marginTop: 16, fontSize: 14, color: labelColor, fontWeight: "500" }}>
          {isPaused
            ? "En pause — appuyez sur ▶ pour reprendre"
            : isRecording
              ? "Enregistrement en cours..."
              : audio
                ? "Prêt à transcrire"
                : "Appuyez pour enregistrer"}
        </Text>

        {audio && !isRecording && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 24, position: "relative" }}>
            <LecteurAudio uri={audio} />
            <Pressable onPress={() => { supprimerAudio(audio); setAudio(""); setTranscription("") }} style={{ position: "absolute", right: -8, bottom: -10, backgroundColor: `${dangerColor}`, padding: 8, borderRadius: 999 }}>
              <Trash2 color={"#fff"} size={16} />
            </Pressable>
          </View>
        )}

        {audio && !isRecording && (
          <TouchableOpacity
            onPress={() => transcribeText(audio as string)}
            disabled={loading}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginTop: 24,
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 999,
              backgroundColor: cardBg,
              borderWidth: 1,
              borderColor: border,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color={sectionColor} />
            ) : (
              <Sparkles color={sectionColor} size={18} />
            )}
            <Text style={{ color: sectionColor, fontWeight: "600" }}>
              {loading ? "Transcription en cours..." : "Transcrire l'audio"}
            </Text>
          </TouchableOpacity>
        )}

        {transcription ? (
          <View
            style={[
              styles.card,
              {
                backgroundColor: inputBg,
                borderColor: border,
                width: "100%",
                marginTop: 28,
                padding: 16,
              },
            ]}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: labelColor }}>
                Transcription
              </Text>
              <TouchableOpacity onPress={copierTexte} hitSlop={10}>
                {isCopied ? <Check color={labelColor} size={16} /> : <Copy color={labelColor} size={16} />}
              </TouchableOpacity>
            </View>
            <Text style={{ color: labelColor, lineHeight: 22 }}>{transcription}</Text>
          </View>
        ) : null}
      </View>
    </MainHeader>
  );
}