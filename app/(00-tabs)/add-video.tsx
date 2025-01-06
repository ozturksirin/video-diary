import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  View,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";
import { useVideoStore } from "@/store/use-video";
import { useRouter } from "expo-router";

type VideoType = ImagePicker.ImagePickerAsset | null;

export default function AddVideo() {
  const router = useRouter();

  const addVideo = useVideoStore((state) => state.addVideo);
  const [video, setVideo] = useState<VideoType | null>(null);
  const [input, setInput] = useState({
    title: "",
    description: "",
    errors: {
      title: false,
      description: false,
    },
  });

  const handleVideoUpload = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Media library access is required to upload videos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const selectedVideo = result.assets[0];
        setVideo(selectedVideo);
      } else {
        console.log("Video selection was canceled.");
      }
    } catch (error) {
      console.error("Error selecting video:", error);
    }
  };

  const handleZustandAddVideo = () => {
    const hasErrors = {
      title: input.title.trim() === "",
      description: input.description.trim() === "",
    };

    setInput((prev) => ({
      ...prev,
      errors: hasErrors,
    }));

    if (hasErrors.title || hasErrors.description) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }

    addVideo(video, input.title, input.description); // Store'a videoyu, başlığı ve açıklamayı ekle
    console.log("Video added to Zustand Store:", {
      video: video,
      title: input.title,
      description: input.description,
    });
    router.navigate("/(crops)");
    setVideo(null);
    setInput({
      title: "",
      description: "",
      errors: { title: false, description: false },
    });
  };

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-gray-100">
      <TouchableOpacity
        className="w-80 h-40 justify-center items-center bg-white border-2 border-dashed border-gray-400 rounded-lg"
        onPress={handleVideoUpload}
      >
        <MaterialIcons name="add" size={40} color="#555" />
        <Text className="mt-4 text-lg font-bold text-gray-600">
          {video ? "Change Video" : "Add Video"}
        </Text>
      </TouchableOpacity>

      {video && (
        <>
          <View className="mt-6 w-80 h-60">
            <Video
              source={{ uri: video.uri }}
              style={{ width: "100%", height: "100%", borderRadius: 10 }}
              useNativeControls
              isLooping
            />
            <Text className="mt-2 text-center text-gray-600">
              Preview selected Video
            </Text>
          </View>

          <TouchableOpacity onPress={handleZustandAddVideo}>
            <Text className="mt-6 text-blue-500 font-bold text-lg">
              Crop Video
            </Text>
          </TouchableOpacity>

          <TextInput
            className={`w-80 h-12 mt-4 px-4 bg-white border-2 ${
              input.errors.title ? "border-red-500" : "border-gray-400"
            } rounded-lg`}
            placeholder="Video Title"
            value={input.title}
            onChangeText={(text) =>
              setInput((prev) => ({
                ...prev,
                title: text,
                errors: { ...prev.errors, title: false },
              }))
            }
          />
          {input.errors.title && (
            <Text className="text-red-500 text-sm mt-1">
              This field is required.
            </Text>
          )}

          <TextInput
            className={`w-80 h-12 mt-4 px-4 bg-white border-2 ${
              input.errors.description ? "border-red-500" : "border-gray-400"
            } rounded-lg`}
            placeholder="Video Description"
            multiline
            numberOfLines={3}
            value={input.description}
            onChangeText={(text) =>
              setInput((prev) => ({
                ...prev,
                description: text,
                errors: { ...prev.errors, description: false },
              }))
            }
          />
          {input.errors.description && (
            <Text className="text-red-500 text-sm mt-1">
              This field is required.
            </Text>
          )}
        </>
      )}
    </SafeAreaView>
  );
}
