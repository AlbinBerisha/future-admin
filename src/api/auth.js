import api from './axios';

export async function login(username, password) {
  const { data } = await api.post('/auth', { username, password });
  return data;
}

export async function refreshToken() {
  const { data } = await api.get('/auth/refresh');
  return data;
}

export async function logout() {
  await api.get('/logout');
}
