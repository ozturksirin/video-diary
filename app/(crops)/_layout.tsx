import { Stack } from "expo-router";

export default function CropLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#f3f3f3" },
        headerTintColor: "#333",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Crop Video", // Başlık
          headerShown: false, // Header'ı göster
        }}
      />
    </Stack>
  );
}
