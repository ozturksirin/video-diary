import { Redirect, Stack } from "expo-router";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated"; // Animasyon desteği
import "../global.css"; // Global CSS için NativeWind desteği
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useColorScheme } from "@/hooks/useColorScheme";

// SplashScreen'i gizlemeden önce bekler
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  // Tema seçimi (dark/light)
  const colorScheme = useColorScheme();

  // Font yükleme
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Fontlar yüklendiğinde SplashScreen'i gizler
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Fontlar yüklenmediğinde boş bir ekran döner
  if (!loaded) {
    return null;
  }
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={queryClient}>
        <Stack>
          <Stack.Screen name="(00-tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="(crops)"
            options={{
              headerShown: true,
              title: "Crop Video", // Başlık
              headerBackTitle: "Geri", //
            }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
