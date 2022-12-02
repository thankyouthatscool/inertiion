import {
  ItemCode,
  ItemDescription,
  ItemId,
  ItemLocation,
  OrderId,
  OrderItemId,
  OrderItemQuantity,
} from "./primitives";

export * from "./primitives";
export * from "./router";

export type Item = {
  id: ItemId;
  code: ItemCode;
  description?: ItemDescription;
  location: ItemLocation;
};

export type OrderItem = {
  id: OrderItemId;
  item: Item;
  quantity: OrderItemQuantity;
};

export type Order = {
  id: OrderId;
  items: OrderItem[];
};

export type AppState = {
  searchTerm: string;
};
