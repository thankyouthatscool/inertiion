import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppState } from "@types";

const initialState: AppState = {
  searchTerm: "",
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setSearchTerm: (state, { payload }: PayloadAction<string>) => {
      state.searchTerm = payload;
    },
  },
});

export const { setSearchTerm } = appSlice.actions;
