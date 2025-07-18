// app/_layout.tsx
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#0ea5e9" }, // bleu clair
        headerTintColor: "white",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    />
  );
}
