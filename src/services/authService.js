// src/services/authService.js
import axios from 'axios';
import { baseURL } from './bdMercado';

export const getToken = () => {
  return localStorage.getItem('token');
};

export const getUserId = () => {
  const data = JSON.parse(localStorage.getItem('data'));
  return data?.user?.related_data?.id || null;
};

export const getProveedorId = () => {
  const data = JSON.parse(localStorage.getItem('data'));
  const proveedorId = data?.user?.related_data?.id || null;
  console.log('Retrieved proveedorId:', proveedorId);
  return proveedorId;
};

export const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  const response = await axios.post(`${baseURL.replace('/api', '')}/refresh-token`, {
    token: refreshToken,
  });
  const newToken = response.data.access_token;
  localStorage.setItem('token', newToken);
  return newToken;
};
