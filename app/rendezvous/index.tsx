import { fetchRendezvous } from "@/lib/api";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  StyleSheet,
  Text,
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

  useEffect(() => {
    const load = async () => {
      try {
        const data: RendezVous[] = await fetchRendezvous();
        setRendezvous(data);
      } catch (err: any) {
        setErreur(err.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
          renderItem={({ item }: { item: RendezVous }) => (
            <View style={styles.card}>
              <Text style={styles.date}>
                📅 {item.date.slice(0, 10)} à {item.heure}
              </Text>
              <Text>Médecin : {item.medecin.utilisateur.nom}</Text>
              <Text>Type : {item.typeConsultation}</Text>
              <Text>Rappel : {item.rappel ? "Oui" : "Non"}</Text>
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
});
