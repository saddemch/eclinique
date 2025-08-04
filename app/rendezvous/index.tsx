import { fetchRendezvous } from "@/lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface RendezVous {
  id: number;
  date: string;
  heure: string;
  typeConsultation: string;
  rappel: boolean;
  medecin: {
    utilisateur: {
      nom: string;
    };
  };
}

export default function RendezvousIndex() {
  const [rendezvous, setRendezvous] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [erreur, setErreur] = useState<string>("");
  const router = useRouter();

  const API_URL = process.env.EXPO_PUBLIC_API_URL; // 🔧 adapte à ton IP locale

  useEffect(() => {
    loadRendezvous();
  }, []);

  const loadRendezvous = async () => {
    try {
      const data: RendezVous[] = await fetchRendezvous();
      setRendezvous(data);
    } catch (err: any) {
      setErreur(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const supprimerRendezvous = async (id: number) => {
    Alert.alert(
      "Confirmation",
      "Voulez-vous vraiment annuler ce rendez-vous ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Oui, supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const res = await fetch(
                `${API_URL}/api/patient/rendezvous/${id}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (!res.ok) {
                const result = await res.json();
                Alert.alert(
                  "Erreur",
                  result.message || "Échec de la suppression"
                );
                return;
              }

              setRendezvous((prev) => prev.filter((r) => r.id !== id));
              Alert.alert("Succès", "Rendez-vous annulé.");
            } catch (err) {
              Alert.alert("Erreur", "Impossible de contacter le serveur.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Button
        title="Prendre un rendez-vous"
        onPress={() => router.push("/rendezvous/nouveau")}
      />

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2e7d32"
          style={{ marginTop: 20 }}
        />
      ) : erreur ? (
        <Text style={styles.erreur}>❌ {erreur}</Text>
      ) : rendezvous.length === 0 ? (
        <Text style={styles.aucun}>Aucun rendez-vous</Text>
      ) : (
        <FlatList
          data={rendezvous}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.date}>
                📅 {item.date.slice(0, 10)} à {item.heure}
              </Text>
              <Text>Médecin : {item.medecin.utilisateur.nom}</Text>
              <Text>Type : {item.typeConsultation}</Text>
              <Text>Rappel : {item.rappel ? "Oui" : "Non"}</Text>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => supprimerRendezvous(item.id)}
              >
                <Text style={styles.deleteText}>🗑️ Annuler</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    flex: 1,
  },
  erreur: {
    color: "red",
    marginTop: 20,
    textAlign: "center",
  },
  aucun: {
    marginTop: 20,
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  date: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  deleteButton: {
    marginTop: 8,
    alignSelf: "flex-end",
  },
  deleteText: {
    color: "#b91c1c",
    fontWeight: "bold",
  },
});
