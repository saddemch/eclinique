import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
    Alert,
    Button,
    KeyboardTypeOptions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

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
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch(
        "http://192.168.18.9:3000/api/patient/signup", // ✅ fonctionne avec simulateur Android
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

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
    }
  };

  const fields: {
    name: keyof FormData;
    label: string;
    keyboardType?: KeyboardTypeOptions;
    secureTextEntry?: boolean;
  }[] = [
    { name: "prenom", label: "Prénom" },
    { name: "nom", label: "Nom" },
    { name: "email", label: "Email", keyboardType: "email-address" },
    { name: "motDePasse", label: "Mot de passe", secureTextEntry: true },
    { name: "dateNaissance", label: "Date de naissance (YYYY-MM-DD)" },
    { name: "adresse", label: "Adresse" },
    { name: "telephone", label: "Téléphone", keyboardType: "phone-pad" },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Inscription Patient</Text>

      {fields.map(({ name, label, keyboardType, secureTextEntry }) => (
        <View key={name} style={styles.inputGroup}>
          <Text style={styles.label}>{label}</Text>
          <Controller
            control={control}
            name={name}
            rules={{ required: `Le champ ${label} est requis` }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                onChangeText={onChange}
                value={value || ""}
                keyboardType={keyboardType}
                secureTextEntry={secureTextEntry}
              />
            )}
          />
          {errors[name] && (
            <Text style={styles.error}>{errors[name]?.message as string}</Text>
          )}
        </View>
      ))}

      <Button title="S'inscrire" onPress={handleSubmit(onSubmit)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
    backgroundColor: "#f8f8ff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2e7d32",
    textAlign: "center",
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    fontWeight: "600",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  error: {
    color: "red",
    fontSize: 12,
  },
});
