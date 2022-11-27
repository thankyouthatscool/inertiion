import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { FromLocation } from "../types";

export type Item = {
  id: string;
  code: string;
  description?: string;
  location: string;
};

export interface AppState {
  apiStatus: boolean | undefined;
  customApiUrl: string | null;
  returnLocation: FromLocation | undefined;
  searchResult: Item[];
  searchTerm: string;
}

const initialState: AppState = {
  apiStatus: undefined,
  customApiUrl: null,
  returnLocation: undefined,
  searchResult: [],
  searchTerm: "",
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    // Api
    setApiStatus: (state, { payload }: PayloadAction<boolean>) => {
      state.apiStatus = payload;
    },
    setCustomApiUrl: (state, { payload }: PayloadAction<string>) => {
      state.customApiUrl = payload;
    },
    // Search result
    clearSearchResult: (state) => {
      state.searchResult = [];
    },
    setSearchResult: (state, { payload }: PayloadAction<Item[]>) => {
      state.searchResult = payload;
    },
    // Search term
    clearSearchTerm: (state) => {
      state.searchTerm = "";
    },
    setSearchTerm: (state, { payload }: PayloadAction<string>) => {
      state.searchTerm = payload;
    },
    // Return location
    setReturnLocation: (
      state,
      { payload }: PayloadAction<FromLocation | undefined>
    ) => {
      state.returnLocation = payload;
    },
    clearReturnLocation: (state) => {
      state.returnLocation = undefined;
    },
  },
});

export const {
  // Api
  setApiStatus,
  setCustomApiUrl,
  //Search result
  clearSearchResult,
  setSearchResult,
  // Search term
  clearSearchTerm,
  setSearchTerm,
  // Return location
  setReturnLocation,
  clearReturnLocation,
} = appSlice.actions;
