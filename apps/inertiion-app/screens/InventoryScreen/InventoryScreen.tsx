import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect } from "react";
import { BackHandler, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RootNavigator } from "../../App";
import { useAppDispatch, useAppSelector } from "@hooks";
import { clearReturnLocation } from "@store";
import { FromLocation } from "../../types";

type InventoryScreenNavProps = NativeStackScreenProps<
  RootNavigator,
  "Inventory"
>;

export const InventoryScreen = ({
  navigation,
  route,
}: InventoryScreenNavProps) => {
  const dispatch = useAppDispatch();

  const { itemToEdit } = useAppSelector(({ item }) => item);
  const { returnLocation } = useAppSelector(({ app }) => app);

  const handleBackPress = useCallback(() => {
    const prevLocation = returnLocation;

    dispatch(clearReturnLocation());

    if (prevLocation === FromLocation.PutStockAway) {
      navigation.navigate("PutStockAway", { screen: "SelectItems" });

      return true;
    }

    return false;
  }, [returnLocation]);

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", handleBackPress);

    return () =>
      BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
  }, [returnLocation]);

  return (
    <SafeAreaView>
      <Text>{!!itemToEdit ? "Yes item" : "No item"}</Text>
      <Text>
        Return Location:{" "}
        {returnLocation || "Dunno\nWill return to default screen"}
      </Text>
    </SafeAreaView>
  );
};
