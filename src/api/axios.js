import axios from 'axios';

let _getAccessToken = () => null;
let _onSessionExpired = () => {};

export function setAuthDependencies(getToken, onExpired) {
  _getAccessToken = getToken;
  _onSessionExpired = onExpired;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = _getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await api.get('/api/auth/refresh');
        const newToken = data.jwt;
        _getAccessToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        _onSessionExpired();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
