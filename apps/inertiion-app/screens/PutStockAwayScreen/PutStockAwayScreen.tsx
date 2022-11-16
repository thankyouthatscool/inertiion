import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DrawerScreenProps } from "@react-navigation/drawer";

import { RootDrawerParamList } from "../../App";
import { SearchBar } from "./components";
import {
  // Selected items
  addSelectedItem,
  removeSelectedItem,
  Item,
  useAppDispatch,
  useAppSelector,
} from "../../store";
import { APP_BACKGROUND_COLOR, APP_FONT_SIZE, APP_PADDING } from "../../theme";

const { height } = Dimensions.get("window");

type PutStockAwayScreenParamList = DrawerScreenProps<
  RootDrawerParamList,
  "PutStockAwayScreen"
>;

export const PutStockAwayScreen = ({
  navigation,
}: PutStockAwayScreenParamList) => {
  const dispatch = useAppDispatch();

  const { searchResult } = useAppSelector(({ app }) => app);
  const { selectedItems } = useAppSelector(({ putStockAway }) => putStockAway);

  const renderCatalogItem = ({ item }: ListRenderItemInfo<Item>) => {
    return (
      <Pressable
        onPress={() => {
          if (!selectedItems.map((item) => item.id).includes(item.id)) {
            dispatch(addSelectedItem(item));
          } else {
            dispatch(removeSelectedItem(item));
          }
        }}
        style={({ pressed }) => ({
          backgroundColor: "white",
          borderColor: selectedItems.map((item) => item.id).includes(item.id)
            ? "orange"
            : "white",
          borderRadius: APP_PADDING,
          borderWidth: 2,

          marginRight: 4,
          marginLeft: 4,
          marginBottom: APP_PADDING * 0.75,

          padding: APP_PADDING,

          elevation: pressed ? 1 : 4,
        })}
      >
        <Text>
          {item.code} - {item.description}
        </Text>
        <Text>{item.location}</Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView
      style={{
        backgroundColor: APP_BACKGROUND_COLOR,
        paddingTop: APP_PADDING,
        paddingLeft: APP_PADDING,
        paddingRight: APP_PADDING,
      }}
    >
      <View
        style={{
          display: "flex",
          height: height - APP_PADDING,
        }}
      >
        <SearchBar navigation={navigation} />
        <FlatList
          data={searchResult}
          keyExtractor={(item) => item.id}
          overScrollMode="never"
          renderItem={renderCatalogItem}
          showsVerticalScrollIndicator={false}
          style={{ marginTop: APP_PADDING }}
        />
      </View>
      {!!selectedItems.length && <FloatingButton />}
    </SafeAreaView>
  );
};

const FLOATING_BUTTON_SIZE = 50;

const FloatingButton = () => {
  return (
    <Pressable
      style={({ pressed }) => ({
        alignItems: "center",

        backgroundColor: "orange",
        borderRadius: FLOATING_BUTTON_SIZE / 2,
        borderWidth: 2,
        bottom: APP_PADDING,

        elevation: pressed ? 1 : 5,

        height: FLOATING_BUTTON_SIZE,

        justifyContent: "center",

        position: "absolute",

        right: APP_PADDING,

        width: FLOATING_BUTTON_SIZE,
      })}
    >
      <MaterialIcons name="east" size={APP_FONT_SIZE * 1.5} />
    </Pressable>
  );
};
