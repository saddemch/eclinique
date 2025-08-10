const API_URL = process.env.EXPO_PUBLIC_API_URL!;

export type UserProfile = {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  dateNaissance: string; // "YYYY-MM-DD" recommandé côté UI
  // Changement de mot de passe (optionnels)
  currentPassword?: string;
  newPassword?: string;
  newPasswordConfirm?: string;
};

async function getToken(): Promise<string | null> {
  const { default: AsyncStorage } = await import("@react-native-async-storage/async-storage");
  return AsyncStorage.getItem("token"); // adapte la clé si différente
}

export async function getProfile(): Promise<UserProfile> {
  const token = await getToken();
  const res = await fetch(`${API_URL}/api/patient/profil`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`GET profile ${res.status}`);
  const data = await res.json();

  // Normalise la date pour l’UI -> "YYYY-MM-DD"
  const iso = data.dateNaissance ? new Date(data.dateNaissance).toISOString().slice(0, 10) : "";
  return { ...data, dateNaissance: iso };
}

export async function updateProfile(payload: UserProfile): Promise<{ passwordChanged?: boolean } & UserProfile> {
  const token = await getToken();
  const res = await fetch(`${API_URL}/api/patient/profil`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    // On envoie la date au format YYYY-MM-DD (ton backend accepte)
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || `PUT profile ${res.status}`);

  const iso = json.dateNaissance ? new Date(json.dateNaissance).toISOString().slice(0, 10) : "";
  return { ...json, dateNaissance: iso };
}
