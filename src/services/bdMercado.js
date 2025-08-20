// src/services/bdMercado.js
import axios from 'axios';
import { getToken } from './authService';

export const baseURL = import.meta.env.VITE_API_URL;
export const BASE_IMG_URL = import.meta.env.VITE_IMG_URL;

// Instancia de Axios con baseURL
const bdMercado = axios.create({ baseURL });

bdMercado.interceptors.request.use(
  async (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default bdMercado;
