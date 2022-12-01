import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface OrderItem {
  id: string;
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
  selectedOrders: Order[];
  checkedOrderItems: OrderItem[];
  selectedOrder: Order | null;
}

const initialState: PickOrdersState = {
  orders: [],
  selectedOrders: [],
  checkedOrderItems: [],
  selectedOrder: null,
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
    // Orders
    setOrders: (state, { payload }: PayloadAction<Order[]>) => {
      state.orders = payload;
    },

    // Selected orders
    setSelectedOrders: (state, { payload }: PayloadAction<Order[]>) => {
      state.selectedOrders = payload;
    },
    clearSelectedOrders: (state) => {
      state.selectedOrders = [];
    },

    //Checked order item
    addCheckedOrderItem: (state, { payload }: PayloadAction<OrderItem>) => {
      state.checkedOrderItems = [...state.checkedOrderItems, payload];
    },
    removeCheckedOrderItem: (state, { payload }: PayloadAction<OrderItem>) => {
      state.checkedOrderItems = state.checkedOrderItems.filter(
        (item) => item.id !== payload.id
      );
    },

    // Selected order - for editing
    setSelectedOrder: (state, { payload }: PayloadAction<Order>) => {
      state.selectedOrder = payload;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
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

export const {
  // Orders
  setOrders,

  // Selected orders
  setSelectedOrders,
  clearSelectedOrders,

  //Checked order item
  addCheckedOrderItem,
  removeCheckedOrderItem,

  // Selected order - for edition
  setSelectedOrder,
  clearSelectedOrder,
} = pickOrdersSlice.actions;
