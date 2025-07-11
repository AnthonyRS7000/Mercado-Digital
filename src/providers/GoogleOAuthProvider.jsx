// src/providers/GoogleOAuthProvider.jsx
import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { getGoogleClientId } from '../pages/Portal/googleAuth';

const GoogleAuthProvider = ({ children }) => {
  const clientId = getGoogleClientId();

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
};

export default GoogleAuthProvider;