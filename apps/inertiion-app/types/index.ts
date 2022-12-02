export type Item = {
  id: string;
  code: string;
  description?: string;
  location: string;
};

export type OrderItem = {
  id: string;
  item: Item;
  quantity: number;
};

export type Order = {
  id: string;
  items: OrderItem[];
};
