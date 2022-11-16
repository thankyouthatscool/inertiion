import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";

import { appSlice } from "./appSlice";
import { putStockAwaySlice } from "./putStockAwaySlice";

export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
  reducer: {
    app: appSlice.reducer,
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
