import { createRouter, createWebHistory } from 'vue-router'
import ProductoFormulario from '@/views/ProductoFormulario.vue'
import ProductoDetalle from '@/views/ProductoDetalle.vue'
import ProductoLista from '@/views/ProductoLista.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/productos' // Redirige la ruta raíz a la lista de productos
    },
    {
      path: '/productos',
      name: 'productos-lista',
      component: ProductoLista // Apunta al componente de lista
    },
    {
      path: '/productos/nuevo',
      name: 'productos-nuevo',
      component: ProductoFormulario // Apunta al componente de formulario para crear
    },
    {
      path: '/productos/:id',
      name: 'productos-detalle',
      component: ProductoDetalle // Apunta al componente de detalle
    },
    {
      path: '/productos/:id/editar',
      name: 'productos-editar',
      component: ProductoFormulario // Apunta al mismo formulario para editar
    }
  ]
})

export default router
