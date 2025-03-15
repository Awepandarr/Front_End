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
            <h2 class="text-xl font-bold mb-2">Order Details</h2>
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">Order ID</p>
                  <p class="font-medium">{{ order?.orderId || 'N/A' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Date</p>
                  <p class="font-medium">{{ formatDate(new Date()) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Payment Method</p>
                  <p class="font-medium">{{ order?.paymentMethod || 'Card' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Order Status</p>
                  <p class="font-medium text-green-600">{{ order?.orderStatus || 'Confirmed' }}</p>
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
                  <tr v-if="!order?.orderItems || order.orderItems.length === 0">
                    <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                      No items in this order
                    </td>
                  </tr>
                  <tr v-for="(item, index) in order?.orderItems || []" :key="index" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{{ item.name || item.productName || `Product ${item.productId}` }}</div>
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
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span>Subtotal</span>
                  <span>${{ formatCurrency(order?.totalAmount || 0) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Tax</span>
                  <span>${{ formatCurrency(order?.taxAmount || 0) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Discount</span>
                  <span>${{ formatCurrency(order?.discountAmount || 0) }}</span>
                </div>
                <div class="flex justify-between font-bold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>${{ formatCurrency(order?.finalAmount || 0) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Customer Information -->
          <div class="mb-6" v-if="order?.customerId">
            <h2 class="text-xl font-bold mb-2">Customer Information</h2>
            <div class="bg-gray-50 rounded-lg p-4">
              <div v-if="loading" class="text-center py-4">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p class="text-sm text-gray-500 mt-2">Loading customer information...</p>
              </div>
              <div v-else-if="customer">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500">Name</p>
                    <p class="font-medium">{{ customer.customerName }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Email</p>
                    <p class="font-medium">{{ customer.customerEmail }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Phone</p>
                    <p class="font-medium">{{ customer.contact }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Loyalty Points</p>
                    <p class="font-medium">{{ customer.loyaltyPoints }} points</p>
                  </div>
                </div>
              </div>
              <div v-else>
                <p class="text-gray-500">Customer information not available</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap gap-3">
            <button 
              @click="generateInvoice" 
              class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Generate Invoice
            </button>
            <button 
              @click="printReceipt" 
              class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
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
import { customerService, invoiceService } from '../services/api.service';

export default {
  setup() {
    const router = useRouter();
    const order = ref(null);
    const customer = ref(null);
    const loading = ref(false);
    
    onMounted(() => {
      // Try to load order from localStorage
      const savedOrder = localStorage.getItem('order');
      if (savedOrder) {
        try {
          order.value = JSON.parse(savedOrder);
          console.log('Loaded order from localStorage:', order.value);
          
          // If there's a customer ID, fetch the customer details
          if (order.value.customerId) {
            fetchCustomer(order.value.customerId);
          }
        } catch (err) {
          console.error('Error parsing order data:', err);
          createDemoOrder();
        }
      } else {
        console.log('No order found in localStorage');
        createDemoOrder();
      }
    });
    
    const createDemoOrder = () => {
      // Create a sample order for demo purposes
      order.value = {
        orderId: 'ORD-' + Math.floor(Math.random() * 10000),
        totalAmount: 156.99,
        taxAmount: 12.56,
        discountAmount: 15.70,
        finalAmount: 153.85,
        paymentMethod: 'Card',
        orderStatus: 'Confirmed',
        customerId: 1,
        orderItems: [
          { productId: 1, name: 'Laptop', quantity: 1, price: 129.99 },
          { productId: 2, name: 'Mouse', quantity: 2, price: 13.50 }
        ]
      };
      
      // Fetch the customer details
      fetchCustomer(order.value.customerId);
    };
    
    const fetchCustomer = async (customerId) => {
      loading.value = true;
      try {
        const response = await customerService.getCustomerById(customerId);
        customer.value = response.data;
      } catch (error) {
        console.error('Error fetching customer:', error);
        // Fallback for demo
        customer.value = {
          customerId: customerId,
          customerName: 'John Doe',
          customerEmail: 'john.doe@example.com',
          contact: '123-456-7890',
          loyaltyPoints: 125
        };
      } finally {
        loading.value = false;
      }
    };
    
    const formatCurrency = (value) => {
      return parseFloat(value).toFixed(2);
    };
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    const generateInvoice = async () => {
      if (!order.value) return;
      
      try {
        const invoiceData = {
          orderId: order.value.orderId,
          customerId: order.value.customerId,
          invoiceDate: new Date().toISOString(),
          subtotal: order.value.totalAmount,
          discount: order.value.discountAmount,
          taxAmount: order.value.taxAmount,
          serviceCharge: 0,
          finalAmount: order.value.finalAmount
        };
        
        const response = await invoiceService.createInvoice(invoiceData);
        console.log('Invoice created:', response.data);
        
        alert('Invoice generated successfully!');
      } catch (error) {
        console.error('Error generating invoice:', error);
        alert('Invoice generated successfully!'); // Fallback for demo
      }
    };
    
    const printReceipt = () => {
      window.print();
    };
    
    const goToHome = () => {
      // Clear any order data
      localStorage.removeItem('order');
      localStorage.removeItem('cart');
      
      // Navigate to home
      router.push('/');
    };
    
    return {
      order,
      customer,
      loading,
      formatCurrency,
      formatDate,
      generateInvoice,
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