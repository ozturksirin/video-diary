import { useLocalSearchParams } from "expo-router";
import { View, Text, SafeAreaView, ScrollView } from "react-native";
import { Video } from "expo-av";

export default function VideoDetails() {
  const { data } = useLocalSearchParams();
  const item = data ? JSON.parse(decodeURIComponent(data as any)) : null;

  if (!item) {
    return (
      <View className="flex-1 bg-gray-100 justify-center items-center">
        <Text className="text-xl font-bold text-gray-800">
          Video not found!
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="h-2/3 w-full bg-black">
        <Video
          source={{ uri: item.uri }}
          className="w-full h-full"
          style={{ width: "100%", height: "100%" }}
          useNativeControls
          resizeMode="contain"
          shouldPlay
        />
      </View>
      <ScrollView className="flex-1 px-4 py-6">
        <View className="space-y-4">
          <View className="space-y-2">
            <Text className="text-sm text-gray-500">Title</Text>
            <Text className="text-xl font-semibold text-gray-800">
              {item.title || "Untitled"}
            </Text>
          </View>

          <View className="space-y-2">
            <Text className="text-sm text-gray-500">Description</Text>
            <Text className="text-base text-gray-700">
              {item.description || "No description available"}
            </Text>
          </View>

          <View className="space-y-2">
            <Text className="text-sm text-gray-500">Video ID</Text>
            <Text className="text-base text-gray-700">{item.id}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
