import api from './axios';

export async function getStores() {
  const { data } = await api.get('/api/stores');
  return data;
}

export async function getStore(id) {
  const { data } = await api.get(`/api/stores/${id}`);
  return data;
}

export async function createStore(storeData) {
  const { data } = await api.post('/api/stores', storeData);
  return data;
}

export async function updateStore(id, storeData) {
  const { data } = await api.put(`/api/stores/${id}`, storeData);
  return data;
}

export async function deleteStore(id) {
  await api.delete(`/api/stores/${id}`);
}
