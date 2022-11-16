import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect } from "react";

import { Item, setSearchResult } from "./appSlice";
import { useAppSelector, useAppDispatch } from "./hooks";

export const useSearchHooks = () => {
  const dispatch = useAppDispatch();

  const { searchTerm } = useAppSelector(({ app }) => app);

  const handleSearch = useCallback(async (searchTerm: string) => {
    if (searchTerm.length > 3) {
      const res = await AsyncStorage.getItem("catalogData");

      if (res) {
        const catalogData: Item[] = JSON.parse(res);

        const searchResult = catalogData.filter((item) =>
          item.code.includes(searchTerm.toUpperCase())
        );

        dispatch(setSearchResult(searchResult));
      }
    } else {
      dispatch(setSearchResult([]));
    }
  }, []);

  useEffect(() => {
    handleSearch(searchTerm);
  }, [searchTerm]);
};
