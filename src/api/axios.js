import axios from 'axios';

let _getAccessToken = () => null;
let _onSessionExpired = () => {};

export function setAuthDependencies(getToken, onExpired) {
  _getAccessToken = getToken;
  _onSessionExpired = onExpired;
}

// baseURL is same-origin /api. nginx (prod) and Vite's dev proxy forward /api
// to the backend, so the bundle carries no per-environment API URL.
const api = axios.create({
  baseURL: '/api',
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
        const { data } = await api.get('/auth/refresh');
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
