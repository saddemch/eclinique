// app/rendezvous/nouveau.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
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

const heuresDisponibles = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00"];

const motifsConsultation = [
  "Urgence","Vaccin","Contrôle","Dépistage","Suivi","Bilan","Consultation",
  "Renouvellement prescription","Naissance","Contraception","Grossesse","Allaitement",
  "Examen","Certificat","Orientation","Surveillance","Diagnostic","Intervention",
  "Retrait","Traitement","Référence","Détresse","Autres",
];

export default function NouveauRendezVous() {
  const router = useRouter();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  // 🔹 Champs VIDES par défaut
  const [date, setDate] = useState<string>("");         // ex: "2025-08-07"
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [heure, setHeure] = useState<string>("");       // ex: "09:00"
  const [typeConsultation, setTypeConsultation] = useState<string>("");
  const [rappel, setRappel] = useState(false);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [medecinId, setMedecinId] = useState<string>(""); // ex: "3"
  const [loading, setLoading] = useState(false);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  useEffect(() => {
    const fetchMedecins = async () => {
      try {
        if (!API_URL) return;
        const res = await fetch(`${API_URL}/api/medecin`);
        const data = await res.json();
        setMedecins(Array.isArray(data) ? data : []);
        // ❌ NE PAS pré-sélectionner le 1er médecin
        // setMedecinId(String(data[0].id))
      } catch (err) {
        console.error("Erreur chargement médecins:", err);
        Alert.alert("Erreur", "Impossible de charger la liste des médecins.");
      }
    };
    fetchMedecins();
  }, [API_URL]);

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
      setDate(selectedDate.toISOString().split("T")[0]); // YYYY-MM-DD
    }
  };

  const submit = async () => {
    if (!API_URL) {
      Alert.alert("Configuration manquante","EXPO_PUBLIC_API_URL n’est pas défini. Ajoute-le dans .env puis relance `npx expo start -c`.");
      return;
    }
    if (!validate()) return;

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/patient/rendezvous`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ date, heure, typeConsultation, rappel, medecinId }),
      });

      let result: any = {};
      try { result = await res.json(); } catch {}

      if (!res.ok) {
        Alert.alert("Erreur", result?.message || "Erreur lors de la création.");
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
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Nouveau rendez-vous</Text>

          {/* Date */}
          <Text style={styles.label}>Date</Text>
          <Pressable style={styles.fieldBtn} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={18} color="#334155" />
            <Text style={styles.fieldBtnText}>{date || "Choisir une date"}</Text>
          </Pressable>
          {erreurs.date ? <Text style={styles.error}>{erreurs.date}</Text> : null}
          {showDatePicker && (
            <DateTimePicker
              value={date ? new Date(date) : today} // n'écrit PAS dans le state automatiquement
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
              <Picker.Item label="-- Sélectionner un médecin --" value="" /> {/* ✅ placeholder */}
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
          <Pressable onPress={submit} disabled={loading} style={({ pressed }) => [styles.primaryBtn, (pressed || loading) && { opacity: 0.9 }]}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="save-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.primaryBtnText}>Enregistrer</Text>
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
  pickerWrapper: { borderWidth: 1, borderColor: colors.fieldBorder, borderRadius: 12, backgroundColor: "#fff", overflow: "hidden" },
  switchRow: { marginTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  fieldBtn: {
    borderWidth: 1, borderColor: colors.fieldBorder, borderRadius: 12, backgroundColor: "#fff",
    paddingVertical: 12, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8,
  },
  fieldBtnText: { color: colors.text },
  error: { color: "#dc2626", fontSize: 12, marginTop: 6 },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, marginTop: 16, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
