import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { Video } from "expo-av";
import { Button } from "react-native-elements";
import { useVideoStore } from "@/store/use-video";
import { FFmpegKit, ReturnCode } from "ffmpeg-kit-react-native";
import * as FileSystem from "expo-file-system";

const TrimVideo = () => {
  const videoData = useVideoStore((state) => state.video);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(
    Math.floor((videoData?.duration ?? 0) / 1000)
  );
  const [isTrimming, setIsTrimming] = useState(false);
  const [trimmedVideoUri, setTrimmedVideoUri] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [selectedPoints, setSelectedPoints] = useState<number[]>([]);

  useEffect(() => {
    generateThumbnails();
  }, [videoData]);

  const generateThumbnails = async () => {
    if (!videoData?.uri) {
      console.error("Video URI is missing.");
      return;
    }

    console.log("Starting thumbnail generation...");
    const localUri = videoData.uri.replace("file://", "");
    const thumbnailDir = `${FileSystem.cacheDirectory}thumbnails/`;

    try {
      console.log("Clearing old thumbnails...");
      await FileSystem.deleteAsync(thumbnailDir, { idempotent: true });
      await FileSystem.makeDirectoryAsync(thumbnailDir, {
        intermediates: true,
      });
      console.log("Thumbnail directory created at:", thumbnailDir);

      const duration = Math.ceil(videoData.duration! / 1000);
      console.log("Video duration (seconds):", duration);

      const thumbnailPaths = [];
      for (let i = 0; i < duration; i++) {
        const output = `${thumbnailDir}thumb_${i}.jpg`;
        const command = `-y -ss ${i} -i "${localUri}" -vframes 1 -q:v 2 "${output}"`;

        console.log(
          `Generating thumbnail for second ${i}: Command: ${command}`
        );

        try {
          const session = await FFmpegKit.execute(command);
          const returnCode = await session.getReturnCode();

          if (returnCode.isValueSuccess()) {
            const info = await FileSystem.getInfoAsync(output);
            if (info.exists) {
              console.log(`Thumbnail successfully generated: ${output}`);
              thumbnailPaths.push(output);
            } else {
              console.warn(
                `Thumbnail file not found after execution: ${output}`
              );
            }
          } else {
            console.error(
              `FFmpeg failed for second ${i} with return code:`,
              returnCode
            );
            const logs = await session.getLogs();
            console.error(`FFmpeg logs for second ${i}:`, logs);
          }

          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error generating thumbnail for second ${i}:`, error);
        }
      }

      console.log("Thumbnail generation completed");
      console.log("Generated valid thumbnails:", thumbnailPaths);

      setThumbnails(thumbnailPaths);
    } catch (error) {
      console.error("Thumbnail Generation Error:", error);
    }
  };

  const handleTrimVideo = async (startTime: number, endTime: number) => {
    setIsTrimming(true);
    const trimmedOutput = `${FileSystem.cacheDirectory}trimmed_video.mp4`;

    const localUri = videoData?.uri.replace("file://", "");
    const localOutput = trimmedOutput.replace("file://", "");

    // Zamanı HH:MM:SS formatına dönüştüren fonksiyon
    const formatTime = (timeInSeconds: number) => {
      const hours = Math.floor(timeInSeconds / 3600);
      const minutes = Math.floor((timeInSeconds % 3600) / 60);
      const seconds = timeInSeconds % 60;
      return [hours, minutes, seconds]
        .map((v) => String(v).padStart(2, "0")) // Her değeri iki haneli yapar
        .join(":");
    };

    const startTimeFormatted = formatTime(startTime); // Kullanıcı başlangıç zamanı
    const duration = endTime - startTime; // Süreyi hesapla
    const durationFormatted = formatTime(duration); // Süreyi formatla

    // Dinamik olarak süreler dahil edilmiş FFmpeg komutu
    const command = `-y -ss ${startTimeFormatted} -i "${localUri}" -t ${durationFormatted} -c copy "${localOutput}"`;

    try {
      await FFmpegKit.execute(command).then(async (session) => {
        const returnCode = await session.getReturnCode();

        if (ReturnCode.isSuccess(returnCode)) {
          const logs = await session.getLogs();
          //logs.forEach((log) => console.log("FFmpeg Log:", log.message));

          setTrimmedVideoUri(trimmedOutput);
          setSelectedPoints([]);
          Alert.alert(
            "Success",
            "Video trimmed successfully. Select new points to trim again."
          );
        } else if (ReturnCode.isCancel(returnCode)) {
          Alert.alert("Cancelled", "Video trimming was cancelled.");
        } else {
          console.error("FFmpeg process failed. Code:", returnCode);
          Alert.alert("Error", "FFmpeg process failed.");
        }
      });
    } catch (error) {
      Alert.alert("Error", "An error occurred while trimming the video.");
      console.error("FFmpeg error:", error);
    } finally {
      setIsTrimming(false);
    }
  };
  return (
    <View className="flex-1 bg-black">
      <Video
        source={{ uri: videoData?.uri || "" }}
        style={{ flex: 2, width: "100%" }}
        useNativeControls
      />

      <View className=" bg-gray-900 p-4">
        <Text className="text-white mb-2">
          {selectedPoints.length === 2
            ? "Ready to trim"
            : selectedPoints.length === 1
            ? "Select end point"
            : "Select start point"}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="bg-gray-800 rounded-lg py-2 px-4"
        >
          {thumbnails.map((thumbnail, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                if (selectedPoints.length === 0) {
                  setSelectedPoints([index]);
                } else if (selectedPoints.length === 1) {
                  const start = Math.min(selectedPoints[0], index);
                  const end = Math.max(selectedPoints[0], index);
                  setSelectedPoints([start, end]);
                } else {
                  setSelectedPoints([index]);
                }
              }}
              className={`w-16 h-16 m-1 rounded-md flex items-center justify-center ${
                selectedPoints.length === 2 &&
                index >= Math.min(...selectedPoints) &&
                index <= Math.max(...selectedPoints)
                  ? "border-2 border-blue-500"
                  : selectedPoints.includes(index)
                  ? "border-2 border-green-500"
                  : "border-2 border-gray-600"
              }`}
            >
              <Image
                source={{ uri: thumbnail }}
                className="w-16 h-16 rounded-md"
                onError={(e) =>
                  console.error(`Failed to load thumbnail at index ${index}`, e)
                }
              />
              <Text className="text-white text-xs">{index}s</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View className="flex-row justify-between mt-4">
          <Text className="text-white">Start: {startTime}s</Text>
          <Text className="text-white">End: {endTime}s</Text>
        </View>
      </View>

      {selectedPoints.length === 2 && (
        <Button
          title={`Trim ${Math.min(...selectedPoints)}s - ${Math.max(
            ...selectedPoints
          )}s`}
          onPress={() => {
            const startTime = Math.min(...selectedPoints);
            const endTime = Math.max(...selectedPoints);
            handleTrimVideo(startTime, endTime);
          }}
          buttonStyle={{
            backgroundColor: "#007AFF",
            padding: 10,
            marginTop: 10,
          }}
          titleStyle={{ color: "#fff", fontSize: 16 }}
        />
      )}

      {isTrimming && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center">
          <Text className="text-white">Trimming Video...</Text>
        </View>
      )}

      {!isTrimming && trimmedVideoUri && (
        <View className="flex-2 p-4">
          <Text className="text-white mb-2">
            Trimmed Video{" "}
            {selectedPoints.length > 0
              ? "(Select new points to trim again)"
              : ""}
            :
          </Text>
          <Video
            source={{ uri: trimmedVideoUri }}
            style={{ width: "100%", height: 200 }}
            useNativeControls
          />
        </View>
      )}
    </View>
  );
};

export default TrimVideo;
