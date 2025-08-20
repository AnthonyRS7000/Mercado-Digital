import { baseURL } from './bdMercado';

const googleClientId = "631821115707-jvd3fjrmv0o0t5peahjdb9261pi6kfoj.apps.googleusercontent.com";

// ✅ Usamos la baseURL y removemos el /api si está presente
const googleRedirectUri = `${baseURL.replace('/api', '')}/callback/google`;

export const getGoogleClientId = () => googleClientId;
export const getGoogleRedirectUri = () => googleRedirectUri;
