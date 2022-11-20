import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import type {
  DrawerNavigationProp,
  DrawerScreenProps,
} from "@react-navigation/drawer";
import type {
  CompositeNavigationProp,
  CompositeScreenProps,
} from "@react-navigation/native";
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import type { RootDrawerParamList } from "../../App";
import { SelectedItem } from "./components";
import type { PutStockAwayScreenProps } from "../PutStockAwayScreen";
import type { Item } from "../../store";
import {
  clearChecklistItems,
  clearSelectedItems,
  useAppDispatch,
  useAppSelector,
} from "../../store";
import { APP_BACKGROUND_COLOR, APP_PADDING } from "../../theme";

import { APP_FONT_SIZE } from "../../theme";

const { height } = Dimensions.get("window");

type PutAwayItemsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<PutStockAwayScreenProps, "PutAwayItemsScreen">,
  DrawerScreenProps<RootDrawerParamList>
>;

export const PutAwayItemsScreen = ({ navigation }: PutAwayItemsScreenProps) => {
  const { checklistItems, selectedItems } = useAppSelector(
    ({ putStockAway }) => putStockAway
  );

  const renderSelectedItem = ({ item }: ListRenderItemInfo<Item>) => {
    return <SelectedItem item={item} key={item.id} navigation={navigation} />;
  };

  const sortIsle = (list: Item[]) => {
    return list.sort((a, b) => a.location.localeCompare(b.location));
  };

  const orderItems = (list: Item[]) => {
    const itemsInBays = list.filter((item) => /^Bay/i.test(item.location));
    const itemsOn2G = list.filter((item) => /^2G/i.test(item.location));
    const itemsOn21 = list.filter((item) => /^21/i.test(item.location));
    const itemsOn22 = list.filter((item) => /^22/i.test(item.location));
    const itemsOn1G = list.filter((item) => /^1G/i.test(item.location));
    const itemsOn11 = list.filter((item) => /^11/i.test(item.location));
    const itemsOn12 = list.filter((item) => /^12/i.test(item.location));
    const FLEX = list.filter((item) => /^FLEXFIT/i.test(item.location));

    return [
      ...itemsInBays,
      ...sortIsle(itemsOn2G),
      ...FLEX,
      ...sortIsle(itemsOn21),
      ...sortIsle(itemsOn22),
      ...sortIsle(itemsOn1G),
      ...sortIsle(itemsOn11),
      ...sortIsle(itemsOn12),
    ];
  };

  const sortItems = (list: Item[]) => {
    const unchecked = list.filter(
      (item) => !checklistItems.map((item) => item.id).includes(item.id)
    );
    const checked = list.filter((item) =>
      checklistItems.map((item) => item.id).includes(item.id)
    );

    return [...orderItems(unchecked), ...checked];
  };

  return (
    <SafeAreaView>
      <View style={styles.root}>
        <FlatList
          data={sortItems(selectedItems)}
          keyExtractor={(item) => item.id}
          renderItem={renderSelectedItem}
        />
      </View>
      {checklistItems.length === selectedItems.length && (
        <FloatingContainer navigation={navigation} />
      )}
    </SafeAreaView>
  );
};

export type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<PutStockAwayScreenProps, "PutAwayItemsScreen">,
  DrawerNavigationProp<RootDrawerParamList, keyof RootDrawerParamList>
>;

interface FloatingContainerProps {
  navigation: Nav;
}

const FloatingContainer = ({ navigation }: FloatingContainerProps) => {
  const dispatch = useAppDispatch();

  return (
    <View style={[styles.floatingContainer]}>
      <Pressable
        onPress={() => {
          dispatch(clearChecklistItems());
          dispatch(clearSelectedItems());
          navigation.navigate("SelectItemsScreen");
        }}
        style={[styles.floatingButton]}
      >
        <MaterialIcons color="white" name="check" size={APP_FONT_SIZE * 1.5} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: "white",
    borderRadius: APP_PADDING,

    marginHorizontal: APP_PADDING,
    marginVertical: APP_PADDING / 2,

    padding: APP_PADDING,
  },
  checklistItem: {
    backgroundColor: "grey",
    borderRadius: APP_PADDING,

    marginHorizontal: APP_PADDING,
    marginVertical: APP_PADDING / 2,

    padding: APP_PADDING,
  },
  floatingButton: {
    alignItems: "center",

    backgroundColor: "green",
    borderRadius: 50 / 2,
    borderWidth: 2,

    height: 50,

    justifyContent: "center",

    width: 50,
  },
  floatingContainer: {
    bottom: APP_PADDING,

    position: "absolute",

    right: APP_PADDING,
  },
  root: {
    backgroundColor: APP_BACKGROUND_COLOR,

    display: "flex",

    height: height,
  },
});
