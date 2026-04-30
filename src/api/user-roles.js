import api from './axios';

export async function getUserPermissions() {
  const { data } = await api.get('/api/user-permissions');
  return data;
}

export async function getUserRoles() {
  const { data } = await api.get('/api/user-roles');
  return data;
}

export async function createUserRole(roleData) {
  const { data } = await api.post('/api/user-roles', roleData);
  return data;
}

export async function updateUserRole(id, roleData) {
  const { data } = await api.put(`/api/user-roles/${id}`, roleData);
  return data;
}

export async function deleteUserRole(id) {
  await api.delete(`/api/user-roles/${id}`);
}
