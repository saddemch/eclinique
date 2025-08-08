// app/rendezvous/index.tsx
import { fetchRendezvous } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface RendezVous {
  id: number;
  date: string; // "YYYY-MM-DD" ou ISO
  heure: string; // "09:00"
  typeConsultation: string;
  rappel: boolean;
  medecin: { utilisateur: { nom: string } };
}

type Filter = "all" | "upcoming" | "past";

export default function RendezvousIndex() {
  const [rendezvous, setRendezvous] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erreur, setErreur] = useState("");
  const [filter, setFilter] = useState<Filter>("upcoming"); // défaut: À venir
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // asc = plus ancien d'abord
  const router = useRouter();

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    loadRendezvous();
  }, []);

  const loadRendezvous = async () => {
    try {
      setErreur("");
      setLoading(true);
      const data = await fetchRendezvous();
      setRendezvous(data);
    } catch (err: any) {
      setErreur(err?.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await fetchRendezvous();
      setRendezvous(data);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const supprimerRendezvous = async (id: number) => {
    Alert.alert("Confirmation", "Voulez-vous vraiment annuler ce rendez-vous ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Oui, supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            if (!API_URL) {
              Alert.alert("Configuration manquante", "EXPO_PUBLIC_API_URL n’est pas défini.");
              return;
            }
            const token = await AsyncStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/patient/rendezvous/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
              let result: any = {};
              try { result = await res.json(); } catch {}
              Alert.alert("Erreur", result?.message || "Échec de la suppression");
              return;
            }
            setRendezvous((prev) => prev.filter((r) => r.id !== id));
            Alert.alert("Succès", "Rendez-vous annulé.");
          } catch {
            Alert.alert("Erreur", "Impossible de contacter le serveur.");
          }
        },
      },
    ]);
  };

  // Helpers
  const makeDateTime = (isoDate: string, heure: string) => {
    // Supporte "YYYY-MM-DD" ou ISO complet
    return isoDate.length > 10 ? new Date(isoDate) : new Date(`${isoDate}T${heure || "00:00"}`);
  };
  const now = new Date();

  const filtered = useMemo(() => {
    let list: RendezVous[] = [];
    if (filter === "all") {
      list = [...rendezvous];
    } else if (filter === "upcoming") {
      list = [...rendezvous].filter((r) => makeDateTime(r.date, r.heure) >= now);
    } else {
      list = [...rendezvous].filter((r) => makeDateTime(r.date, r.heure) < now);
    }

    // Tri selon l’ordre choisi
    list.sort((a, b) => {
      const diff = +makeDateTime(a.date, a.heure) - +makeDateTime(b.date, b.heure);
      return sortOrder === "asc" ? diff : -diff;
    });

    return list;
  }, [rendezvous, filter, sortOrder]);

  const formatDate = (iso: string, heure: string) => {
    const d = makeDateTime(iso, heure);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy} à ${heure}`;
  };

  const SectionHeader = () => (
    <View style={{ paddingBottom: 8 }}>
      {/* Top bar: CTA + avatar profil */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push("/rendezvous/nouveau")}>
          <Ionicons name="add-circle-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.primaryBtnText}>Prendre un rendez-vous</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/profil")} style={styles.avatarBtn}>
          <Image
            source={require("../../assets/images/user.webp")} // chemin depuis app/rendezvous/
            style={{ width: 32, height: 32, borderRadius: 16 }}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>

      {/* Filtres */}
      <View style={styles.filterRow}>
        <FilterChip label="À venir" active={filter === "upcoming"} onPress={() => setFilter("upcoming")} />
        <FilterChip label="Passés" active={filter === "past"} onPress={() => setFilter("past")} />
        <FilterChip label="Tous" active={filter === "all"} onPress={() => setFilter("all")} />
      </View>

      {/* Tri */}
      <View style={styles.sortRow}>
        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
        >
          <Ionicons
            name={sortOrder === "asc" ? "arrow-down-outline" : "arrow-up-outline"}
            size={16}
            color="#0369a1"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.sortBtnText}>
            {sortOrder === "asc" ? "Plus ancien → Plus récent" : "Plus récent → Plus ancien"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyBox}>
      <Ionicons name="calendar-outline" size={32} />
      <Text style={styles.emptyTitle}>Aucun rendez-vous</Text>
      <Text style={styles.emptySubtitle}>Planifiez votre première consultation.</Text>
      <TouchableOpacity style={[styles.primaryBtn, { marginTop: 10 }]} onPress={() => router.push("/rendezvous/nouveau")}>
        <Ionicons name="add-circle-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.primaryBtnText}>Nouveau rendez-vous</Text>
      </TouchableOpacity>
    </View>
  );

  const ErrorState = () => (
    <View style={styles.emptyBox}>
      <Ionicons name="alert-circle-outline" size={32} />
      <Text style={styles.emptyTitle}>Oups…</Text>
      <Text style={styles.emptySubtitle}>{erreur}</Text>
      <TouchableOpacity style={[styles.primaryBtn, { marginTop: 10 }]} onPress={loadRendezvous}>
        <Ionicons name="refresh-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.primaryBtnText}>Réessayer</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: { item: RendezVous }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Ionicons name="calendar-outline" size={18} color="#0f172a" />
        <Text style={styles.dateText}>{formatDate(item.date, item.heure)}</Text>
      </View>

      <View style={[styles.row, { marginTop: 6 }]}>
        <Ionicons name="medkit-outline" size={18} color="#0f172a" />
        <Text style={styles.text}>Dr {item.medecin.utilisateur.nom}</Text>
      </View>

      <View style={styles.badgesRow}>
        <View style={styles.badge}>
          <Ionicons name="pricetag-outline" size={14} color="#0369a1" />
          <Text style={styles.badgeText}>{item.typeConsultation}</Text>
        </View>
        <View style={[styles.badge, item.rappel ? styles.badgeGreen : styles.badgeGray]}>
          <Ionicons name="notifications-outline" size={14} color={item.rappel ? "#166534" : "#334155"} />
          <Text style={[styles.badgeText, { color: item.rappel ? "#166534" : "#334155" }]}>
            {item.rappel ? "Rappel: Oui" : "Rappel: Non"}
          </Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Link href={{ pathname: "/rendezvous/[id]", params: { id: String(item.id) } }} asChild>
          <TouchableOpacity style={styles.linkBtn}>
            <Ionicons name="pencil-outline" size={16} color="#0284c7" style={{ marginRight: 6 }} />
            <Text style={styles.linkBtnText}>Modifier</Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity style={styles.dangerBtn} onPress={() => supprimerRendezvous(item.id)}>
          <Ionicons name="trash-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.dangerBtnText}>Annuler</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" />
        </View>
      ) : erreur ? (
        <ErrorState />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListHeaderComponent={<SectionHeader />}
          ListEmptyComponent={<EmptyState />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </SafeAreaView>
  );
}

const colors = {
  bg: "#f2f2f2",
  card: "#ffffff",
  text: "#0f172a",
  subtext: "#475569",
  border: "#e2e8f0",
  primary: "#2563eb",
  danger: "#b91c1c",
  chipBg: "#e5e7eb",
  chipActiveBg: "#e0f2fe",
  chipActiveText: "#0369a1",
};

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 999,
          backgroundColor: active ? colors.chipActiveBg : colors.chipBg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: active ? "#bae6fd" : colors.border,
        },
      ]}
    >
      <Text style={{ color: active ? colors.chipActiveText : colors.subtext, fontWeight: "700" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  listContent: { padding: 16, backgroundColor: colors.bg, flexGrow: 1 },

  topBar: {
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatarBtn: {
    marginLeft: 12,
    padding: 2,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  filterRow: { flexDirection: "row", gap: 8, marginBottom: 8 },

  sortRow: { marginTop: 6, flexDirection: "row", justifyContent: "flex-end" },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0f2fe",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#bae6fd",
  },
  sortBtnText: { color: "#0369a1", fontWeight: "600", fontSize: 12 },

  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },

  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg },

  emptyBox: { flex: 1, alignItems: "center", padding: 24, backgroundColor: colors.bg },
  emptyTitle: { marginTop: 8, fontSize: 18, fontWeight: "700", color: colors.text },
  emptySubtitle: { color: colors.subtext, marginTop: 4, textAlign: "center" },

  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  dateText: { marginLeft: 6, fontWeight: "700", color: colors.text },
  text: { marginLeft: 6, color: colors.text },

  badgesRow: { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#e0f2fe",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  badgeText: { color: "#0369a1", fontWeight: "600" },
  badgeGreen: { backgroundColor: "#dcfce7" },
  badgeGray: { backgroundColor: "#e5e7eb" },

  actionsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  linkBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 10 },
  linkBtnText: { color: "#0284c7", fontWeight: "700" },
  dangerBtn: {
    backgroundColor: colors.danger,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  dangerBtnText: { color: "#fff", fontWeight: "700" },
});
