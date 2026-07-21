import api from './axios';

export async function getStores() {
  const { data } = await api.get('/stores');
  return data;
}

export async function getStore(id) {
  const { data } = await api.get(`/stores/${id}`);
  return data;
}

export async function createStore(storeData) {
  const { data } = await api.post('/stores', storeData);
  return data;
}

export async function updateStore(id, storeData) {
  const { data } = await api.put(`/stores/${id}`, storeData);
  return data;
}

export async function deleteStore(id) {
  await api.delete(`/stores/${id}`);
}
