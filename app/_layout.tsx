// app/_layout.tsx
import { Stack } from "expo-router";
import { Image, Platform, Text, View } from "react-native";

function BrandTitle() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Image
        source={require("../assets/images/logo.png")} // logo.png dans /assets/images
        style={{ width: 26, height: 26, marginRight: 8 }}
        resizeMode="contain"
      />
      <Text style={{ color: "#000", fontWeight: "800", fontSize: 18 }}>
        eClinique
      </Text>
    </View>
  );
}

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerTitle: () => <BrandTitle />,
        headerTitleAlign: Platform.select({ ios: "center", android: "left" }),
        headerTintColor: "#000", // flèche et icônes en noir
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#fff" }, // fond header blanc
        contentStyle: { backgroundColor: "#f2f2f2" }, // fond gris clair du body
      }}
    />
  );
}
