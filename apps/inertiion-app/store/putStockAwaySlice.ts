import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { Item } from "./appSlice";

export interface PutStockAwayState {
  selectedItems: Item[];
}

const initialState: PutStockAwayState = {
  selectedItems: [],
};

export const putStockAwaySlice = createSlice({
  name: "putStockAway",
  initialState,
  reducers: {
    // Selected items
    addSelectedItem: (state, { payload }: PayloadAction<Item>) => {
      state.selectedItems = [...state.selectedItems, payload];
    },
    removeSelectedItem: (state, { payload }: PayloadAction<Item>) => {
      state.selectedItems = state.selectedItems.filter(
        (item) => item.id !== payload.id
      );
    },
    clearSelectedItems: (state) => {
      state.selectedItems = [];
    },
  },
});

export const {
  // Selected items
  addSelectedItem,
  removeSelectedItem,
  clearSelectedItems,
} = putStockAwaySlice.actions;
