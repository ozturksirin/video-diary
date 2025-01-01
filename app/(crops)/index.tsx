import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { useVideoStore } from "@/store/use-video";

const CropVideo = () => {
  const video = useVideoStore((state) => state.video);
  const title = useVideoStore((state) => state.title);
  const description = useVideoStore((state) => state.description);

  useEffect(() => {
    console.log("Video changed", video);
    console.log("Title changed", title);
    console.log("Description changed", description);
  }, []); // Bu veriler değiştiğinde tetiklenir

  return (
    <View>
      <Text>Crop Video</Text>
      {video && <Text>Video URI: {video.uri}</Text>}
    </View>
  );
};
export default CropVideo;
