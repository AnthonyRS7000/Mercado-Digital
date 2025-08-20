import bdMercado from "@/services/bdMercado";

/**
 * Inicia el flujo de pago con Mercado Pago
 * @param {Array} carrito - Lista de productos con {id, cantidad}
 * @param {Object} user   - Usuario logueado con {id, direccion}
 */
export const pagarConMercadoPago = async (carrito, user) => {
  try {
    // Construir payload que espera tu backend
    const payload = {
      user_id: user.id,
      direccion_entrega: user.direccion,
      productos: carrito.map((item) => ({
        producto_id: item.id,
        cantidad: item.cantidad,
      })),
      fecha_programada: null, // opcional
      hora_programada: null,  // opcional
    };

    // Llamada al backend Laravel
    const response = await bdMercado.post("/mercadopago/preferencia", payload);

    if (response.data?.init_point) {
      // Redirigir al checkout de Mercado Pago
      window.location.href = response.data.init_point;
    } else {
      alert("No se pudo generar el link de pago.");
    }
  } catch (error) {
    console.error("Error creando preferencia en MP:", error);
    alert("Ocurrió un error al procesar el pago.");
  }
};
