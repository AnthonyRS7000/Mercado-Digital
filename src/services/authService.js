// src/services/authService.js
export const getToken = () => {
  return localStorage.getItem('token');
};

export const getUserId = () => {
  const user = JSON.parse(localStorage.getItem('data'));
  return user ? user.user.user_id : null;
};


export const getProveedorId = () => {
  const proveedorId = localStorage.getItem('proveedor_id');
  console.log('Retrieved proveedorId:', proveedorId);
  return proveedorId;
};

export const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  // Lógica para obtener un nuevo token usando el refresh token
  const response = await axios.post('http://127.0.0.1:8000/api/refresh-token', { token: refreshToken });
  const newToken = response.data.access_token;
  localStorage.setItem('token', newToken);
  return newToken;
};
