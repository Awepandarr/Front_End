import { createRouter, createWebHistory } from 'vue-router';

// Use dynamic imports for better performance, especially in production.
const POSDashboard = () => import('../views/POSDashboard.vue');
const CustomerManagement = () => import('../views/CustomerManagement.vue');
const PaymentPage = () => import('../views/PaymentPage.vue');
const ConfirmationPage = () => import('../views/ConfirmationPage.vue');
const EndOfDayReport = () => import('../views/EndOfDayReport.vue');
const ProductManagement = () => import('../views/ProductManagement.vue');
const OrdersPage = () => import('../views/OrdersPage.vue');

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: POSDashboard,
      meta: { title: 'POS Dashboard' }
    },
    {
      path: '/customers',
      name: 'customers',
      component: CustomerManagement,
      meta: { title: 'Customer Management' }
    },
    {
      path: '/payment',
      name: 'payment',
      component: PaymentPage,
      meta: { title: 'Payment' }
    },
    {
      path: '/confirmation',
      name: 'confirmation',
      component: ConfirmationPage,
      meta: { title: 'Order Confirmation' }
    },
    {
      path: '/reports',
      name: 'reports',
      component: EndOfDayReport,
      meta: { title: 'Reports' }
    },
    {
      path: '/products',
      name: 'products',
      component: ProductManagement,
      meta: { title: 'Product Management' }
    },
    {
      path: '/orders',
      name: 'orders',
      component: OrdersPage,
      meta: { title: 'Orders' }
    }
  ]
});

// Update page titles
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || 'POS System'}`;
  next();
});

export default router;

