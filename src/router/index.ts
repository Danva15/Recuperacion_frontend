import { createRouter, createWebHistory } from 'vue-router'

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
      component: () => import('../views/ProductoLista.vue') // Apunta al componente de lista
    },
    {
      path: '/productos/nuevo',
      name: 'productos-nuevo',
      component: () => import('../views/ProductoFormulario.vue') // Apunta al componente de formulario para crear
    },
    {
      path: '/productos/:id',
      name: 'productos-detalle',
      component: () => import('../views/ProductoDetalle.vue') // Apunta al componente de detalle
    },
    {
      path: '/productos/:id/editar',
      name: 'productos-editar',
      component: () => import('../views/ProductoFormulario.vue') // Apunta al mismo formulario para editar
    }
  ]
})

export default router
