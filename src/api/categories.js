import api from './axios';

export async function getCategories() {
  const { data } = await api.get('/product-categories');
  return data;
}

export async function createCategory(categoryData) {
  const { data } = await api.post('/product-categories', categoryData);
  return data;
}

export async function updateCategory(id, categoryData) {
  const { data } = await api.put(`/product-categories/${id}`, categoryData);
  return data;
}

export async function deleteCategory(id) {
  await api.delete(`/product-categories/${id}`);
}

export async function getCategoryFilters(categoryId) {
  const { data } = await api.get(`/product-categories/${categoryId}/product-filters`);
  return data;
}

export async function createFilter(filterData) {
  const { data } = await api.post('/product-filters', filterData);
  return data;
}

export async function updateFilter(filterId, filterData) {
  const { data } = await api.put(`/product-filters/${filterId}`, filterData);
  return data;
}

export async function deleteFilter(filterId) {
  await api.delete(`/product-filters/${filterId}`);
}

export function buildCategoryTree(flatList) {
  const map = {};
  const roots = [];

  flatList.forEach((cat) => {
    map[cat.id] = { ...cat, children: [] };
  });

  flatList.forEach((cat) => {
    const node = map[cat.id];
    const parentId = cat.parentCategory?.id;
    if (parentId && map[parentId]) {
      map[parentId].children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}
