import { create } from "zustand";
import * as ImagePicker from "expo-image-picker";

type VideoType = ImagePicker.ImagePickerAsset | null;

type VideoStore = {
  video: VideoType;
  title: string;
  description: string;
  addVideo: (video: VideoType, title: string, description: string) => void;
  removeVideo: () => void;
};

export const useVideoStore = create<VideoStore>((set) => ({
  video: null,
  title: "",
  description: "",
  addVideo: (video: VideoType, title: string, description: string) =>
    set({ video, title, description }),
  removeVideo: () =>
    set({
      video: null,
      title: "",
      description: "",
    }),
}));
