// src/services/ProductoService.js

const API_URL = 'http://localhost:3333/api/productos'; // Asegúrate que esta URL sea la correcta de tu backend

export type ActualizarProductoPayload = Partial<{
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  cantidadEnStock: number;
  cantidadMinimaStock: number;
}>;

const ProductoService = {
  async obtenerProductos() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener productos.');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en ProductoService.obtenerProductos:', error);
      throw error; // Re-lanza el error para que el componente lo maneje
    }
  },

  async obtenerProductoPorId(id: number) {
    try {
      const response = await fetch(`<span class="math-inline">\{API\_URL\}/</span>{id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al obtener producto con ID ${id}.`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error en ProductoService.obtenerProductoPorId (${id}):`, error);
      throw error;
    }
  },

  async crearProducto(producto: string) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(producto),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear producto.');
      }
      return await response.json();
    } catch (error) {
      console.error('Error en ProductoService.crearProducto:', error);
      throw error;
    }
  },

  async actualizarProducto(id: number, producto: ActualizarProductoPayload) {
    try {
      const response = await fetch(`<span class="math-inline">\{API\_URL\}/</span>{id}`, {
        method: 'PUT', // O PATCH, dependiendo de cómo quieras tus actualizaciones
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(producto),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al actualizar producto con ID ${id}.`);
      }
      return await response.json(); // Adonis devuelve el producto actualizado
    } catch (error) {
      console.error(`Error en ProductoService.actualizarProducto (${id}):`, error);
      throw error;
    }
  },

  async eliminarProducto(id: number) {
    try {
      const response = await fetch(`<span class="math-inline">\{API\_URL\}/</span>{id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al eliminar producto con ID ${id}.`);
      }
      // DELETE normalmente devuelve 204 No Content, no hay necesidad de response.json()
      return true;
    } catch (error) {
      console.error(`Error en ProductoService.eliminarProducto (${id}):`, error);
      throw error;
    }
  },
};

export default ProductoService;
