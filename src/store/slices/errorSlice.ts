import { StateCreator } from "zustand";
import { VideoErrorState, VideoState } from "../types/StoreTypes";

export const createErrorSlice: StateCreator<
  VideoState,
  [],
  [],
  VideoErrorState
> = (set) => ({
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
});

