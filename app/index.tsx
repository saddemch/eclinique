// app/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";



const colors = {
  bg: "#f0f4f8",
  card: "#ffffff",
  primary: "#0ea5e9",
  primaryDark: "#0284c7",
  accent: "#2563eb",
  text: "#0f172a",
  subtext: "#475569",
};

function AppButton({
  title,
  icon,
  onPress,
  variant = "primary",
}: {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
}) {
 const base = [styles.btn];
  if (variant === "primary") base.push({ ...styles.btn, ...styles.btnPrimary });
  if (variant === "secondary") base.push({ ...styles.btn, ...styles.btnSecondary });
  if (variant === "ghost") base.push({ ...styles.btn, ...styles.btnGhost });

  const color = variant === "ghost" ? colors.accent : "#fff";

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [base, pressed && { opacity: 0.9 }]}>
      <View style={styles.btnInner}>
        {icon ? <Ionicons name={icon} size={18} color={color} style={{ marginRight: 8 }} /> : null}
        <Text style={[styles.btnText, { color }]}>{title}</Text>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={["#e0f2fe", "#f8fafc"]}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.container}>
          <View style={styles.hero}>
            
              <Image
  source={require("../assets/images/SGDM.webp")}
  style={styles.logo}
  resizeMode="contain"
/>

           

            <Text style={styles.title}>Bienvenue sur eClinique</Text>
            <Text style={styles.subtitle}>
              Gérez vos rendez-vous médicaux avec notre application en toute simplicité.
            </Text>
          </View>

          <View style={styles.card}>
            <AppButton
              title="Se connecter"
              icon="log-in-outline"
              onPress={() => router.push("/login")}
              variant="primary"
            />
            
            <AppButton
              title="En savoir plus"
              icon="information-circle-outline"
              onPress={() => {}}
              variant="ghost"
            />
          </View>

          <View style={styles.footerNote}>
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.subtext} />
            <Text style={styles.footerText}>   Données chiffrées et sécurisées</Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 16, justifyContent: "center" },
  hero: { alignItems: "center", marginBottom: 8 },

logo: {
  width: 130,   // avant 90
  height: 130,  // avant 90
},


  title: { fontSize: 26, fontWeight: "800", color: colors.text, letterSpacing: 0.2 },
  subtitle: {
    textAlign: "center",
    color: colors.subtext,
    marginTop: 8,
    lineHeight: 20,
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
    gap: 12,
  },

  btn: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  btnInner: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  btnPrimary: { backgroundColor: colors.accent },
  btnSecondary: { backgroundColor: colors.primary },
  btnGhost: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.accent },
  btnText: { fontSize: 16, fontWeight: "700" },

  footerNote: { flexDirection: "row", justifyContent: "center", marginTop: 8 },
  footerText: { color: colors.subtext, fontSize: 12 },
});

  


