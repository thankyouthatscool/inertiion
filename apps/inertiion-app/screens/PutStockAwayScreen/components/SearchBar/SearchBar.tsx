import MaterialIcon from "@expo/vector-icons/MaterialIcons";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { CompositeNavigationProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import _throttle from "lodash.throttle";
import { ReactNode } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { RootDrawerParamList } from "../../../../App";
import type { PutStockAwayScreenProps } from "../../PutStockAwayScreen";

import {
  setSearchTerm,
  useAppDispatch,
  useAppSelector,
  useSearchHooks,
} from "../../../../store";
import { APP_FONT_SIZE, APP_PADDING } from "../../../../theme";

interface SearchBarProps {
  navigation: CompositeNavigationProp<
    NativeStackNavigationProp<PutStockAwayScreenProps, "SelectItemsScreen">,
    DrawerNavigationProp<RootDrawerParamList, keyof RootDrawerParamList>
  >;
}

export const SearchBar = ({ navigation }: SearchBarProps) => {
  useSearchHooks();

  const dispatch = useAppDispatch();

  const { searchTerm } = useAppSelector(({ app }) => app);

  const dispatchSearchTerm = _throttle((searchTerm: string) => {
    dispatch(setSearchTerm(searchTerm));
  }, 1000);

  return (
    <View style={{ display: "flex", flexDirection: "row" }}>
      <Card fullFlex>
        <TextInput
          onChangeText={async (text) => {
            dispatchSearchTerm(text);
          }}
          placeholder="Search"
          style={{
            fontSize: APP_FONT_SIZE,
            padding: APP_PADDING * 1,
          }}
          value={searchTerm}
        />
      </Card>
      <Card marginLeft>
        <Pressable
          onPress={() => {
            navigation.navigate("SettingsScreen");
          }}
          style={{ padding: APP_PADDING }}
        >
          <MaterialIcon name="settings" size={APP_FONT_SIZE * 1.5} />
        </Pressable>
      </Card>
    </View>
  );
};

interface CardProps {
  children: ReactNode;
  fullFlex?: boolean;
  marginLeft?: boolean;
  padInside?: boolean;
}

const Card = ({ children, fullFlex, marginLeft, padInside }: CardProps) => {
  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: APP_PADDING * 0.75,

        elevation: 4,

        flex: fullFlex ? 1 : 0,

        justifyContent: "center",

        marginLeft: marginLeft ? APP_PADDING : 0,

        padding: padInside ? APP_PADDING : 0,
      }}
    >
      {children}
    </View>
  );
};
