import axios from 'axios';

const apiUrl = window.__env?.API_URL || import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: `${apiUrl}/api/products`,
  timeout: 10000,
});

export const getAll = () => api.get('/');
export const getById = (id) => api.get(`/${id}`);
export const create = (data) => api.post('/', data);
export const update = (id, data) => api.put(`/${id}`, data);
export const remove = (id) => api.delete(`/${id}`);
