// src/services/MovimientoStockService.js

const API_URL = 'http://localhost:3333/api/movimientos-stock'; // Endpoint para movimientos de stock

export type CrearMovimientoPayload = {
  productoId: number;  // Obligatorio (FK)
  tipo: string;        // Obligatorio (ej: "entrada", "salida")
  cantidad: number;    // Obligatorio
  notas?: string | null; // Opcional
};

const MovimientoStockService = {
  async crearMovimiento(movimiento: CrearMovimientoPayload) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movimiento),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear movimiento de stock.');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en MovimientoStockService.crearMovimiento:', error);
      throw error;
    }
  },
};

export default MovimientoStockService;
