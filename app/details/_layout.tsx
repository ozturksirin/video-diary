import { Stack } from "expo-router";

export default function DetailsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Detay sayfasında başlık göstermek istiyorsanız
      }}
    />
  );
}