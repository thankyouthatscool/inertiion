import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Item = {
  id: string;
  code: string;
  description?: string;
  location: string;
};

export interface AppState {
  customApiUrl: string | null;
  searchResult: Item[];
  searchTerm: string;
}

const initialState: AppState = {
  customApiUrl: null,
  searchResult: [],
  searchTerm: "",
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setCustomApiUrl: (state, { payload }: PayloadAction<string>) => {
      state.customApiUrl = payload;
    },
    setSearchResult: (state, { payload }: PayloadAction<Item[]>) => {
      state.searchResult = payload;
    },
    setSearchTerm: (state, { payload }: PayloadAction<string>) => {
      state.searchTerm = payload;
    },
  },
});

export const { setCustomApiUrl, setSearchResult, setSearchTerm } =
  appSlice.actions;
