import { combineReducers } from "@reduxjs/toolkit";

import { baseApi } from "../services/api/rtk/baseApi";
import authReducer, { logout } from "./reducers/auth/reducer";
import uiReducer from "./reducers/ui/reducer";

const appReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

const rootReducer = (state, action) => {
  if (action.type === logout.type) {
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

export default rootReducer;
