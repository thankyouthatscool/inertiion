import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { Item } from "./appSlice";

export interface PutStockAwayState {
  checkedItems: Item[];
  selectedItems: Item[];
}

const initialState: PutStockAwayState = {
  checkedItems: [],
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
    // Checked items
    addCheckedItem: (state, { payload }: PayloadAction<Item>) => {
      state.checkedItems = [...state.checkedItems, payload];
    },
    removeCheckedItem: (state, { payload }: PayloadAction<Item>) => {
      state.checkedItems = state.checkedItems.filter(
        (item) => item.id !== payload.id
      );
    },
    clearCheckedItems: (state) => {
      state.checkedItems = [];
    },
  },
});

export const {
  // Selected item
  addSelectedItem,
  removeSelectedItem,
  clearSelectedItems,
  // Checked items
  addCheckedItem,
  removeCheckedItem,
  clearCheckedItems,
} = putStockAwaySlice.actions;
