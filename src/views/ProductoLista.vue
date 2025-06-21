<template>
  <v-container class="mt-8 elevation-6">
    <v-card class="pa-4 ,elevation-4">
      <v-card-title class="text-h5 d-flex justify-space-between align-center">
        Lista de Productos
        <v-btn color="primary" @click="router.push('/productos/nuevo')">
          <v-icon left>mdi-plus</v-icon>
          Añadir Producto
        </v-btn>
      </v-card-title>

      <v-text-field
        v-model="busqueda"
        label="Buscar productos por nombre"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        clearable
        class="mt-4"
      ></v-text-field>

      <v-alert
        v-if="error"
        type="error"
        class="my-4"
        closable
        variant="tonal"
      >
        {{ error }}
      </v-alert>

      <v-data-table
        :headers="encabezados"
        :items="productosFiltrados"
        :loading="cargando"
        item-value="id"
        class="elevation-1"
        no-data-text="No hay productos disponibles."
      >
        <template v-slot:item.nombre="{ item }">
          <div :class="{ 'font-weight-bold text-red-darken-2': item.cantidadEnStock <= item.cantidadMinimaStock }">
            {{ item.nombre }}
            <v-icon
              v-if="item.cantidadEnStock <= item.cantidadMinimaStock"
              color="red-darken-2"
              small
              class="ml-1"
              title="Stock Bajo"
            >
              mdi-alert-circle
            </v-icon>
          </div>
        </template>

        <template #item.precio="{ item }">
          {{ parseFloat(item.precio).toFixed(2) }} $
        </template>

        <template v-slot:item.acciones="{ item }">
          <v-btn icon size="small" color="info" class="mr-2" @click="router.push(`/productos/${item.id}`)">
            <v-icon>mdi-eye</v-icon>
            <v-tooltip activator="parent" location="top">Ver Detalle</v-tooltip>
          </v-btn>
          <v-btn icon size="small" color="warning" class="mr-2" @click="router.push(`/productos/${item.id}/editar`)">
            <v-icon>mdi-pencil</v-icon>
            <v-tooltip activator="parent" location="top">Editar</v-tooltip>
          </v-btn>
          <v-btn icon size="small" color="error" @click="confirmarEliminar(item)">
            <v-icon>mdi-delete</v-icon>
            <v-tooltip activator="parent" location="top">Eliminar</v-tooltip>
          </v-btn>
        </template>
      </v-data-table>

      <v-dialog v-model="dialogoEliminar" max-width="500px">
        <v-card>
          <v-card-title class="text-h6">Confirmar Eliminación</v-card-title>
          <v-card-text>¿Estás seguro de que quieres eliminar el producto "{{ productoEliminar?.nombre }}"?</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue-darken-1" variant="text" @click="dialogoEliminar = false">Cancelar</v-btn>
            <v-btn color="error" variant="text" @click="eliminarProductoConfirmado">Eliminar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-snackbar
        v-model="snackbar.mostrar"
        :color="snackbar.color"
        timeout="3000"
      >
        {{ snackbar.mensaje }}
        <template v-slot:actions>
          <v-btn
            color="white"
            variant="text"
            @click="snackbar.mostrar = false"
          >
            Cerrar
          </v-btn>
        </template>
      </v-snackbar>

    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import ProductoService from '@/services/ProductoService'; // Usamos @/ para alias de src/

const router = useRouter();

interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  cantidadEnStock: number;
  cantidadMinimaStock: number;
}

const productos = ref<Producto[]>([]);
const cargando = ref(true);
const error = ref<string | null>(null);
const busqueda = ref('');

// Para el diálogo de eliminación
const dialogoEliminar = ref(false);
const productoEliminar = ref<Producto | null>(null);

// Para el snackbar de notificaciones
const snackbar = ref({
  mostrar: false,
  mensaje: '',
  color: '',
});

const encabezados = [
  { title: 'Nombre', align: 'start', key: 'nombre' },
  { title: 'Descripción', key: 'descripcion', sortable: false },
  { title: 'Precio', key: 'precio' },
  { title: 'Stock', key: 'cantidadEnStock' },
  { title: 'Stock Mínimo', key: 'cantidadMinimaStock' },
  { title: 'Acciones', key: 'acciones', sortable: false, align: 'center' },
];

// Computed property para filtrar productos
const productosFiltrados = computed(() => {
  if (!busqueda.value) {
    return productos.value;
  }
  const busquedaLower = busqueda.value.toLowerCase();
  return productos.value.filter(producto =>
    producto.nombre.toLowerCase().includes(busquedaLower) ||
    (producto.descripcion && producto.descripcion.toLowerCase().includes(busquedaLower))
  );
});

// Función para cargar los productos desde el backend
const cargarProductos = async () => {
  cargando.value = true;
  error.value = null;
  try {
    const data = await ProductoService.obtenerProductos();
    console.log("Datos recibidos del backend:", data);
    productos.value = data;
    console.log("Productos en la ref:", productos.value);
  } catch (err) { // <--- Corregido: 'err' sin 'instanceof Error' aquí
    // Ahora, realiza la verificación de tipo dentro del bloque catch
    if (err instanceof Error) {
      error.value = err.message || 'Fallo al cargar los productos.';
      snackbar.value = {
        mostrar: true,
        mensaje: '',
        color: 'error',
      };
    } else {
      // Manejar casos donde 'err' no es un objeto Error (ej. cadena de texto, otro tipo)
      console.error("Error desconocido/inesperado:", err);
      error.value = String(err) || 'Fallo inesperado al cargar los productos.'; // Convertir a cadena para mostrar
      snackbar.value = {
        mostrar: true,
        mensaje: '',
        color: 'error',
      };
    }
  } finally {
    cargando.value = false;
  }
};

// Funciones para eliminación
const confirmarEliminar = (ActualizarProductoPayload: Producto) => {
  productoEliminar.value = ActualizarProductoPayload;
  dialogoEliminar.value = true;
};

const eliminarProductoConfirmado = async () => {
  dialogoEliminar.value = false;
  if (!productoEliminar.value) return;

  cargando.value = true; // Mostrar cargando mientras se elimina
  try {
    await ProductoService.eliminarProducto(productoEliminar.value.id);
    snackbar.value = {
      mostrar: true,
      mensaje: `Producto "${productoEliminar.value.nombre}" eliminado exitosamente.`,
      color: 'success',
    };
    await cargarProductos(); // Recargar la lista después de eliminar
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message || 'Fallo al eliminar el producto.';
    } else {
      error.value = String(err) || 'Fallo al eliminar el producto.';
    }
    snackbar.value = {
      mostrar: true,
      mensaje: '',
      color: 'error',
    };
  } finally {
    cargando.value = false;
    productoEliminar.value = null; // Limpiar el producto a eliminar
  }
};

// Cargar productos cuando el componente se monta
onMounted(cargarProductos);
</script>

<style scoped>

</style>
