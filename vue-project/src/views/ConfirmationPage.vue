<!-- src/views/ConfirmationPage.vue -->
<template>
  <div class="bg-gray-100 min-h-screen py-12">
    <div class="max-w-3xl mx-auto px-4">
      <div class="bg-white shadow-lg rounded-lg overflow-hidden">
        <!-- Success Header -->
        <div class="bg-green-500 text-white p-6 text-center">
          <div class="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold">Payment Successful!</h1>
          <p class="mt-1">Your order has been confirmed and is being processed.</p>
        </div>

        <!-- Order Details -->
        <div class="p-6">
          <div class="mb-6">
            <h2 class="text-xl font-bold mb-2">Order Information</h2>
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">Transaction ID</p>
                  <p class="font-medium">{{ confirmation?.transactionId || 'N/A' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Date</p>
                  <p class="font-medium">{{ formatDate(new Date()) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Payment Method</p>
                  <p class="font-medium">{{ formatPaymentMethod(confirmation?.paymentMethod) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Status</p>
                  <p class="font-medium text-green-600">Completed</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Items List -->
          <div class="mb-6">
            <h2 class="text-xl font-bold mb-2">Order Items</h2>
            <div class="border rounded-lg overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-if="!confirmation?.orderItems || confirmation.orderItems.length === 0">
                    <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                      No items in this order
                    </td>
                  </tr>
                  <tr v-for="(item, index) in confirmation?.orderItems || []" :key="index" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{{ item.name }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ item.quantity }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">${{ formatCurrency(item.price) }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">${{ formatCurrency(item.price * item.quantity) }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="mb-6">
            <h2 class="text-xl font-bold mb-2">Order Summary</h2>
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex justify-between font-bold text-lg">
                <span>Total Paid</span>
                <span>${{ formatCurrency(confirmation?.amount || 0) }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap gap-3">
            <button 
              @click="printReceipt" 
              class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Print Receipt
            </button>
            <button 
              @click="goToHome" 
              class="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    const confirmation = ref(null);
    
    onMounted(() => {
      console.log('ConfirmationPage component mounted');
      
      // Try to load confirmation data from localStorage
      const savedConfirmation = localStorage.getItem('confirmation');
      if (savedConfirmation) {
        try {
          confirmation.value = JSON.parse(savedConfirmation);
          console.log('Loaded confirmation data:', confirmation.value);
        } catch (err) {
          console.error('Error parsing confirmation data:', err);
          createDemoConfirmation();
        }
      } else {
        console.log('No confirmation data found, creating demo data');
        createDemoConfirmation();
      }
    });
    
    // Create demo confirmation data if needed
    const createDemoConfirmation = () => {
      confirmation.value = {
        transactionId: 'TXN' + Math.floor(Math.random() * 100000),
        amount: 153.85,
        paymentMethod: 'CARD',
        orderItems: [
          { name: 'Laptop', quantity: 1, price: 129.99 },
          { name: 'Mouse', quantity: 2, price: 13.50 }
        ],
        timestamp: new Date().toISOString()
      };
    };
    
    // Format currency values
    const formatCurrency = (value) => {
      return parseFloat(value).toFixed(2);
    };
    
    // Format date
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    // Format payment method for display
    const formatPaymentMethod = (method) => {
      if (!method) return 'N/A';
      
      switch (method.toUpperCase()) {
        case 'CARD':
          return 'Credit/Debit Card';
        case 'CASH':
          return 'Cash';
        default:
          return method;
      }
    };
    
    // Print the receipt
    const printReceipt = () => {
      window.print();
    };
    
    // Navigate to home page
    const goToHome = () => {
      // Clear any stored data
      localStorage.removeItem('confirmation');
      
      // Navigate to home
      router.push('/');
    };
    
    return {
      confirmation,
      formatCurrency,
      formatDate,
      formatPaymentMethod,
      printReceipt,
      goToHome
    };
  }
};
</script>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  #app, #app * {
    visibility: visible;
  }
  #app {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>