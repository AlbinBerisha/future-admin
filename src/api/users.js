import api from './axios';

export async function getUsers() {
  const { data } = await api.get('/api/users');
  return data;
}

export async function getUser(id) {
  const { data } = await api.get(`/api/users/${id}`);
  return data;
}

export async function createUser(userData) {
  const { data } = await api.post('/api/users', userData);
  return data;
}

export async function updateUser(id, userData) {
  const { data } = await api.put(`/api/users/${id}`, userData);
  return data;
}

export async function deleteUser(id) {
  await api.delete(`/api/users/${id}`);
}
