import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";

import type { Item } from "./appSlice";

export const useItemHooks = () => {
  const updateItem = useCallback(async (item: Item) => {
    const res = await AsyncStorage.getItem("catalogData");

    if (res) {
      const catalogData: Item[] = JSON.parse(res);

      const [targetItem] = catalogData.filter(
        (resItem) => resItem.id === item.id
      );
      const rest = catalogData.filter((resItem) => resItem.id !== item.id);

      const updatedItem = {
        ...targetItem,
        location: item.location.toUpperCase(),
      };

      const updatedCatalog = [...rest, updatedItem];

      await AsyncStorage.setItem("catalogData", JSON.stringify(updatedCatalog));
    }
  }, []);

  return { updateItem };
};
