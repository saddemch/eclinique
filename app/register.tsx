import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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

type FormData = {
  prenom: string;
  nom: string;
  email: string;
  motDePasse: string;
  dateNaissance: string;
  adresse: string;
  telephone: string;
};

export default function Register() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      prenom: "",
      nom: "",
      email: "",
      motDePasse: "",
      dateNaissance: "",
      adresse: "",
      telephone: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/patient/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        Alert.alert("Erreur", result.message || "Inscription échouée");
        return;
      }

      await AsyncStorage.setItem("token", result.token);
      await AsyncStorage.setItem("role", result.utilisateur.role);

      Alert.alert("Succès", "Compte créé avec succès !");
      router.push("/rendezvous");
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Impossible de communiquer avec le serveur");
    } finally {
      setIsLoading(false);
    }
  };

  const fields: {
    name: keyof FormData;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    keyboardType?: any;
    secureTextEntry?: boolean;
  }[] = [
    { name: "prenom", label: "Prénom", icon: "person-outline" },
    { name: "nom", label: "Nom", icon: "person-outline" },
    { name: "email", label: "Email", icon: "mail-outline", keyboardType: "email-address" },
    { name: "motDePasse", label: "Mot de passe", icon: "lock-closed-outline", secureTextEntry: true },
    { name: "adresse", label: "Adresse", icon: "home-outline" },
    { name: "telephone", label: "Téléphone", icon: "call-outline", keyboardType: "phone-pad" },
  ];

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
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.card}>
              <Text style={styles.title}>Inscription Patient</Text>

              {/* Champs classiques */}
              {fields.map(({ name, label, icon, keyboardType, secureTextEntry }) => (
                <View key={name} style={styles.inputGroup}>
                  <Text style={styles.label}>{label}</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name={icon} size={18} color="#64748b" style={styles.inputIcon} />
                    <Controller
                      control={control}
                      name={name}
                      rules={{ required: `Le champ ${label} est requis` }}
                      render={({ field: { onChange, value } }) => (
                        <TextInput
                          style={styles.input}
                          onChangeText={onChange}
                          value={value}
                          keyboardType={keyboardType}
                          secureTextEntry={secureTextEntry}
                          placeholder={label}
                          placeholderTextColor="#94a3b8"
                        />
                      )}
                    />
                  </View>
                  {errors[name] && (
                    <Text style={styles.error}>{errors[name]?.message as string}</Text>
                  )}
                </View>
              ))}

              {/* Date de naissance */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date de naissance</Text>
                <Controller
                  control={control}
                  name="dateNaissance"
                  rules={{ required: "La date de naissance est requise" }}
                  render={({ field: { onChange, value } }) => (
                    <>
                      <Pressable
                        onPress={() => setShowDatePicker(true)}
                        style={styles.inputWrapper}
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={18}
                          color="#64748b"
                          style={styles.inputIcon}
                        />
                        <Text style={[styles.input, { paddingVertical: 14 }]}>
                          {value ? format(new Date(value), "dd/MM/yyyy") : "Sélectionner une date"}
                        </Text>
                      </Pressable>

                      {showDatePicker && (
                        <DateTimePicker
                          value={value ? new Date(value) : new Date(2000, 0, 1)}
                          mode="date"
                          display={Platform.OS === "ios" ? "spinner" : "default"}
                          maximumDate={new Date()}
                          onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) {
                              onChange(selectedDate.toISOString().split("T")[0]);
                            }
                          }}
                        />
                      )}
                    </>
                  )}
                />
                {errors.dateNaissance && (
                  <Text style={styles.error}>{errors.dateNaissance.message as string}</Text>
                )}
              </View>

              {/* Bouton inscription */}
              <Pressable
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.btnPrimary,
                  (pressed || isLoading) && { opacity: 0.9 },
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>S'inscrire</Text>
                )}
              </Pressable>
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
  text: "#0f172a",
  subtext: "#475569",
  border: "#e2e8f0",
  fieldBorder: "#cbd5e1",
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
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
    paddingLeft: 40,
    borderRadius: 12,
    backgroundColor: "#fff",
    color: colors.text,
  },
  inputIcon: {
    position: "absolute",
    left: 12,
    zIndex: 1,
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
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
