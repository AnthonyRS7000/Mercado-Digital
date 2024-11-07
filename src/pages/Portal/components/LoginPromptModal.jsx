// src/components/LoginPromptModal.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import styles from '../css/LoginPromptModal.module.css';

const LoginPromptModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <div className={styles.modalContent}>
          <FontAwesomeIcon icon={faExclamationCircle} className={styles.icon} />
          <h2>Inicia sesión para continuar</h2>
          <p>Debes iniciar sesión para realizar un pedido.</p>
          <button className={styles.loginButton} onClick={() => window.location.href = '/login'}>
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPromptModal;
