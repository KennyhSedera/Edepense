import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { ArrowRight } from "lucide-react-native";
import { useAppColors } from "@/hooks/useAppColors";
import { useRouter } from "expo-router";
import AnimatedHeader from "@/components/header/animate-header";
import HeaderDripAnimated from "@/components/header/header-drip-animated";
import { useAuth } from "@/contexts/AuthContext";
import Field from "@/components/input/InputText";

export default function LoginScreen() {
  const { textColor, cardBg, sectionColor } = useAppColors();
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!email.trim()) {
      errors.email = "L'email est requis.";
    }
    if (!password.trim()) {
      errors.password = "Le mot de passe est requis.";
    }
    return errors;
  }

  const handleLogin = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    const result = await login(email, password);
    if (!result.success) {
      setErrors(result.error as Record<string, string>);
      return;
    }
    return;
  };

  return (
    <AnimatedHeader
      maxHeight={250}
      minHeight={85}
      header={(scrollY) => (
        <HeaderDripAnimated
          scrollY={scrollY}
          maxHeight={220}
          minHeight={90}
          title="Connexion"
          subtitle="Bienvenue sur E-Dépense, l'application de gestion des finances numériques."
        />
      )}
    >

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={s.body}>
          <Animated.View entering={FadeInUp.delay(100).duration(500)}>
            <Field
              label="Email"
              placeholder="Entrez votre adresse email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="next"
              error={errors.email}
              onFocus={() => setErrors({ ...errors, email: "" })}
              inputStyle={{ backgroundColor: 'transparent', overflow: 'hidden' }}
              style={{ marginBottom: 32 }}
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(180).duration(500)}>
            <Field
              label="Mot de passe"
              placeholder="Entrez votre mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              autoCorrect={false}
              returnKeyType="done"
              error={errors.password}
              onFocus={() => setErrors({ ...errors, password: "" })}
              inputStyle={{ backgroundColor: 'transparent' }}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(240).duration(500)}
            style={s.forgotWrapper}
          >
            <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
              <Text style={[s.forgotText, { color: sectionColor }]}>
                Mot de passe oublié ?
              </Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).duration(500)}>
            <Pressable
              onPress={handleLogin}
              style={({ pressed }) => [
                s.loginButton,
                { backgroundColor: sectionColor },
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
            >
              <Text style={[s.loginButtonText, { color: "#fff" }]}>Se connecter</Text>
              <ArrowRight size={18} color="#fff" strokeWidth={2.5} />
            </Pressable>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(360).duration(500)}
            style={s.dividerRow}
          >
            <View style={[s.divider, { backgroundColor: cardBg }]} />
            <Text style={[s.dividerText, { color: textColor }]}>ou</Text>
            <View style={[s.divider, { backgroundColor: cardBg }]} />
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(420).duration(500)}
            style={s.signupRow}
          >
            <Text style={[s.signupText, { color: textColor }]}>Pas encore de compte ?</Text>
            <Pressable onPress={() => router.push("/(auth)/register")}>
              <Text style={[s.signupLink, { color: sectionColor }]}>
                {" "}
                Créer un compte
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </AnimatedHeader>
  );
}

const s = StyleSheet.create({
  body: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    margin: 10,
    borderRadius: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 18,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    gap: 10,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  input: {
    flex: 1,
    fontSize: 14.5,
  },
  forgotWrapper: {
    alignItems: "flex-end",
    marginTop: 10,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "600",
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 28,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 28,
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: "500",
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  signupText: {
    fontSize: 13.5,
  },
  signupLink: {
    fontSize: 13.5,
    fontWeight: "700",
  },
});