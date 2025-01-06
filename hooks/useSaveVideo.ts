import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
const saveVideoToStorage = async (
  trimmedVideoUri: string
): Promise<string[]> => {
  if (!trimmedVideoUri) {
    throw new Error("No video URI to save.");
  }

  // AsyncStorage'den mevcut videoları al
  const savedVideos = await AsyncStorage.getItem("@SAVED_VIDEOS");
  const videoList = savedVideos ? JSON.parse(savedVideos) : [];

  // Yeni video URI'sini listeye ekle
  const updatedVideoList = [...videoList, trimmedVideoUri];

  // AsyncStorage'e güncellenmiş listeyi kaydet
  await AsyncStorage.setItem("@SAVED_VIDEOS", JSON.stringify(updatedVideoList));

  // Güncellenmiş video listesini döndür
  return updatedVideoList;
};

export const useSaveVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveVideoToStorage,
    onSuccess: (updatedVideos) => {
      queryClient.setQueryData(["savedVideos"], (oldVideos: any) => {
        const mergedVideos = oldVideos
          ? [
              ...oldVideos,
              {
                id: oldVideos.length + 1,
                uri: updatedVideos[updatedVideos.length - 1],
              },
            ]
          : [{ id: 1, uri: updatedVideos[0] }];
        console.log("Updated cache videos:", mergedVideos);
        return mergedVideos;
      });

      Alert.alert("Success", "Video saved successfully!", [
        {
          text: "OK",
          onPress: () => router.push("/(00-tabs)"),
        },
      ]);
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to save video.");
    },
  });
};
