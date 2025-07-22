import { router } from "expo-router";
import { Button, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f0f0f0", padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>Bienvenue sur eClinique</Text>

      <Button
        title="Se connecter"
        onPress={() => router.push("/login")}
        color="#2563eb"
      />

      <View style={{ height: 20 }} />

      <Button
        title="En cours de développement"
        onPress={() => router.push("/rendezvous")}
        color="#0ea5e9"
      />
    </View>
  );
}
