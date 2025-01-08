import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Video } from "expo-av";
import { useSavedVideos } from "@/hooks/useSavedVideos";
import { router } from "expo-router";

export default function HomeScreen() {
  const { data: savedVideos, isLoading, isError } = useSavedVideos();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>;
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Error loading videos!</Text>;
      </View>
    );
  }

  if (!savedVideos?.length) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-center justify-center">
          No saved videos found!
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: { id: number; uri: string } }) => (
    <TouchableOpacity
      onPress={() =>
        router.push(
          `/details/${item.id}?data=${encodeURIComponent(JSON.stringify(item))}`
        )
      }
      className="bg-gray-300 rounded-lg overflow-hidden mb-4 h-48"
    >
      <Video
        source={{ uri: item.uri }}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
        shouldPlay
        isLooping
        useNativeControls={false}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Text className="text-2xl font-bold text-center mt-4 mb-4">
        Croped Videos
      </Text>
      <ScrollView className="px-4">
        <FlatList
          data={savedVideos}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
