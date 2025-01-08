import { useLocalSearchParams } from "expo-router";
import { View, Text, SafeAreaView } from "react-native";
import { Video } from "expo-av";

export default function VideoDetails() {
  const { data } = useLocalSearchParams();
  const item = data ? JSON.parse(decodeURIComponent(data as any)) : null;

  console.log(data);
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
    <SafeAreaView className="flex-1 bg-gray-100 px-4 py-6">
      <Video
        source={{ uri: item.uri }}
        className="w-full h-64 rounded-lg mb-6"
        style={{ width: "100%", height: "100%" }}
        useNativeControls
        resizeMode="contain"
        shouldPlay
      />
      <Text className="text-lg font-medium text-gray-700">
        Video ID: {item.id}
      </Text>
    </SafeAreaView>
  );
}
