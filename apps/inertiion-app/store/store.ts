import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";

import { appSlice } from "./appSlice";
import { itemSlice } from "./itemSlice";
import { pickOrdersSlice } from "./pickOrdersSlice";
import { putStockAwaySlice } from "./putStockAwaySlice";

export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
  reducer: {
    app: appSlice.reducer,
    item: itemSlice.reducer,
    pickOrders: pickOrdersSlice.reducer,
    putStockAway: putStockAwaySlice.reducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
