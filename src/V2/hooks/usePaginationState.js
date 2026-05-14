import { useCallback } from "react";

import { useUrlState } from "./useUrlState";

export const usePaginationState = ({ defaultPage = 1, defaultPageSize = 10 } = {}) => {
  const { state, setState } = useUrlState({
    defaultValues: {
      page: defaultPage,
      size: defaultPageSize,
    },
  });

  const setPage = useCallback(
    (page) => {
      setState({ page: Math.max(1, Number(page) || defaultPage) });
    },
    [defaultPage, setState],
  );

  const setPageSize = useCallback(
    (size) => {
      setState({ page: 1, size: Number(size) || defaultPageSize });
    },
    [defaultPageSize, setState],
  );

  return {
    page: Number(state.page) || defaultPage,
    pageSize: Number(state.size) || defaultPageSize,
    setPage,
    setPageSize,
  };
};
