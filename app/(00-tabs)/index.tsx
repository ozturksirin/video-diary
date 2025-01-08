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

interface SavedVideo {
  id: number;
  uri: string;
  title: string;
  description: string;
}

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

  const renderItem = ({ item }: { item: SavedVideo }) => (
    <TouchableOpacity
      onPress={() =>
        router.push(
          `/details/${item.id}?data=${encodeURIComponent(JSON.stringify(item))}`
        )
      }
      className="bg-gray-300 rounded-lg overflow-hidden mb-4 h-48"
    >
      <View className="flex-1">
        <Video
          source={{ uri: item.uri }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
          shouldPlay
          isLooping
          useNativeControls={false}
        />
        <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
          <Text className="text-white font-medium">{item.title}</Text>
        </View>
      </View>
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
