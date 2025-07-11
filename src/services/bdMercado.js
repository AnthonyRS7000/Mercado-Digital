import axios from 'axios';
import { getToken } from './authService';

const bdMercado = axios.create({
  baseURL: 'https://mercado-backend.sistemasudh.com/api',
});

bdMercado.interceptors.request.use(
  async (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default bdMercado;
