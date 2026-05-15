export const selectAuth = (state) => state.auth;

export const selectAccessToken = (state) => state.auth.accessToken;

export const selectCurrentRole = (state) => state.auth.role;

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export const selectIsAdmin = (state) => state.auth.isAdmin;
