<template>
  <div class="container mx-auto px-4 py-8">
    <div class="bg-white shadow-xl rounded-lg overflow-hidden">
      <div class="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-white">Order Management</h1>
        <div class="flex items-center space-x-4">
          <button 
            @click="refreshOrders" 
            class="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="p-6 bg-red-50 border-l-4 border-red-500 text-red-700">
        <p class="font-bold">Error</p>
        <p>{{ error }}</p>
      </div>
      
      <!-- Orders Table -->
      <div v-else-if="orders.length" class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tax</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Type</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr 
              v-for="order in orders" 
              :key="order.orderId" 
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #{{ order.orderId }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Customer {{ order.customerId }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                {{ formatCurrency(order.totalAmount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                {{ formatCurrency(order.taxAmount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-semibold">
                {{ formatCurrency(order.finalAmount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="getPaymentStatusClass(order.paymentStatus)"
                  class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                >
                  {{ order.paymentStatus }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ order.orderType }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  @click="viewOrderDetails(order.orderId)"
                  class="text-blue-600 hover:text-blue-900 transition-colors"
                >
                  View Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- No Orders State -->
      <div v-else class="text-center py-12 bg-gray-50">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          class="h-16 w-16 mx-auto text-gray-400 mb-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" 
          />
        </svg>
        <p class="text-xl text-gray-500">No orders found</p>
        <p class="text-gray-400 mt-2">There are currently no orders in the system</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'OrderPage',
  data() {
    return {
      orders: [],
      loading: true,
      error: null
    };
  },
  mounted() {
    this.fetchOrders();
  },
  methods: {
    async fetchOrders() {
      try {
        this.loading = true;
        const response = await axios.get('http://localhost:8080/api/orders');
        this.orders = response.data;
        this.loading = false;
      } catch (error) {
        console.error('Error fetching orders:', error);
        this.error = error.response 
          ? error.response.data.error 
          : 'Failed to load orders. Please try again later.';
        this.loading = false;
      }
    },
    refreshOrders() {
      this.fetchOrders();
    },
    viewOrderDetails(orderId) {
      // Ensure we navigate to the order details page
      this.$router.push({ 
        name: 'OrderDetails', 
        params: { id: orderId } 
      });
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    },
    getPaymentStatusClass(status) {
      switch(status) {
        case 'PAID':
          return 'bg-green-100 text-green-800';
        case 'PENDING':
          return 'bg-yellow-100 text-yellow-800';
        case 'FAILED':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
  }
}
</script>