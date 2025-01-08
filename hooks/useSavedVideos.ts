import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

interface SavedVideo {
  id: number;
  uri: string;
  title: string;
  description: string;
}

const fetchSavedVideos = async (): Promise<SavedVideo[]> => {
  try {
    const savedVideos = await AsyncStorage.getItem("@SAVED_VIDEOS");
    if (savedVideos) {
      const videoList = JSON.parse(savedVideos);
      return videoList.map((video: string | SavedVideo, index: number) => {
        if (typeof video === "string") {
          // Old format (just URI)
          return {
            id: index + 1,
            uri: video,
            title: `Video ${index + 1}`,
            description: "",
          };
        }
        return {
          id: index + 1,
          uri: video.uri,
          title: video.title || `Video ${index + 1}`,
          description: video.description || "",
        };
      });
    }
    return [];
  } catch (error) {
    throw new Error("Failed to fetch videos from storage");
  }
};

export const useSavedVideos = (
  options?: UseQueryOptions<SavedVideo[], Error, SavedVideo[], ["savedVideos"]>
) => {
  return useQuery({
    queryKey: ["savedVideos"],
    queryFn: fetchSavedVideos,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    onError: (error: Error) => {
      console.error("Error fetching saved videos:", error.message);
    },
    ...options,
  });
};
