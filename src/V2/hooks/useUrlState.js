import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

const parseParamValue = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const serializeParamValue = (value) => {
  return typeof value === "object" ? JSON.stringify(value) : String(value);
};

export const useUrlState = ({ defaultValues = {}, replace = true } = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const state = useMemo(() => {
    const nextState = { ...defaultValues };

    searchParams.forEach((value, key) => {
      nextState[key] = parseParamValue(value);
    });

    return nextState;
  }, [defaultValues, searchParams]);

  const setState = useCallback(
    (updates) => {
      const nextState = {
        ...state,
        ...(typeof updates === "function" ? updates(state) : updates),
      };
      const nextParams = new URLSearchParams();

      Object.entries(nextState).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          nextParams.set(key, serializeParamValue(value));
        }
      });

      setSearchParams(nextParams, { replace });
    },
    [replace, setSearchParams, state],
  );

  const clearState = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace });
  }, [replace, setSearchParams]);

  return {
    state,
    setState,
    clearState,
  };
};
