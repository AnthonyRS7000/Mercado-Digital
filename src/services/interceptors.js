import axios from 'axios';
import { getToken, getUserId } from './authService';

const bdMercado = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

bdMercado.interceptors.request.use(
  async (config) => {
    const token = getToken();
    const userId = getUserId();
    const storedData = JSON.parse(localStorage.getItem('data'));
    const proveedorId = storedData ? storedData.user.related_data.id : null;
    console.log('Using token:', token);
    console.log('Using userId:', userId); // Imprimir el user_id que se está utilizando
    console.log('Using proveedorId:', proveedorId); // Imprimir el proveedor_id que se está utilizando
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (userId) {
      config.params = config.params || {};
      config.params.userId = userId;
    }
    if (proveedorId) {
      config.params = config.params || {};
      config.params.proveedorId = proveedorId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

bdMercado.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshToken();
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
      return bdMercado(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default bdMercado;
