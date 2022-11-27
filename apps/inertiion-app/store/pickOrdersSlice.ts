import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface OrderItem {
  itemCode: string;
  location: string;
  quantity: number;
}

export interface Order {
  orderId: string;
  orderItems: OrderItem[];
}

export interface PickOrdersState {
  orders: Order[];
}

const initialState: PickOrdersState = {
  orders: [],
};

export const addOrder = createAsyncThunk(
  "orders/addOrder",
  async (newOrder: Order) => {
    const orderData = await AsyncStorage.getItem("orders");

    if (orderData) {
      const orders: Order[] = JSON.parse(orderData!);

      await AsyncStorage.setItem(
        "orders",
        JSON.stringify([...orders, newOrder])
      );
    } else {
      await AsyncStorage.setItem("orders", JSON.stringify([newOrder]));
    }

    return newOrder;
  }
);

export const removeOrder = createAsyncThunk(
  "orders/removeOrder",
  async (removedOrder: Order) => {
    const orderData = await AsyncStorage.getItem("orders");

    if (orderData) {
      const orders: Order[] = JSON.parse(orderData!);

      await AsyncStorage.setItem(
        "orders",
        JSON.stringify([
          ...orders.filter((order) => order.orderId !== removedOrder.orderId),
        ])
      );
    } else {
      await AsyncStorage.setItem("orders", JSON.stringify([]));
    }

    return removedOrder;
  }
);

export const pickOrdersSlice = createSlice({
  name: "pickOrders",
  initialState,
  reducers: {
    setOrders: (state, { payload }: PayloadAction<Order[]>) => {
      state.orders = payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addOrder.fulfilled, (state, { payload }) => {
      state.orders = [...state.orders, payload];
    });
    builder.addCase(removeOrder.fulfilled, (state, { payload }) => {
      state.orders = state.orders.filter(
        (order) => order.orderId !== payload.orderId
      );
    });
  },
});

export const { setOrders } = pickOrdersSlice.actions;
