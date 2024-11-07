// src/components/ProveedorModal.jsx
import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const ProveedorModal = ({ open, onClose, proveedor }) => {
  if (!proveedor) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
      }}>
        <Typography variant="h6" component="h2">
          Proveedor Registrado
        </Typography>
        <Typography sx={{ mt: 2 }}>
          <strong>Nombre:</strong> {proveedor.nombre}
        </Typography>
        <Typography sx={{ mt: 2 }}>
          <strong>Nombre de la Empresa:</strong> {proveedor.nombre_empresa}
        </Typography>
        <Typography sx={{ mt: 2 }}>
          <strong>Dirección:</strong> {proveedor.direccion}
        </Typography>
        <Typography sx={{ mt: 2 }}>
          <strong>DNI:</strong> {proveedor.dni}
        </Typography>
        <Typography sx={{ mt: 2 }}>
          <strong>Celular:</strong> {proveedor.celular}
        </Typography>
        <Typography sx={{ mt: 2 }}>
          <strong>Email:</strong> {proveedor.email}
        </Typography>
        <Button onClick={onClose} sx={{ mt: 2 }}>Cerrar</Button>
      </Box>
    </Modal>
  );
};

export default ProveedorModal;
