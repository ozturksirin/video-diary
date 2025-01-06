import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

// AsyncStorage'den videoları getiren fonksiyon
const fetchSavedVideos = async (): Promise<{ id: number; uri: string }[]> => {
  try {
    const savedVideos = await AsyncStorage.getItem("@SAVED_VIDEOS");
    if (savedVideos) {
      const videoList = JSON.parse(savedVideos);
      return videoList.map((uri: string, index: number) => ({
        id: index + 1,
        uri,
      }));
    }
    return [];
  } catch (error) {
    throw new Error("Failed to fetch videos from storage");
  }
};
export const useSavedVideos = (
  options?: UseQueryOptions<
    { id: number; uri: string }[], // Verinin tipi
    Error, // Hata tipi
    { id: number; uri: string }[], // Seçici fonksiyon varsa dönen tip
    ["savedVideos"] // Query Key'in tipi
  >
) => {
  return useQuery({
    queryKey: ["savedVideos"], // Query Key
    queryFn: fetchSavedVideos, // Fetch fonksiyonu
    staleTime: 1000 * 60 * 5, // Cache'in 5 dakika boyunca taze kalmasını sağlar
    cacheTime: 1000 * 60 * 10, // Cache'deki veriyi 10 dakika saklar
    onError: (error: Error) => {
      console.error("Error fetching saved videos:", error.message);
    },
    ...options, // Dışarıdan sağlanan ek seçenekler
  });
};
