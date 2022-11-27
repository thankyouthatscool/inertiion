import _throttle from "lodash.throttle";
import { useCallback, useEffect } from "react";

import { setSearchResult } from "@store/index";
import { useAppDispatch, useAppSelector } from "@store/hooks";

export const useSearchHooks = () => {
  const dispatch = useAppDispatch();

  const { searchTerm } = useAppSelector(({ app }) => app);
  const { catalog } = useAppSelector(({ item }) => item);

  const handleClearSearchResult = useCallback(() => {
    return dispatch(setSearchResult([]));
  }, []);

  const handleSearch = useCallback(
    _throttle((searchTerm: string) => {
      const res = catalog.filter((item) =>
        `${item.code} ${item.description}`
          .toLowerCase()
          .includes(searchTerm.toLocaleLowerCase())
      );

      dispatch(setSearchResult(res));
    }, 1000),
    [catalog]
  );

  useEffect(() => {
    if (searchTerm === "") {
      handleClearSearchResult();
    }

    if (searchTerm.length > 3) {
      handleSearch(searchTerm);
    }
  }, [searchTerm]);
};
