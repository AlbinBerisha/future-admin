import api from './axios';

const API_URL = import.meta.env.VITE_APP_API_URL;

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/api/files', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}

export function getFileUrl(id) {
  return `${API_URL}/api/files/${id}`;
}

export async function deleteFile(id) {
  await api.delete(`/api/files/${id}`);
}
