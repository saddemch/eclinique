// app/login.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type LoginForm = {
  email: string;
  motDePasse: string;
};

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: { email: "", motDePasse: "" },
    mode: "onTouched",
  });

  const onSubmit = async (data: LoginForm) => {
    if (!API_URL) {
      Alert.alert(
        "Configuration manquante",
        "EXPO_PUBLIC_API_URL n’est pas défini. Ajoute-le dans ton .env puis redémarre avec `npx expo start -c`."
      );
      return;
    }

    try {
      setIsLoading(true);

      const res = await fetch(`${API_URL}/api/patient/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      let result: any = {};
      try {
        result = await res.json();
      } catch {
        // cas où le serveur ne renvoie pas de JSON valide
      }

      if (!res.ok) {
        const msg =
          result?.message ||
          result?.error ||
          "Identifiants invalides. Vérifiez votre email et mot de passe.";
        Alert.alert("Erreur", msg);
        return;
      }

      if (!result?.token || !result?.utilisateur) {
        Alert.alert("Erreur", "Réponse inattendue du serveur.");
        return;
      }

      await AsyncStorage.setItem("token", String(result.token));
      if (result.utilisateur?.role) {
        await AsyncStorage.setItem("role", String(result.utilisateur.role));
      }
      if (result.utilisateur?.nom) {
        await AsyncStorage.setItem("nom", String(result.utilisateur.nom));
      }

      Alert.alert("Succès", `Bienvenue ${result.utilisateur.nom || ""}`.trim());
      router.push("/rendezvous");
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Impossible de contacter le serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={["#e0f2fe", "#f8fafc"]}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.card}>
              <Text style={styles.title}>Connexion</Text>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={18} color="#64748b" style={styles.inputIcon} />
                  <Controller
                    control={control}
                    name="email"
                    rules={{
                      required: "Email requis",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Email invalide",
                      },
                    }}
                    render={({ field: { onChange, value, onBlur } }) => (
                      <TextInput
                        style={styles.input}
                        onChangeText={onChange}
                        value={value}
                        onBlur={onBlur}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        placeholder="ex: prenom.nom@email.com"
                        placeholderTextColor="#94a3b8"
                        returnKeyType="next"
                      />
                    )}
                  />
                </View>
                {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
              </View>

              {/* Mot de passe */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mot de passe</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={18} color="#64748b" style={styles.inputIcon} />
                  <Controller
                    control={control}
                    name="motDePasse"
                    rules={{
                      required: "Mot de passe requis",
                      minLength: { value: 6, message: "6 caractères minimum" },
                    }}
                    render={({ field: { onChange, value, onBlur } }) => (
                      <TextInput
                        style={styles.input}
                        onChangeText={onChange}
                        value={value}
                        onBlur={onBlur}
                        secureTextEntry={!showPwd}
                        autoCapitalize="none"
                        placeholder="••••••••"
                        placeholderTextColor="#94a3b8"
                        returnKeyType="done"
                        onSubmitEditing={() => handleSubmit(onSubmit)()}
                      />
                    )}
                  />
                  <Pressable
                    onPress={() => setShowPwd((s) => !s)}
                    hitSlop={10}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={showPwd ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color="#64748b"
                    />
                  </Pressable>
                </View>
                {errors.motDePasse && <Text style={styles.error}>{errors.motDePasse.message}</Text>}
              </View>

              {/* Bouton Se connecter */}
              <Pressable
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.btnPrimary,
                  (pressed || isLoading) && { opacity: 0.9 },
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator />
                ) : (
                  <View style={styles.btnInner}>
                    <Ionicons name="log-in-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.btnText}>Se connecter</Text>
                  </View>
                )}
              </Pressable>

              {/* Lien inscription */}
              <Link href="/register" asChild>
                <Pressable>
                  <Text style={styles.link}>
                    Nouveau patient ? <Text style={{ fontWeight: "700" }}>Créez un compte</Text>
                  </Text>
                </Pressable>
              </Link>
            </View>

            {/* Note de sécurité */}
            <View style={styles.footerNote}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#475569" />
              <Text style={styles.footerText}>   Données chiffrées et sécurisées</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const colors = {
  card: "#ffffff",
  primary: "#2563eb",
  primaryAlt: "#0ea5e9",
  text: "#0f172a",
  subtext: "#475569",
  border: "#e2e8f0",
  fieldBorder: "#cbd5e1",
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 16,
    color: colors.text,
  },
  inputGroup: { marginBottom: 14 },
  label: { fontWeight: "600", marginBottom: 6, color: colors.subtext },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.fieldBorder,
    paddingVertical: 12,
    paddingLeft: 40, // pour l’icône à gauche
    paddingRight: 40, // pour l’icône œil à droite
    borderRadius: 12,
    backgroundColor: "#fff",
    color: colors.text,
  },
  inputIcon: {
    position: "absolute",
    left: 12,
    zIndex: 1,
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    height: "100%",
    justifyContent: "center",
  },
  error: {
    color: "#dc2626",
    fontSize: 12,
    marginTop: 6,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 6,
    alignItems: "center",
  },
  btnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  link: {
    marginTop: 18,
    textAlign: "center",
    color: colors.primaryAlt,
  },
  footerNote: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 14,
  },
  footerText: { color: colors.subtext, fontSize: 12 },
});
