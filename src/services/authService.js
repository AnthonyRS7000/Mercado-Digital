// src/services/authService.js
export const getToken = () => {
  return localStorage.getItem('token');
};

export const getUserId = () => {
  const data = JSON.parse(localStorage.getItem('data'));
  return data?.user?.related_data?.id || null; // Ajusta según dónde está realmente el ID
};

export const getProveedorId = () => {
  const data = JSON.parse(localStorage.getItem('data'));
  const proveedorId = data?.user?.related_data?.id || null;
  console.log('Retrieved proveedorId:', proveedorId);
  return proveedorId;
};


export const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  // Lógica para obtener un nuevo token usando el refresh token
  const response = await axios.post('https://mercado-backend.sistemasudh.com/refresh-token', { token: refreshToken });
  const newToken = response.data.access_token;
  localStorage.setItem('token', newToken);
  return newToken;
};
