// app/rendezvous/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

interface Medecin {
  id: number;
  specialite: string;
  utilisateur: { nom: string; email: string };
}

const heuresDisponibles = [
  "09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00",
];

const motifsConsultation = [
  "Urgence","Vaccin","Contrôle","Dépistage","Suivi","Bilan","Consultation",
  "Renouvellement prescription","Naissance","Contraception","Grossesse","Allaitement",
  "Examen","Certificat","Orientation","Surveillance","Diagnostic","Intervention",
  "Retrait","Traitement","Référence","Détresse","Autres",
];

export default function ModifierRendezVous() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [date, setDate] = useState<string>(""); // "YYYY-MM-DD"
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [heure, setHeure] = useState<string>("");
  const [typeConsultation, setTypeConsultation] = useState<string>("");
  const [rappel, setRappel] = useState(false);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [medecinId, setMedecinId] = useState<string>("");

  const [erreurs, setErreurs] = useState<Record<string, string>>({});

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      if (!API_URL) {
        Alert.alert("Configuration manquante", "EXPO_PUBLIC_API_URL n’est pas défini.");
        setInitialLoading(false);
        return;
      }
      try {
        // Charger médecins en parallèle
        const medecinsPromise = fetch(`${API_URL}/api/medecin`).then((r) => r.json());

        const token = await AsyncStorage.getItem("token");
        const rdvRes = await fetch(`${API_URL}/api/patient/rendezvous/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!rdvRes.ok) {
          const txt = await rdvRes.text();
          throw new Error(`Erreur serveur ${rdvRes.status}: ${txt}`);
        }
        const rdvData = await rdvRes.json();

        const loadedMedecins = await medecinsPromise.catch(() => []);
        setMedecins(Array.isArray(loadedMedecins) ? loadedMedecins : []);

        setDate(rdvData?.date?.substring(0, 10) || "");
        setHeure(rdvData?.heure || "");
        setTypeConsultation(rdvData?.typeConsultation || "");
        setRappel(Boolean(rdvData?.rappel));
        setMedecinId(rdvData?.medecinId ? String(rdvData.medecinId) : "");
      } catch (err) {
        console.error("Erreur lors du chargement :", err);
        Alert.alert("Erreur", "Impossible de charger les données du rendez-vous.");
      } finally {
        setInitialLoading(false);
      }
    };
    bootstrap();
  }, [API_URL, id]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!date) e.date = "La date est requise.";
    else {
      const selected = new Date(date);
      selected.setHours(0, 0, 0, 0);
      if (selected < today) e.date = "La date ne peut pas être passée.";
    }
    if (!heure) e.heure = "L’heure est requise.";
    if (!typeConsultation) e.typeConsultation = "Le motif est requis.";
    if (!medecinId) e.medecinId = "Sélectionnez un médecin.";
    setErreurs(e);
    return Object.keys(e).length === 0;
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate.toISOString().split("T")[0]);
    }
  };

  const submit = async () => {
    if (!API_URL) {
      Alert.alert("Configuration manquante", "EXPO_PUBLIC_API_URL n’est pas défini.");
      return;
    }
    if (!validate()) return;

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/patient/rendezvous/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date, heure, typeConsultation, rappel, medecinId }),
      });

      let result: any = {};
      try {
        result = await res.json();
      } catch {}

      if (!res.ok) {
        Alert.alert("Erreur", result?.message || "Échec de la mise à jour.");
        return;
      }

      Alert.alert("Succès", "Rendez-vous modifié avec succès.");
      router.push("/rendezvous");
    } catch (err) {
      console.error("Erreur PUT:", err);
      Alert.alert("Erreur", "Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Modifier le rendez-vous</Text>

          {/* Date */}
          <Text style={styles.label}>Date</Text>
          <Pressable style={styles.fieldBtn} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={18} color="#334155" />
            <Text style={styles.fieldBtnText}>{date || "Choisir une date"}</Text>
          </Pressable>
          {erreurs.date ? <Text style={styles.error}>{erreurs.date}</Text> : null}

          {showDatePicker && (
            <DateTimePicker
              value={date ? new Date(date) : today}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              minimumDate={today}
              onChange={handleDateChange}
            />
          )}

          {/* Heure */}
          <Text style={styles.label}>Heure</Text>
          <View style={styles.pickerWrapper}>
            <Picker selectedValue={heure} onValueChange={(v) => setHeure(String(v))}>
              <Picker.Item label="-- Sélectionner une heure --" value="" />
              {heuresDisponibles.map((h) => (
                <Picker.Item key={h} label={h} value={h} />
              ))}
            </Picker>
          </View>
          {erreurs.heure ? <Text style={styles.error}>{erreurs.heure}</Text> : null}

          {/* Motif */}
          <Text style={styles.label}>Type de consultation</Text>
          <View style={styles.pickerWrapper}>
            <Picker selectedValue={typeConsultation} onValueChange={(v) => setTypeConsultation(String(v))}>
              <Picker.Item label="-- Sélectionner un motif --" value="" />
              {motifsConsultation.map((type) => (
                <Picker.Item key={type} label={type} value={type} />
              ))}
            </Picker>
          </View>
          {erreurs.typeConsultation ? <Text style={styles.error}>{erreurs.typeConsultation}</Text> : null}

          {/* Rappel */}
          <View style={styles.switchRow}>
            <Text style={styles.label}>Rappel</Text>
            <Switch value={rappel} onValueChange={setRappel} />
          </View>

          {/* Médecin */}
          <Text style={styles.label}>Médecin</Text>
          <View style={styles.pickerWrapper}>
            <Picker selectedValue={medecinId} onValueChange={(v) => setMedecinId(String(v))}>
              <Picker.Item label="-- Sélectionner un médecin --" value="" />
              {medecins.map((m) => (
                <Picker.Item
                  key={m.id}
                  label={`${m.utilisateur.nom} (${m.specialite})`}
                  value={String(m.id)}
                />
              ))}
            </Picker>
          </View>
          {erreurs.medecinId ? <Text style={styles.error}>{erreurs.medecinId}</Text> : null}

          {/* CTA */}
          <Pressable
            onPress={submit}
            disabled={loading}
            style={({ pressed }) => [
              styles.primaryBtn,
              (pressed || loading) && { opacity: 0.9 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="save-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.primaryBtnText}>Modifier</Text>
              </View>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const colors = {
  bg: "#f2f2f2",
  card: "#ffffff",
  text: "#0f172a",
  subtext: "#475569",
  border: "#e2e8f0",
  fieldBorder: "#cbd5e1",
  primary: "#2563eb",
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.bg, padding: 16 },
  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg },

  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  title: { fontSize: 20, fontWeight: "800", color: colors.text, marginBottom: 10, textAlign: "center" },

  label: { fontWeight: "600", color: colors.subtext, marginTop: 12, marginBottom: 6 },

  pickerWrapper: {
    borderWidth: 1,
    borderColor: colors.fieldBorder,
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
  },

  switchRow: { marginTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  fieldBtn: {
    borderWidth: 1,
    borderColor: colors.fieldBorder,
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fieldBtnText: { color: colors.text },

  error: { color: "#dc2626", fontSize: 12, marginTop: 6 },

  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 16,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
