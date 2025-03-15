import { createRouter, createWebHistory } from 'vue-router';

// Use dynamic imports for better performance, especially in production.
const HomeView = () => import('../views/POSDashboard.vue');
const PaymentPage = () => import('../views/PaymentPage.vue');
const ConfirmationPage = () => import('../views/ConfirmationPage.vue'); // Add this import

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // This uses the base URL defined in your Vue config.
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/payment',
      name: 'PaymentPage',
      component: PaymentPage,
    },
    {
      path: '/confirmation',
      name: 'ConfirmationPage',
      component: ConfirmationPage, // New confirmation page after successful payment
    },
  ],
});

export default router;
