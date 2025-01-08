import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

interface VideoData {
  uri: string;
  title: string;
  description: string;
}

const saveVideoToStorage = async (
  videoData: VideoData
): Promise<VideoData[]> => {
  if (!videoData.uri) {
    throw new Error("No video URI to save.");
  }
  const savedVideos = await AsyncStorage.getItem("@SAVED_VIDEOS");
  const videoList = savedVideos ? JSON.parse(savedVideos) : [];
  const updatedVideoList = [...videoList, videoData];
  await AsyncStorage.setItem("@SAVED_VIDEOS", JSON.stringify(updatedVideoList));
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
                uri: updatedVideos[updatedVideos.length - 1].uri,
                title: updatedVideos[updatedVideos.length - 1].title,
                description:
                  updatedVideos[updatedVideos.length - 1].description,
              },
            ]
          : [
              {
                id: 1,
                uri: updatedVideos[0].uri,
                title: updatedVideos[0].title,
                description: updatedVideos[0].description,
              },
            ];
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
