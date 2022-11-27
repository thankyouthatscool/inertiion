import { Pressable, Text } from "react-native";

import type { DrawerNavigationProp } from "@react-navigation/drawer";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useAppSelector } from "@hooks/index";
import type { Item } from "@store/index";
import { APP_FONT_SIZE, APP_PADDING_SIZE } from "@theme/index";

import type { PutStockAwayProps } from "@screens/PutStockAwayScreen";
import type { RootNavigator } from "../../../App";

interface SearchResultItem {
  item: Item;
  index: number;
  navigation: CompositeNavigationProp<
    NativeStackNavigationProp<PutStockAwayProps, "SelectItems">,
    DrawerNavigationProp<RootNavigator, keyof RootNavigator>
  >;
  onPress: () => void;
  onLongPress: () => void;
  selected: boolean;
}

export const SearchResultItem = ({
  item,
  index,
  navigation,
  onPress,
  onLongPress,
  selected,
}: SearchResultItem) => {
  const { searchResult } = useAppSelector(({ app }) => app);

  return (
    <Pressable
      onLongPress={() => {
        onLongPress();
      }}
      onPress={() => {
        onPress();
      }}
      style={({ pressed }) => ({
        backgroundColor: "white",
        borderRadius: APP_FONT_SIZE,

        borderColor: selected ? "orange" : "white",
        borderWidth: 2,

        elevation: pressed ? 0 : 2,

        marginHorizontal: APP_PADDING_SIZE,
        marginTop: index === 0 ? 0 : APP_PADDING_SIZE,
        marginBottom:
          index === searchResult.length - 1
            ? APP_PADDING_SIZE
            : APP_PADDING_SIZE / 2,

        padding: APP_FONT_SIZE,
      })}
    >
      <Text>{item.code}</Text>
      <Text>{item.description}</Text>
      <Text>{item.location}</Text>
    </Pressable>
  );
};
