import api from './axios';

export async function getMerchants() {
  const { data } = await api.get('/merchants');
  return data;
}

export async function getMerchant(id) {
  const { data } = await api.get(`/merchants/${id}`);
  return data;
}

export async function createMerchant(merchantData) {
  const { data } = await api.post('/merchants', merchantData);
  return data;
}

export async function updateMerchant(id, merchantData) {
  const { data } = await api.put(`/merchants/${id}`, merchantData);
  return data;
}

export async function deleteMerchant(id) {
  await api.delete(`/merchants/${id}`);
}
