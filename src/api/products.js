import api from './axios';

export async function getProducts() {
  const { data } = await api.get('/api/products');
  return data;
}

export async function getProduct(id) {
  const { data } = await api.get(`/api/products/${id}`);
  return data;
}

export async function createProduct(productData) {
  const { data } = await api.post('/api/products', productData);
  return data;
}

export async function updateProduct(id, productData) {
  const { data } = await api.put(`/api/products/${id}`, productData);
  return data;
}

export async function deleteProduct(id) {
  await api.delete(`/api/products/${id}`);
}

