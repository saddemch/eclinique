import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function fetchRendezvous() {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("Token manquant");

    const res = await fetch(`${API_URL}/api/patient/rendezvous`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Erreur inconnue");
    }

    return await res.json(); // ⬅️ liste des rendez-vous
  } catch (err) {
    console.error("❌ Erreur fetchRendezvous:", err);
    throw err;
  }
}
