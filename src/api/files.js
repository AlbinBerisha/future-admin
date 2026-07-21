import api from './axios';

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/files', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}

export function getFileUrl(id) {
  // Same-origin relative URL: Vite (dev) and nginx (prod) both proxy /api to the
  // backend, so file requests stay on the frontend origin (no CORS).
  return `/api/files/${id}`;
}

export async function deleteFile(id) {
  await api.delete(`/files/${id}`);
}
