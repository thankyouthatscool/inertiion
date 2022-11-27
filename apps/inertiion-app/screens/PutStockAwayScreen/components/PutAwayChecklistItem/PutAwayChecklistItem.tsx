import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppDispatch, useAppSelector } from "@hooks";
import { addCheckedItem, removeCheckedItem } from "@store";
import type { Item } from "@store/appSlice";
import { APP_FONT_SIZE, APP_PADDING_SIZE } from "@theme/index";

interface PutAwayChecklistItemProps {
  checked?: boolean;
  item: Item;
}

export const PutAwayChecklistItem = ({
  checked = false,
  item,
}: PutAwayChecklistItemProps) => {
  const dispatch = useAppDispatch();

  const { checkedItems } = useAppSelector(({ putStockAway }) => putStockAway);

  return (
    <Pressable
      onLongPress={() => {
        console.log("This is something else entirely");
      }}
      onPress={() => {
        if (checkedItems.map((item) => item.id).includes(item.id)) {
          dispatch(removeCheckedItem(item));
        } else {
          dispatch(addCheckedItem(item));
        }
      }}
      style={({ pressed }) => [
        styles.checklistItem,
        { elevation: pressed ? 0 : 4 },
      ]}
    >
      <View>
        <Text style={{ textDecorationLine: checked ? "line-through" : "none" }}>
          {item.code} {item.description}
        </Text>
        <Text style={{ textDecorationLine: checked ? "line-through" : "none" }}>
          {item.location}
        </Text>
      </View>
      <View style={[styles.checkBox]}>
        {checkedItems.map((item) => item.id).includes(item.id) && (
          <MaterialIcons size={20} name="done" />
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  checkBox: {
    alignItems: "center",

    borderWidth: 2,

    height: 30,

    justifyContent: "center",

    width: 30,
  },
  checklistItem: {
    alignItems: "center",

    backgroundColor: "white",
    borderRadius: APP_FONT_SIZE,

    flexDirection: "row",

    justifyContent: "space-between",

    marginTop: APP_PADDING_SIZE / 2,
    marginBottom: APP_PADDING_SIZE / 2,
    marginHorizontal: APP_PADDING_SIZE,

    padding: APP_FONT_SIZE,
  },
});
