import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
    Alert,
    Button,
    KeyboardAvoidingView,
    Platform,
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
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await fetch(`${API_URL}/api/patient/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        Alert.alert("Erreur", result.message || "Connexion échouée");
        return;
      }

      await AsyncStorage.setItem("token", result.token);
      await AsyncStorage.setItem("role", result.utilisateur.role);

      Alert.alert("Succès", `Bienvenue ${result.utilisateur.nom}`);
      router.push("/rendezvous");
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Impossible de contacter le serveur");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Connexion Patient</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <Controller
          control={control}
          name="email"
          rules={{ required: "Email requis" }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              onChangeText={onChange}
              value={value || ""}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />
        {errors.email && (
          <Text style={styles.error}>{errors.email.message}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Mot de passe</Text>
        <Controller
          control={control}
          name="motDePasse"
          rules={{ required: "Mot de passe requis" }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              onChangeText={onChange}
              value={value || ""}
              secureTextEntry
            />
          )}
        />
        {errors.motDePasse && (
          <Text style={styles.error}>{errors.motDePasse.message}</Text>
        )}
      </View>

      <Button title="Se connecter" onPress={handleSubmit(onSubmit)} />

      <Link href="/register">
        <Text style={styles.link}>
          Nouveau patient ? Créez un compte ici
        </Text>
      </Link>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    color: "#2563eb",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontWeight: "600",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  link: {
    marginTop: 24,
    textAlign: "center",
    color: "#2563eb",
  },
});
