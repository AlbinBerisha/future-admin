import api from './axios';

export async function getProducts() {
  const { data } = await api.get('/products');
  return data;
}

export async function getProduct(id) {
  const { data } = await api.get(`/products/${id}`);
  return data;
}

export async function createProduct(productData) {
  const { data } = await api.post('/products', productData);
  return data;
}

export async function updateProduct(id, productData) {
  const { data } = await api.put(`/products/${id}`, productData);
  return data;
}

export async function deleteProduct(id) {
  await api.delete(`/products/${id}`);
}

