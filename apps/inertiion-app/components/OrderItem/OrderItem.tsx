import { Text, View } from "react-native";

import type { OrderItem as OrderItemType } from "@store/pickOrdersSlice";
import { APP_FONT_SIZE } from "@theme";

const parseItemLocation = (itemLocation: string) => {
  const itemLocationWords = itemLocation.split(" ");

  const relevantItemLocationWords = itemLocationWords.filter((word) =>
    /\d{1,2}[A-Za-z]{0,1}[A-Za-z]{1,2}\d{2}/i.test(word.replace(/0/gi, "O"))
  );

  return relevantItemLocationWords.join(" ");
};

export const OrderItem = ({ orderItem }: { orderItem: OrderItemType }) => {
  return (
    <View>
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        <View
          style={{
            marginRight: APP_FONT_SIZE,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>
            {orderItem.quantity.toString().padEnd(3, "\t")}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text>{orderItem.itemCode}</Text>
        </View>
        <View>
          <Text>{parseItemLocation(orderItem.location)}</Text>
        </View>
      </View>
    </View>
  );
};
