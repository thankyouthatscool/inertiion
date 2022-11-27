import { CreateBucketCommand, S3Client } from "@aws-sdk/client-s3";
import { DrawerScreenProps } from "@react-navigation/drawer";
import type { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect } from "react";
import {
  BackHandler,
  Button,
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  Text,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import type { RootNavigator } from "../../../../App";
import {
  FloatingContainer,
  SearchBar,
  SearchResultItem,
} from "@components/index";
import { useAppDispatch, useAppSelector } from "@hooks/index";
import type { PutStockAwayProps } from "../../PutStockAwayScreen";
import { Item, setItemToEdit, setReturnLocation } from "@store";
import { addSelectedItem, removeSelectedItem } from "@store/index";
import { APP_PADDING_SIZE } from "@theme/index";
import { FromLocation } from "../../../../types";

import { PastResults } from "../../components/PastResults";

type SelectItemsProps = CompositeScreenProps<
  NativeStackScreenProps<PutStockAwayProps, "SelectItems">,
  DrawerScreenProps<RootNavigator>
>;

const { height } = Dimensions.get("screen");

export const SelectItems = ({ navigation }: SelectItemsProps) => {
  const dispatch = useAppDispatch();

  const { searchResult, searchTerm } = useAppSelector(({ app }) => app);
  const { selectedItems } = useAppSelector(({ putStockAway }) => putStockAway);

  const { top } = useSafeAreaInsets();

  const renderSearchResult = ({ item, index }: ListRenderItemInfo<Item>) => {
    return (
      <SearchResultItem
        index={index}
        item={item}
        navigation={navigation}
        onLongPress={() => {
          dispatch(setItemToEdit(item));
          dispatch(setReturnLocation(FromLocation.PutStockAway));

          navigation.navigate("Inventory");
        }}
        onPress={() => {
          if (selectedItems.map((item) => item.id).includes(item.id)) {
            dispatch(removeSelectedItem(item));
          } else {
            dispatch(addSelectedItem(item));
          }
        }}
        selected={selectedItems.map((item) => item.id).includes(item.id)}
      />
    );
  };

  return (
    <SafeAreaView style={{ height: height - (APP_PADDING_SIZE + top) }}>
      <SearchBar />
      {!!searchTerm && searchTerm.length > 3 && searchResult.length === 0 && (
        <Text>No results</Text>
      )}
      {!searchTerm && searchResult.length === 0 && <PastResults />}
      <FlatList
        data={searchResult}
        keyExtractor={(res) => res.id}
        overScrollMode="never"
        renderItem={renderSearchResult}
        showsVerticalScrollIndicator={false}
      />
      {!!selectedItems.length && (
        <FloatingContainer>
          <Button color="orange" title="Clear" />
          <Button
            onPress={() => {
              navigation.navigate("PutAwayItems");
            }}
            title="Next"
          />
        </FloatingContainer>
      )}
    </SafeAreaView>
  );
};
