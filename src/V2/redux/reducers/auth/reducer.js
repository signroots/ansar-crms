import { createSlice } from "@reduxjs/toolkit";

import {
  clearAuthSession,
  getAuthSession,
  setAuthSession,
} from "../../../shared/utils/authSession";

const buildInitialState = () => {
  const session = getAuthSession();

  return {
    accessToken: session.accessToken,
    role: session.role,
    staffId: session.staffId,
    isAdmin: session.isAdmin,
    isAuthenticated: Boolean(session.accessToken),
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: buildInitialState(),
  reducers: {
    hydrateSession: () => buildInitialState(),
    setSession: (_state, action) => {
      setAuthSession(action.payload);
      return buildInitialState();
    },
    logout: () => {
      clearAuthSession();
      return buildInitialState();
    },
  },
});

export const { hydrateSession, logout, setSession } = authSlice.actions;

export default authSlice.reducer;
