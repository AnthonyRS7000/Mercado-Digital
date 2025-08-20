import React, { useEffect, useState } from 'react';
import bdMercado from '../services/bdMercado';
import '../styles/css/SolicitudesRegistro.css';
import { toast } from 'react-toastify';

const SolicitudesRegistro = () => {
  const [solicitudes, setSolicitudes] = useState([]);

  const fetchSolicitudes = async () => {
    try {
      const res = await bdMercado.get('/solicitudes');
      const pendientes = res.data.filter(s => s.estado === 'pendiente');
      setSolicitudes(pendientes);
    } catch (err) {
      toast.error('❌ Error al obtener las solicitudes.');
      console.error('Error al obtener solicitudes:', err);
    }
  };

  const aprobarSolicitud = async (id) => {
    try {
      await bdMercado.put(`/solicitudes/aprobar/${id}`);
      toast.success('✅ Solicitud aprobada exitosamente');
      fetchSolicitudes();
    } catch (error) {
      const mensaje = error?.response?.data?.error || '❌ Error al aprobar la solicitud.';
      toast.error(mensaje);
      console.error('Error al aprobar solicitud:', error);
    }
  };

  const rechazarSolicitud = async (id) => {
    try {
      await bdMercado.put(`/solicitudes/rechazar/${id}`);
      toast.info('🚫 Solicitud rechazada correctamente');
      fetchSolicitudes();
    } catch (error) {
      toast.error('❌ Error al rechazar la solicitud.');
      console.error('Error al rechazar solicitud:', error);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  return (
    <div className="solicitudes-container">
      <h2>Solicitudes Pendientes</h2>
      {solicitudes.length === 0 ? (
        <p>No hay solicitudes pendientes</p>
      ) : (
        <div className="solicitudes-list">
          {solicitudes.map(s => (
            <div key={s.id} className="solicitud-card">
              <p><strong>Nombre:</strong> {s.nombre}</p>
              <p><strong>DNI:</strong> {s.dni}</p>
              <p><strong>Celular:</strong> {s.celular}</p>
              <p><strong>Empresa:</strong> {s.nombre_empresa}</p>
              <p><strong>Email:</strong> {s.email}</p>
              <p><strong>Tipo:</strong> {s.tipo}</p>
              <div className="solicitud-actions">
                <button
                  className="btn-aprobar"
                  onClick={() => aprobarSolicitud(s.id)}
                >
                  Aprobar
                </button>
                <button
                  className="btn-rechazar"
                  onClick={() => rechazarSolicitud(s.id)}
                >
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SolicitudesRegistro;
