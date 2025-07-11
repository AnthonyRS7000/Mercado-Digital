// services/googleAuth.js

const googleClientId = "631821115707-jvd3fjrmv0o0t5peahjdb9261pi6kfoj.apps.googleusercontent.com";  // Aquí debes colocar tu Client ID de Google
const googleRedirectUri = "http://localhost:8000/callback/google";
  // La URL de redirección

export const getGoogleClientId = () => googleClientId;
export const getGoogleRedirectUri = () => googleRedirectUri;
