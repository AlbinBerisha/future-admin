import PropTypes from 'prop-types';
import { createContext, useMemo, useState, useCallback, useEffect } from 'react';

import * as authApi from 'api/auth';
import { setAuthDependencies } from 'api/axios';

export const AuthContext = createContext(undefined);

const TOKEN_KEY = 'auth_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const getAccessToken = useCallback(
    (newToken) => {
      if (newToken !== undefined) {
        setToken(newToken);
        sessionStorage.setItem(TOKEN_KEY, newToken);
        return newToken;
      }
      return token;
    },
    [token]
  );

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem(TOKEN_KEY);
  }, []);

  const onSessionExpired = useCallback(() => {
    clearSession();
  }, [clearSession]);

  useEffect(() => {
    setAuthDependencies(getAccessToken, onSessionExpired);
  }, [getAccessToken, onSessionExpired]);

  useEffect(() => {
    authApi
      .refreshToken()
      .then((data) => {
        sessionStorage.setItem(TOKEN_KEY, data.jwt);
        setToken(data.jwt);
        setUser(data.user);
      })
      .catch(() => {
        clearSession();
      })
      .finally(() => {
        setInitialized(true);
      });
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await authApi.login(username, password);
    setToken(data.jwt);
    sessionStorage.setItem(TOKEN_KEY, data.jwt);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const memoizedValue = useMemo(
    () => ({
      user,
      isAuthenticated: !!token && !!user,
      initialized,
      login,
      logout
    }),
    [user, token, initialized, login, logout]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = { children: PropTypes.node };
