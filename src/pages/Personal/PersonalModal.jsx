// src/components/ApoyoModal.jsx
import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const PersonalModal = ({ open, onClose, apoyo }) => {
  if (!apoyo) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: 400 }, // 90% en móviles, 400px en pantallas más grandes
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid #ccc',
        boxShadow: 24,
        p: { xs: 2, sm: 4 },
      }}>
          
        <Typography variant="h6" component="h2">
          Apoyo Registrado
        </Typography>
        <Typography sx={{ mt: 2 }}>
          <strong>Nombre:</strong> {apoyo.nombre}
        </Typography>
        <Typography sx={{ mt: 2 }}>
          <strong>DNI:</strong> {apoyo.dni}
        </Typography>
        <Typography sx={{ mt: 2 }}>
          <strong>Celular:</strong> {apoyo.celular}
        </Typography>
        <Typography sx={{ mt: 2 }}>
        <strong>Email:</strong> {apoyo.user?.email} 
        </Typography>
        <Button onClick={onClose} sx={{ mt: 2 }}>Cerrar</Button>
      </Box>
    </Modal>
  );
};

export default PersonalModal;
