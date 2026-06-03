import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3003/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchPdfList = async (userId) => {
  const response = await api.get('/rag/user-pdfs', { params: { user_id: Number(userId) } });
  return response.data;
};

export const uploadPdf = async (formData) => {
  const response = await api.post('/rag/upload-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deletePdf = async (recordId) => {
  return Promise.resolve({ status: true, recordId });
};

export const queryChat = async (payload) => {
  const response = await api.post('/rag/query', payload);
  return response.data;
};
