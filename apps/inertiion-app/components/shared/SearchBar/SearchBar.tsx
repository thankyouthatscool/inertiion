import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, TextInput, StyleSheet, View } from "react-native";

import { useAppDispatch, useAppSelector, useSearchHooks } from "@hooks/index";
import { clearSearchTerm, setSearchTerm } from "@store/index";
import { APP_FONT_SIZE, APP_PADDING_SIZE } from "@theme/index";

export const SearchBar = () => {
  useSearchHooks();

  const dispatch = useAppDispatch();

  const { searchTerm } = useAppSelector(({ app }) => app);

  return (
    <View style={[styles.searchBarContainer]}>
      <TextInput
        onChangeText={(text) => {
          dispatch(setSearchTerm(text));
        }}
        placeholder="Search"
        style={[styles.searchTextInput]}
        value={searchTerm}
      />
      {!!searchTerm && (
        <Pressable>
          <MaterialIcons
            onPress={() => {
              dispatch(clearSearchTerm());
            }}
            size={APP_FONT_SIZE * 1.5}
            name="clear"
          />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchBarContainer: {
    alignItems: "center",

    backgroundColor: "white",
    borderRadius: APP_FONT_SIZE,

    elevation: 8,

    flexDirection: "row",

    margin: APP_PADDING_SIZE,

    padding: APP_FONT_SIZE,
  },
  searchTextInput: {
    fontSize: APP_FONT_SIZE,

    flex: 1,
  },
});
