import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { Item } from "./appSlice";

export interface PutStockAwayState {
  checklistItems: Item[];
  selectedItems: Item[];
}

const initialState: PutStockAwayState = {
  checklistItems: [],
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
    // Checklist items
    addChecklistItem: (state, { payload }: PayloadAction<Item>) => {
      state.checklistItems = [...state.checklistItems, payload];
    },
    removeChecklistItem: (state, { payload }: PayloadAction<Item>) => {
      state.checklistItems = state.checklistItems.filter(
        (item) => item.id !== payload.id
      );
    },
    clearChecklistItems: (state) => {
      state.checklistItems = [];
    },
  },
});

export const {
  // Selected items
  addSelectedItem,
  removeSelectedItem,
  clearSelectedItems,
  // Checklist items
  addChecklistItem,
  removeChecklistItem,
  clearChecklistItems,
} = putStockAwaySlice.actions;
