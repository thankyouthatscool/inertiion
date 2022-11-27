import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { Item } from "@store/index";

export interface ItemState {
  catalog: Item[];
  itemToEdit: Item | undefined;
}

const initialState: ItemState = {
  catalog: [],
  itemToEdit: undefined,
};

export const itemSlice = createSlice({
  name: "item",
  initialState,
  reducers: {
    setCatalogData: (state, { payload }: PayloadAction<Item[]>) => {
      state.catalog = payload;
    },
    setItemToEdit: (state, { payload }: PayloadAction<Item>) => {
      state.itemToEdit = payload;
    },
    clearItemToEdit: (state) => {
      state.itemToEdit = undefined;
    },
  },
});

export const { setCatalogData, setItemToEdit, clearItemToEdit } =
  itemSlice.actions;
