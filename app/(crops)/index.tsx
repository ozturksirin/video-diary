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

  const handleTrimVideo = async () => {
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
          /**          const logs = await session.getLogs();
          logs.forEach((log) => console.log("FFmpeg Log:", log.message));
           */

          setTrimmedVideoUri(trimmedOutput);
          Alert.alert("Başarılı", "Video başarıyla kırpıldı.");
        } else if (ReturnCode.isCancel(returnCode)) {
          Alert.alert("İptal", "Video kırpma işlemi iptal edildi.");
        } else {
          console.error("FFmpeg işlemi başarısız oldu. Kod:", returnCode);
          Alert.alert("Hata", "FFmpeg işlemi başarısız oldu.");
        }
      });
    } catch (error) {
      Alert.alert("Error", "An error occurred during video trimming.");
      console.error("FFmpeg error:", error);
    } finally {
      setIsTrimming(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <Video
        source={{ uri: videoData?.uri || "" }}
        style={{ flex: 3, width: "100%" }}
        useNativeControls
      />

      <View className="flex-1 bg-gray-900 p-4">
        <Text className="text-white mb-2">Select Start and End Time</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="bg-gray-800 rounded-lg py-2 px-4"
        >
          {thumbnails.map((thumbnail, index) => (
            <TouchableOpacity
              key={index}
              onPress={() =>
                index < endTime ? setStartTime(index) : setEndTime(index)
              }
              className={`w-16 h-16 m-1 rounded-md flex items-center justify-center ${
                index >= startTime && index <= endTime
                  ? "border-2 border-blue-500"
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

      {isTrimming && (
        <View className="flex-1 justify-center items-center">
          <Text className="text-white">Trimming Video...</Text>
        </View>
      )}

      {!isTrimming && (
        <Button
          title="Trim Video"
          onPress={handleTrimVideo}
          buttonStyle={{
            backgroundColor: "#007AFF",
            padding: 10,
          }}
          titleStyle={{ color: "#fff", fontSize: 16 }}
        />
      )}

      {!isTrimming && trimmedVideoUri && (
        <View className="flex-2 p-4">
          <Text className="text-white mb-2">Trimmed Video:</Text>
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
