import api from './axios';

export async function getMerchants() {
  const { data } = await api.get('/api/merchants');
  return data;
}

export async function getMerchant(id) {
  const { data } = await api.get(`/api/merchants/${id}`);
  return data;
}

export async function createMerchant(merchantData) {
  const { data } = await api.post('/api/merchants', merchantData);
  return data;
}

export async function updateMerchant(id, merchantData) {
  const { data } = await api.put(`/api/merchants/${id}`, merchantData);
  return data;
}

export async function deleteMerchant(id) {
  await api.delete(`/api/merchants/${id}`);
}
