<template>
  <div class="container mx-auto px-4 py-8">
    <div class="bg-white shadow-xl rounded-lg overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-white">
          Order Items 
          <span v-if="orderId" class="text-sm ml-2">(Order #{{ orderId }})</span>
        </h1>
        <div class="flex items-center space-x-4">
          <!-- Refresh Button -->
          <button 
            @click="fetchOrderItems" 
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
      
      <!-- Order Items Table -->
      <div v-else-if="orderItems.length" class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Item ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr 
              v-for="item in orderItems" 
              :key="item.orderItemId"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.orderItemId }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ item.productId }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ item.productName || 'Unknown Product' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                {{ item.quantity }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                {{ formatCurrency(item.price) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                {{ formatCurrency(item.subtotal) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right">
                <button 
                  @click="viewOrderItemDetails(item)"
                  class="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  View Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- No Order Items State -->
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
        <p class="text-xl text-gray-500">No order items found</p>
        <p class="text-gray-400 mt-2">There are no items for this order</p>
      </div>
    </div>

    <!-- Order Item Details Modal -->
    <div 
      v-if="selectedOrderItem" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Order Item Details</h2>
          <button 
            @click="selectedOrderItem = null"
            class="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="space-y-2">
          <p><strong>Order Item ID:</strong> {{ selectedOrderItem.orderItemId }}</p>
          <p><strong>Product ID:</strong> {{ selectedOrderItem.productId }}</p>
          <p><strong>Product Name:</strong> {{ selectedOrderItem.productName || 'Unknown Product' }}</p>
          <p><strong>Quantity:</strong> {{ selectedOrderItem.quantity }}</p>
          <p><strong>Price:</strong> {{ formatCurrency(selectedOrderItem.price) }}</p>
          <p><strong>Subtotal:</strong> {{ formatCurrency(selectedOrderItem.subtotal) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'OrderItemsPage',
  data() {
    return {
      orderItems: [],
      loading: true,
      error: null,
      selectedOrderItem: null,
      orderId: null
    };
  },
  methods: {
    async fetchOrderItems() {
      try {
        this.loading = true;
        let response;
        
        // If orderId is specified, fetch items for that specific order
        if (this.orderId) {
          response = await axios.get(`http://localhost:8080/api/order/${this.orderId}/items`);
        } else {
          // Otherwise, fetch all order items
          response = await axios.get('http://localhost:8080/api/orderitems');
        }
        
        this.orderItems = response.data;
        this.loading = false;
      } catch (error) {
        console.error('Error fetching order items:', error);
        this.error = error.response?.data?.error || 'Failed to load order items';
        this.loading = false;
      }
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    },
    viewOrderItemDetails(item) {
      this.selectedOrderItem = item;
    }
  },
  created() {
    // Check if an order ID is passed in the route
    this.orderId = this.$route.params.orderId ? parseInt(this.$route.params.orderId) : null;
    this.fetchOrderItems();
  }
}
</script>