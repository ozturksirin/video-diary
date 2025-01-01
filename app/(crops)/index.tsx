import React, { useState } from "react";
import { useVideoStore } from "@/store/use-video";
import { View, Text, Alert, ActivityIndicator, ScrollView } from "react-native";
import Slider from "@react-native-community/slider";
import { FFmpegKit, ReturnCode } from "ffmpeg-kit-react-native";
import * as FileSystem from "expo-file-system";
import { Video } from "expo-av";
import { Button } from "react-native-elements";

const TrimVideo = () => {
  const videoData = useVideoStore((state) => state.video);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(
    Math.floor(videoData?.duration! / 1000)
  );
  const [isTrimming, setIsTrimming] = useState(false);
  const [trimmedVideoUri, setTrimmedVideoUri] = useState<string | null>(null);

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
    console.log("FFmpeg Command:", command);

    try {
      await FFmpegKit.execute(command).then(async (session) => {
        const returnCode = await session.getReturnCode();

        if (ReturnCode.isSuccess(returnCode)) {
          console.log("FFmpeg işlemi başarıyla tamamlandı.");

          /**          const logs = await session.getLogs();
          logs.forEach((log) => console.log("FFmpeg Log:", log.message));
           */

          setTrimmedVideoUri(trimmedOutput);
          Alert.alert("Başarılı", "Video başarıyla kırpıldı.");
        } else if (ReturnCode.isCancel(returnCode)) {
          console.log("FFmpeg işlemi iptal edildi.");
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

      <View className="flex-1 p-2 bg-gray-900 items-center justify-center">
        <Text className="text-white text-lg">Start: {startTime}s</Text>
        <Slider
          style={{ width: "90%", height: 30 }}
          minimumValue={0}
          maximumValue={Math.floor(videoData?.duration! / 1000)}
          value={startTime}
          step={1}
          onValueChange={(value) => setStartTime(Math.min(value, endTime - 1))}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#d3d3d3"
        />
        <Text className="text-white text-lg">End: {endTime}s</Text>
        <Slider
          style={{ width: "90%", height: 30 }}
          minimumValue={0}
          maximumValue={Math.floor(videoData?.duration! / 1000)}
          value={endTime}
          step={1}
          onValueChange={(value) => setEndTime(Math.max(value, startTime + 1))}
          minimumTrackTintColor="#FF6347"
          maximumTrackTintColor="#d3d3d3"
        />
      </View>

      {/* Trim işlemi sırasında spinner */}
      {isTrimming && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="text-white mt-2">Trimming video...</Text>
        </View>
      )}

      {/* Trim işlemi tamamlandığında kırpılmış video */}
      {!isTrimming && trimmedVideoUri && (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="mb-4" />
          <Video
            source={{ uri: trimmedVideoUri }}
            style={{ width: "100%", height: 200 }}
            useNativeControls
          />
        </View>
      )}

      {/* Trim işlemini başlatan buton */}
      {!isTrimming && (
        <Button
          title="Trim Video"
          onPress={handleTrimVideo}
          disabled={isTrimming}
          buttonStyle={{
            backgroundColor: "#007AFF",
            padding: 10,
          }}
          titleStyle={{ color: "#fff", fontSize: 16 }}
        />
      )}
    </View>
  );
};

export default TrimVideo;
