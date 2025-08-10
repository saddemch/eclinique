// app/profil.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

interface UserProfile {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  dateNaissance: string;
}

export default function Profil() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const [nom, prenom, email, telephone, adresse, dateNaissance] = await Promise.all([
        AsyncStorage.getItem("nom"),
        AsyncStorage.getItem("prenom"),
        AsyncStorage.getItem("email"),
        AsyncStorage.getItem("telephone"),
        AsyncStorage.getItem("adresse"),
        AsyncStorage.getItem("dateNaissance"),
      ]);

      const userProfile: UserProfile = {
        nom: nom || "",
        prenom: prenom || "",
        email: email || "",
        telephone: telephone || "",
        adresse: adresse || "",
        dateNaissance: dateNaissance || "",
      };

      setProfile(userProfile);
      setEditedProfile(userProfile);
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error);
      Alert.alert("Erreur", "Impossible de charger le profil");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile);
  };

  const handleSave = async () => {
    if (!editedProfile) return;

    try {
      setIsLoading(true);
      
      // Ici, vous pourriez appeler votre API pour mettre à jour le profil
      // Pour l'instant, on met à jour le stockage local
      await Promise.all([
        AsyncStorage.setItem("nom", editedProfile.nom),
        AsyncStorage.setItem("prenom", editedProfile.prenom),
        AsyncStorage.setItem("email", editedProfile.email),
        AsyncStorage.setItem("telephone", editedProfile.telephone),
        AsyncStorage.setItem("adresse", editedProfile.adresse),
        AsyncStorage.setItem("dateNaissance", editedProfile.dateNaissance),
      ]);

      setProfile(editedProfile);
      setIsEditing(false);
      Alert.alert("Succès", "Profil mis à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      Alert.alert("Erreur", "Impossible de sauvegarder le profil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Déconnexion",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              router.replace("/");
            } catch (error) {
              console.error("Erreur lors de la déconnexion:", error);
            }
          },
        },
      ]
    );
  };

  const updateField = (field: keyof UserProfile, value: string) => {
    if (editedProfile) {
      setEditedProfile({ ...editedProfile, [field]: value });
    }
  };

  if (!profile) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={["#e0f2fe", "#f8fafc"]}
          style={{ flex: 1 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement du profil...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={["#e0f2fe", "#f8fafc"]}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView style={styles.container}>
          {/* Header avec avatar et nom */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Image
                source={require("../assets/images/user.webp")}
                style={styles.avatar}
                resizeMode="cover"
              />
              <View style={styles.avatarBadge}>
                <Ionicons name="camera-outline" size={16} color="#fff" />
              </View>
            </View>
            <Text style={styles.userName}>
              {profile.prenom} {profile.nom}
            </Text>
            <Text style={styles.userEmail}>{profile.email}</Text>
          </View>

          {/* Boutons d'action */}
          <View style={styles.actionButtons}>
            {!isEditing ? (
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Ionicons name="pencil-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.editButtonText}>Modifier le profil</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveButton} 
                  onPress={handleSave}
                  disabled={isLoading}
                >
                  <Ionicons name="checkmark-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.saveButtonText}>
                    {isLoading ? "Sauvegarde..." : "Sauvegarder"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Informations du profil */}
          <View style={styles.profileSection}>
            <Text style={styles.sectionTitle}>Informations personnelles</Text>
            
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Prénom</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedProfile?.prenom || ""}
                  onChangeText={(value) => updateField("prenom", value)}
                  placeholder="Votre prénom"
                />
              ) : (
                <Text style={styles.fieldValue}>{profile.prenom}</Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Nom</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedProfile?.nom || ""}
                  onChangeText={(value) => updateField("nom", value)}
                  placeholder="Votre nom"
                />
              ) : (
                <Text style={styles.fieldValue}>{profile.nom}</Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedProfile?.email || ""}
                  onChangeText={(value) => updateField("email", value)}
                  placeholder="votre@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              ) : (
                <Text style={styles.fieldValue}>{profile.email}</Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Téléphone</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedProfile?.telephone || ""}
                  onChangeText={(value) => updateField("telephone", value)}
                  placeholder="Votre numéro de téléphone"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.fieldValue}>{profile.telephone || "Non renseigné"}</Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Adresse</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedProfile?.adresse || ""}
                  onChangeText={(value) => updateField("adresse", value)}
                  placeholder="Votre adresse"
                  multiline
                />
              ) : (
                <Text style={styles.fieldValue}>{profile.adresse || "Non renseignée"}</Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Date de naissance</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedProfile?.dateNaissance || ""}
                  onChangeText={(value) => updateField("dateNaissance", value)}
                  placeholder="JJ/MM/AAAA"
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {profile.dateNaissance ? new Date(profile.dateNaissance).toLocaleDateString('fr-FR') : "Non renseignée"}
                </Text>
              )}
            </View>
          </View>

          {/* Paramètres et actions */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Paramètres</Text>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={20} color="#64748b" />
                <Text style={styles.settingText}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="shield-outline" size={20} color="#64748b" />
                <Text style={styles.settingText}>Confidentialité</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="help-circle-outline" size={20} color="#64748b" />
                <Text style={styles.settingText}>Aide et support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="information-circle-outline" size={20} color="#64748b" />
                <Text style={styles.settingText}>À propos</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </TouchableOpacity>
          </View>

          {/* Bouton de déconnexion */}
          <View style={styles.logoutSection}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color="#dc2626" style={{ marginRight: 8 }} />
              <Text style={styles.logoutButtonText}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>

          {/* Retour aux rendez-vous */}
          <View style={styles.backSection}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.push("/rendezvous")}
            >
              <Ionicons name="arrow-back-outline" size={18} color="#2563eb" style={{ marginRight: 8 }} />
              <Text style={styles.backButtonText}>Retour aux rendez-vous</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const colors = {
  card: "#ffffff",
  primary: "#2563eb",
  danger: "#dc2626",
  text: "#0f172a",
  subtext: "#475569",
  border: "#e2e8f0",
  fieldBorder: "#cbd5e1",
  background: "#f8fafc",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  
  loadingText: {
    fontSize: 16,
    color: colors.subtext,
  },

  header: {
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 20,
  },

  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },

  userName: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 4,
  },

  userEmail: {
    fontSize: 16,
    color: colors.subtext,
  },

  actionButtons: {
    marginBottom: 24,
  },

  editButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  editActions: {
    flexDirection: "row",
    gap: 12,
  },

  cancelButton: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },

  cancelButtonText: {
    color: colors.subtext,
    fontSize: 16,
    fontWeight: "600",
  },

  saveButton: {
    flex: 1,
    backgroundColor: "#059669",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  profileSection: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
  },

  fieldGroup: {
    marginBottom: 16,
  },

  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.subtext,
    marginBottom: 6,
  },

  fieldValue: {
    fontSize: 16,
    color: colors.text,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },

  input: {
    fontSize: 16,
    color: colors.text,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },

  settingsSection: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  settingText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
  },

  logoutSection: {
    marginBottom: 20,
  },

  logoutButton: {
    backgroundColor: "#fef2f2",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fecaca",
  },

  logoutButtonText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: "600",
  },

  backSection: {
    marginBottom: 40,
  },

  backButton: {
    backgroundColor: "#eff6ff",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dbeafe",
  },

  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});

