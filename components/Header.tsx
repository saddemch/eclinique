// components/Header.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showProfileButton?: boolean;
  onBackPress?: () => void;
  onProfilePress?: () => void;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    label?: string;
  };
}

function BrandTitle() {
  return (
    <View style={styles.brandContainer}>
      <Image
        source={require("../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.brandText}>eClinique</Text>
    </View>
  );
}

export default function Header({
  title,
  showBackButton = false,
  showProfileButton = false,
  onBackPress,
  onProfilePress,
  rightAction,
}: HeaderProps) {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      router.push("/profil");
    }
  };

  return (
    <View style={styles.header}>
      {/* Bouton retour */}
      {showBackButton && (
        <Pressable onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
      )}

      {/* Titre central */}
      <View style={styles.titleContainer}>
        {title ? (
          <Text style={styles.title}>{title}</Text>
        ) : (
          <BrandTitle />
        )}
      </View>

      {/* Actions à droite */}
      <View style={styles.rightActions}>
        {rightAction && (
          <Pressable onPress={rightAction.onPress} style={styles.actionButton}>
            <Ionicons name={rightAction.icon} size={24} color="#000" />
            {rightAction.label && (
              <Text style={styles.actionLabel}>{rightAction.label}</Text>
            )}
          </Pressable>
        )}
        
        {showProfileButton && (
          <Pressable onPress={handleProfilePress} style={styles.profileButton}>
            <Image
              source={require("../assets/images/user.webp")}
              style={styles.profileImage}
              resizeMode="cover"
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  backButton: {
    padding: 8,
    borderRadius: 8,
  },

  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },

  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    width: 26,
    height: 26,
    marginRight: 8,
  },

  brandText: {
    color: "#000",
    fontWeight: "800",
    fontSize: 18,
  },

  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  actionButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },

  actionLabel: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 2,
  },

  profileButton: {
    padding: 2,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});

