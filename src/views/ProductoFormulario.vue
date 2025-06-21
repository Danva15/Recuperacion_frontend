<template>
  <v-container class="mt-8">
    <v-card class="pa-4">
      <v-card-title class="text-h5">
        {{ esEditando ? 'Editar Producto' : 'Nuevo Producto' }}
      </v-card-title>
      <v-card-text>
        <v-alert
          v-if="error"
          type="error"
          class="mb-4"
          closable
          variant="tonal"
        >
          {{ error }}
        </v-alert>

        <v-form @submit.prevent="guardarProducto" ref="formularioRef">
          <v-text-field
            v-model="producto.nombre"
            label="Nombre del Producto"
            :rules="[reglas.requerido, reglas.minNombre]"
            variant="outlined"
            class="mb-4"
          ></v-text-field>

          <v-textarea
            v-model="producto.descripcion"
            label="Descripción"
            variant="outlined"
            rows="3"
            class="mb-4"
          ></v-textarea>

          <v-text-field
            v-model.number="producto.precio"
            label="Precio"
            type="number"
            :rules="[reglas.requerido, reglas.positivo]"
            variant="outlined"
            prefix="$"
            class="mb-4"
          ></v-text-field>

          <v-text-field
            v-model.number="producto.cantidadEnStock"
            label="Cantidad en Stock"
            type="number"
            :rules="[reglas.requerido, reglas.noNegativo]"
            variant="outlined"
            class="mb-4"
          ></v-text-field>

          <v-text-field
            v-model.number="producto.cantidadMinimaStock"
            label="Cantidad Mínima de Stock"
            type="number"
            :rules="[reglas.requerido, reglas.noNegativo]"
            variant="outlined"
            class="mb-4"
          ></v-text-field>

          <div class="d-flex justify-end">
            <v-btn color="grey" variant="flat" class="mr-4" @click="router.back()">Cancelar</v-btn>
            <v-btn color="primary" type="submit" :loading="cargando">
              Guardar
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
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

const route = useRoute();
const router = useRouter();

const esEditando = ref(false);
const productoId = ref(null);
const producto = ref({
  nombre: '',
  descripcion: '',
  precio: 0,
  cantidadEnStock: 0,
  cantidadMinimaStock: 0,
});

const cargando = ref(false);
const error = ref(null);
const formularioRef = ref(null); // Ref para acceder al formulario de Vuetify

const snackbar = ref({
  mostrar: false,
  mensaje: '',
  color: '',
});

// Reglas de validación para los campos de Vuetify
const reglas = {
  requerido: value => !!value || 'Campo requerido.',
  minNombre: value => (value && value.length >= 3) || 'Mínimo 3 caracteres.',
  positivo: value => value > 0 || 'Debe ser un número positivo.',
  noNegativo: value => value >= 0 || 'No puede ser negativo.',
};

// Función para cargar el producto si estamos en modo edición
const cargarProductoParaEdicion = async () => {
  if (route.params.id) {
    esEditando.value = true;
    productoId.value = route.params.id;
    cargando.value = true;
    try {
      const data = await ProductoService.obtenerProductoPorId(productoId.value);
      // Mapear los datos de la API a tu modelo local, si los nombres difieren
      producto.value = {
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        cantidadEnStock: data.cantidadEnStock,
        cantidadMinimaStock: data.cantidadMinimaStock,
      };
    } catch (err) {
      error.value = err.message || 'Fallo al cargar el producto para edición.';
      snackbar.value = {
        mostrar: true,
        mensaje: error.value,
        color: 'error',
      };
    } finally {
      cargando.value = false;
    }
  }
};

// Función para guardar el producto (crear o actualizar)
const guardarProducto = async () => {
  // Validar formulario de Vuetify
  const { valid } = await formularioRef.value.validate();
  if (!valid) {
    snackbar.value = {
      mostrar: true,
      mensaje: 'Por favor, corrige los errores del formulario.',
      color: 'warning',
    };
    return;
  }

  cargando.value = true;
  error.value = null;
  try {
    if (esEditando.value) {
      await ProductoService.actualizarProducto(productoId.value, producto.value);
      snackbar.value = {
        mostrar: true,
        mensaje: 'Producto actualizado exitosamente.',
        color: 'success',
      };
    } else {
      await ProductoService.crearProducto(producto.value);
      snackbar.value = {
        mostrar: true,
        mensaje: 'Producto creado exitosamente.',
        color: 'success',
      };
    }
    router.push('/productos'); // Redirigir a la lista de productos
  } catch (err) {
    error.value = err.message || 'Fallo al guardar el producto.';
    snackbar.value = {
      mostrar: true,
      mensaje: error.value,
      color: 'error',
    };
  } finally {
    cargando.value = false;
  }
};

onMounted(cargarProductoParaEdicion);
</script>
