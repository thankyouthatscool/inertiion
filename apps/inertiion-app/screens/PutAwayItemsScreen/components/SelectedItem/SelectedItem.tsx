import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Nav } from "../../PutAwayItemsScreen";
import {
  addChecklistItem,
  Item,
  removeChecklistItem,
  useAppDispatch,
  useAppSelector,
} from "../../../../store";
import { APP_FONT_SIZE, APP_PADDING } from "../../../../theme";

export const SelectedItem = ({
  item,
  navigation,
}: {
  item: Item;
  navigation: Nav;
}) => {
  const dispatch = useAppDispatch();

  const { checklistItems } = useAppSelector(({ putStockAway }) => putStockAway);

  const [isCheckboxPressed, setIsCheckboxPressed] = useState<boolean>(false);

  return (
    <Pressable
      onPress={() => navigation.navigate("EditItemScreen", { item })}
      style={({ pressed }) => [
        styles.selectedItem,
        {
          backgroundColor: checklistItems
            .map((item) => item.id)
            .includes(item.id)
            ? "grey"
            : "white",
          elevation: pressed || isCheckboxPressed ? 1 : 4,
        },
      ]}
    >
      <View>
        <Text
          style={[
            styles.selectedItemDescription,
            {
              textDecorationLine: checklistItems
                .map((item) => item.id)
                .includes(item.id)
                ? "line-through"
                : "none",
            },
          ]}
        >
          {item.code} {item.description}
        </Text>
        {!checklistItems.map((item) => item.id).includes(item.id) && (
          <ItemLocationText
            isChecked={checklistItems.map((item) => item.id).includes(item.id)}
            location={item.location}
          />
        )}
      </View>
      <View>
        <Pressable
          onPress={() => {
            if (!checklistItems.map((item) => item.id).includes(item.id)) {
              dispatch(addChecklistItem(item));
            } else {
              dispatch(removeChecklistItem(item));
            }
          }}
          onPressIn={() => setIsCheckboxPressed(() => true)}
          onPressOut={() => setIsCheckboxPressed(() => false)}
        >
          {checklistItems.map((item) => item.id).includes(item.id) ? (
            <MaterialIcons name="check-box" size={APP_FONT_SIZE * 2.5} />
          ) : (
            <MaterialIcons
              name="check-box-outline-blank"
              size={APP_FONT_SIZE * 2.5}
            />
          )}
        </Pressable>
      </View>
    </Pressable>
  );
};

const ItemLocationText = ({
  isChecked,
  location,
}: {
  isChecked: boolean;
  location: string;
}) => {
  let locationText: string[] = [];

  if (location.includes("Bay")) {
    locationText.push(`Bay ${location.slice(3)}`);
  } else if (location.includes("FLEXFIT")) {
    locationText.push(`FLEXFIT`);
  } else {
    locationText.push(`Warehouse: ${location.slice(0, 1)}`);
    locationText.push(`Level: ${location.slice(1, 2)}`);
    locationText.push(`Isle: ${location.slice(2)}`);
  }

  return (
    <View>
      {locationText.map((location, index) => {
        return (
          <Text
            key={`${location} - ${index}`}
            style={{
              textDecorationLine: isChecked ? "line-through" : "none",
            }}
          >
            {location}
          </Text>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  selectedItem: {
    alignItems: "center",

    backgroundColor: "white",
    borderRadius: APP_PADDING,

    flexDirection: "row",

    justifyContent: "space-between",

    marginHorizontal: APP_PADDING,
    marginVertical: APP_PADDING / 2,

    padding: APP_PADDING,
  },
  selectedItemDescription: {
    fontSize: APP_FONT_SIZE,
    fontWeight: "bold",
  },
});
