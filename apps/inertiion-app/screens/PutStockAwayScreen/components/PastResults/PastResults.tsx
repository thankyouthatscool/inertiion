import { Pressable, ScrollView, Text, View } from "react-native";

import { useAppDispatch } from "@hooks";
import { setSearchTerm } from "@store";

export const PastResults = () => {
  const dispatch = useAppDispatch();

  return (
    <ScrollView>
      <Pressable
        onPress={() => {
          dispatch(setSearchTerm("AH230"));
        }}
        style={{
          backgroundColor: "white",

          elevation: 4,

          marginHorizontal: 8,
          marginVertical: 4,

          padding: 16,
        }}
      >
        <Text>AH230</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          dispatch(setSearchTerm("AH500"));
        }}
        style={{
          backgroundColor: "white",

          elevation: 4,

          marginHorizontal: 8,
          marginVertical: 4,

          padding: 16,
        }}
      >
        <Text>AH500</Text>
      </Pressable>
    </ScrollView>
  );
};
