// src/services/interceptors.js
import bdMercado from './bdMercado';
import { getToken, getUserId, refreshToken } from './authService';

bdMercado.interceptors.request.use(
  async (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Rutas donde NO queremos inyectar userId / proveedorId
    const skipParams = ['/login', '/carrito/merge', '/register'];

    // Solo agregamos parámetros si no está en las rutas a omitir
    if (!skipParams.some(path => config.url.includes(path))) {
      const userId = getUserId();
      const storedData = JSON.parse(localStorage.getItem('data'));
      const proveedorId = storedData?.user?.related_data?.id || null;

      config.params = config.params || {};
      if (userId) config.params.userId = userId;
      if (proveedorId) config.params.proveedorId = proveedorId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

bdMercado.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshToken();
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return bdMercado(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default bdMercado;
