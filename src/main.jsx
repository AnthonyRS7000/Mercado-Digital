import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import AuthProvider from './context/AuthContext'; // Asegúrate de que esta ruta sea correcta
import DataProvider from './context/DataContext';
import { ToastProvider } from './context/ToastContext'; // Importamos el ToastProvider
import { GoogleOAuthProvider } from '@react-oauth/google';  // Importamos el GoogleOAuthProvider
import './services/interceptors';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import './styles/css/toast.css'; // ajusta la ruta si es diferente

// Asegúrate de envolver toda tu aplicación con el GoogleOAuthProvider
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <DataProvider>
        <ToastProvider> {/* Envuelve con ToastProvider */}
          <GoogleOAuthProvider clientId="631821115707-jvd3fjrmv0o0t5peahjdb9261pi6kfoj.apps.googleusercontent.com">
            <Router>
              <App />
            </Router>
          </GoogleOAuthProvider>
        </ToastProvider>
      </DataProvider>
    </AuthProvider>
  </React.StrictMode>
);
