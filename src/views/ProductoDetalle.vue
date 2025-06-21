<template>
  <v-container>
    <v-card class="pa-4, elevation-5">
      <v-card-title class="text-h5 d-flex justify-space-between align-center">
        Detalle del Producto
        <v-btn color="secondary" @click="router.back()">
          <v-icon left>mdi-arrow-left</v-icon>
          Volver a la Lista
        </v-btn>
      </v-card-title>

      <v-alert
        v-if="error"
        type="error"
        class="my-4"
        closable
        variant="tonal"
      >
        {{ error }}
      </v-alert>

      <v-progress-linear
        v-if="cargando"
        indeterminate
        color="primary"
      ></v-progress-linear>

      <div v-if="producto && !cargando">
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <p class="text-h6 mb-2">Nombre: <strong>{{ producto.nombre }}</strong></p>
              <p class="mb-2">Descripción: {{ producto.descripcion || 'N/A' }}</p>
              <p><strong>Precio:</strong> {{ typeof producto.precio === 'string' || typeof producto.precio === 'number' ? parseFloat(producto.precio).toFixed(2) : 'N/A' }} $</p>
              <p class="mb-2">
                Stock Actual:
                <strong :class="{ 'text-red-darken-2': producto.cantidadEnStock <= producto.cantidadMinimaStock }">
                  {{ producto.cantidadEnStock }}
                </strong>
                <v-icon
                  v-if="producto.cantidadEnStock <= producto.cantidadMinimaStock"
                  color="red-darken-2"
                  small
                  class="ml-1"
                  title="Stock Bajo"
                >
                  mdi-alert-circle
                </v-icon>
              </p>
              <p>Stock Mínimo: {{ producto.cantidadMinimaStock }}</p>
              <p class="mt-4 text-caption">Creado: {{ formatearFecha(producto.createdAt) }}</p>
              <p class="text-caption">Última Actualización: {{ formatearFecha(producto.updatedAt) }}</p>
            </v-col>
            <v-col cols="12" md="6">
              <v-card outlined class="pa-3 mb-4 elevation-4">
                <v-card-title class="text-subtitle-1">Añadir Movimiento de Stock</v-card-title>
                <v-card-text>
                  <v-form @submit.prevent="guardarMovimientoStock" ref="formMovimientoRef">
                    <v-select
                      v-model="nuevoMovimiento.tipo"
                      :items="['entrada', 'salida']"
                      label="Tipo de Movimiento"
                      :rules="[reglasMovimiento.requerido]"
                      variant="outlined"
                      class="mb-4"
                    ></v-select>

                    <v-text-field
                      v-model.number="nuevoMovimiento.cantidad"
                      label="Cantidad"
                      type="number"
                      :rules="[reglasMovimiento.requerido, reglasMovimiento.positivo]"
                      variant="outlined"
                      class="mb-4"
                    ></v-text-field>

                    <v-textarea
                      v-model="nuevoMovimiento.notas"
                      label="Notas (opcional)"
                      variant="outlined"
                      rows="2"
                      class="mb-4"
                    ></v-textarea>

                    <v-btn color="success" type="submit" :loading="cargandoMovimiento">
                      Añadir Movimiento
                    </v-btn>
                  </v-form>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-divider class="my-6"></v-divider>

          <v-card-title class="text-h6">Historial de Movimientos de Stock</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="encabezadosMovimientos"
              :items="producto.movimientosStock"
              item-value="id"
              class="elevation-1"
              no-data-text="No hay movimientos de stock registrados para este producto."
            >
              <template v-slot:item.tipo="{ item }">
                <v-chip :color="item.tipo === 'entrada' ? 'green' : 'red'" dark small>
                  {{ item.tipo.toUpperCase() }}
                </v-chip>
              </template>
              <template v-slot:item.cantidad="{ item }">
                <span :class="item.tipo === 'entrada' ? 'text-green-darken-2' : 'text-red-darken-2'">
                  {{ item.tipo === 'entrada' ? '+' : '-' }}{{ item.cantidad }}
                </span>
              </template>
              <template v-slot:item.createdAt="{ item }">
                {{ formatearFecha(item.createdAt) }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card-text>
      </div>
      <div v-else-if="!cargando && !producto">
        <v-card-text>
          <p>Producto no encontrado.</p>
        </v-card-text>
      </div>
    </v-card>

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
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ProductoService from '@/services/ProductoService';
import MovimientoStockService from '@/services/MovimientoStockService';
import { DateTime } from 'luxon'; // Para formatear fechas

interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number | string; // Define precio como number | string aquí
  cantidadEnStock: number;
  cantidadMinimaStock: number;
  createdAt: string;
  updatedAt: string;
}

const route = useRoute();
const router = useRouter();

const producto = ref(null);
const cargando = ref(true);
const error = ref(null);

const nuevoMovimiento = ref({
  productoId: null,
  tipo: 'entrada', // Valor por defecto
  cantidad: 0,
  notas: '',
});
const cargandoMovimiento = ref(false);
const formMovimientoRef = ref(null); // Ref para el formulario de movimiento

const snackbar = ref({
  mostrar: false,
  mensaje: '',
  color: '',
});

const encabezadosMovimientos = [
  { title: 'Tipo', key: 'tipo' },
  { title: 'Cantidad', key: 'cantidad' },
  { title: 'Notas', key: 'notas', sortable: false },
  { title: 'Fecha', key: 'createdAt' },
];

const reglasMovimiento = {
  requerido: value => !!value || 'Campo requerido.',
  positivo: value => value > 0 || 'Debe ser un número positivo.',
};

// Función para formatear fechas
const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A';
  // Si la fecha ya es un objeto DateTime, úsala directamente
  // De lo contrario, asume que es un string ISO y pársala
  const dt = typeof fecha === 'string' ? DateTime.fromISO(fecha) : fecha;
  return dt.toLocaleString(DateTime.DATETIME_SHORT); // Formato corto de fecha y hora
};

// Función para cargar el detalle del producto y sus movimientos
const cargarProductoDetalle = async () => {
  const productId = route.params.id;
  if (!productId) {
    error.value = 'ID de producto no proporcionado.';
    cargando.value = false;
    return;
  }

  cargando.value = true;
  error.value = null;
  try {
    const data = await ProductoService.obtenerProductoPorId(productId);
    producto.value = data;
    nuevoMovimiento.value.productoId = productId; // Asigna el ID del producto al formulario de movimiento
  } catch (err) {
    error.value = err.message || 'Fallo al cargar el detalle del producto.';
    snackbar.value = {
      mostrar: true,
      mensaje: error.value,
      color: 'error',
    };
  } finally {
    cargando.value = false;
  }
};

// Función para guardar un nuevo movimiento de stock
const guardarMovimientoStock = async () => {
  const { valid } = await formMovimientoRef.value.validate();
  if (!valid) {
    snackbar.value = {
      mostrar: true,
      mensaje: 'Por favor, corrige los errores en el formulario de movimiento.',
      color: 'warning',
    };
    return;
  }

  cargandoMovimiento.value = true;
  try {
    // Llama al servicio para crear el movimiento
    await MovimientoStockService.crearMovimiento(nuevoMovimiento.value);
    snackbar.value = {
      mostrar: true,
      mensaje: 'Movimiento de stock registrado exitosamente.',
      color: 'success',
    };
    // Recargar el detalle del producto para actualizar la cantidad en stock y el historial
    await cargarProductoDetalle();
    // Resetear el formulario de movimiento
    formMovimientoRef.value.reset();
    nuevoMovimiento.value = {
      productoId: producto.value.id, // Mantener el productoId
      tipo: 'entrada',
      cantidad: 0,
      notas: '',
    };
  } catch (err) {
    error.value = err.message || 'Fallo al registrar el movimiento de stock.';
    snackbar.value = {
      mostrar: true,
      mensaje: error.value,
      color: 'error',
    };
  } finally {
    cargandoMovimiento.value = false;
  }
};

onMounted(cargarProductoDetalle);
</script>
