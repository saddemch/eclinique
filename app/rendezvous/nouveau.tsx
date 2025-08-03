"use client";

import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

interface Medecin {
  id: number;
  specialite: string;
  utilisateur: {
    nom: string;
    email: string;
  };
}

const heuresDisponibles = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

const motifsConsultation = [
  "Urgence",
  "Vaccin",
  "Contrôle",
  "Dépistage",
  "Suivi",
  "Bilan",
  "Consultation",
  "Renouvellement prescription",
  "Naissance",
  "Contraception",
  "Grossesse",
  "Allaitement",
  "Examen",
  "Certificat",
  "Orientation",
  "Surveillance",
  "Diagnostic",
  "Intervention",
  "Retrait",
  "Traitement",
  "Référence",
  "Détresse",
  "Autres",
];

export default function NouveauRendezVous() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [heure, setHeure] = useState("");
  const [typeConsultation, setTypeConsultation] = useState("");
  const [rappel, setRappel] = useState(false);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [medecinId, setMedecinId] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = "http://192.168.2.16:3000";

  useEffect(() => {
    const fetchMedecins = async () => {
      try {
        const res = await fetch(`${API_URL}/api/medecin`);
        const data = await res.json();
        setMedecins(data);
        if (data.length > 0) setMedecinId(data[0].id.toString());
      } catch (err) {
        console.error("Erreur chargement médecins:", err);
      }
    };
    fetchMedecins();
  }, []);

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate.toISOString().split("T")[0]);
    }
  };

  const submit = async () => {
    if (!date || !heure || !typeConsultation || !medecinId) {
      Alert.alert("Champs requis", "Tous les champs doivent être remplis.");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/patient/rendezvous`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date,
          heure,
          typeConsultation,
          rappel,
          medecinId,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        Alert.alert("Erreur", result.message || "Erreur lors de la création");
        return;
      }

      Alert.alert("Succès", "Rendez-vous créé avec succès.");
      router.push("/rendezvous");
    } catch (err) {
      console.error("Erreur POST rendezvous:", err);
      Alert.alert("Erreur", "Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Date</Text>
      <Button
        title={date || "Choisir une date"}
        onPress={() => setShowDatePicker(true)}
      />
      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
        />
      )}

      <Text style={styles.label}>Heure</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={heure}
          onValueChange={(value) => setHeure(value)}
        >
          <Picker.Item label="-- Sélectionner une heure --" value="" />
          {heuresDisponibles.map((h) => (
            <Picker.Item key={h} label={h} value={h} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Type de consultation</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={typeConsultation}
          onValueChange={(value) => setTypeConsultation(value)}
        >
          <Picker.Item label="-- Sélectionner un motif --" value="" />
          {motifsConsultation.map((type) => (
            <Picker.Item key={type} label={type} value={type} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Rappel</Text>
      <Switch value={rappel} onValueChange={setRappel} />

      <Text style={styles.label}>Médecin</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={medecinId}
          onValueChange={(value) => setMedecinId(value)}
        >
          {medecins.map((m) => (
            <Picker.Item
              key={m.id}
              label={`${m.utilisateur.nom} (${m.specialite})`}
              value={m.id.toString()}
            />
          ))}
        </Picker>
      </View>

      <Button title="Enregistrer" onPress={submit} disabled={loading} />
      {loading && <ActivityIndicator style={{ marginTop: 20 }} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  label: {
    marginTop: 12,
    fontWeight: "600",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginTop: 4,
  },
});
