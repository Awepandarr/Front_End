<!-- src/views/PaymentPage.vue -->
<template>
  <div class="bg-gray-100 min-h-screen py-12">
    <div class="max-w-3xl mx-auto">
      <div class="bg-white shadow-lg rounded-lg overflow-hidden">
        <!-- Header -->
        <div class="bg-blue-600 text-white p-6">
          <h1 class="text-2xl font-bold">Payment</h1>
          <p>Complete your purchase</p>
        </div>

        <!-- Content -->
        <div class="p-6">
          <!-- System Messages -->
          <div v-if="errorMessage" class="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong class="font-bold">Error!</strong>
            <span class="block sm:inline"> {{ errorMessage }}</span>
            <span class="absolute top-0 bottom-0 right-0 px-4 py-3" @click="errorMessage = ''">
              <svg class="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
              </svg>
            </span>
          </div>

          <div v-if="successMessage" class="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <strong class="font-bold">Success!</strong>
            <span class="block sm:inline"> {{ successMessage }}</span>
            <span class="absolute top-0 bottom-0 right-0 px-4 py-3" @click="successMessage = ''">
              <svg class="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
              </svg>
            </span>
          </div>

          <!-- Order Summary -->
          <div class="mb-8">
            <h2 class="text-xl font-bold mb-4">Order Summary</h2>
            <div class="bg-gray-50 rounded-lg p-4">
              <div v-if="!order" class="text-center py-8 text-red-500">
                <p>No order information found.</p>
                <button @click="goToHome" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                  Return to Home
                </button>
              </div>
              <div v-else>
                <div class="border-b pb-4 mb-4">
                  <div v-for="(item, index) in order.orderItems" :key="index" class="flex justify-between items-center mb-2">
                    <div>
                      <span class="font-medium">{{ item.quantity }}x</span> {{ item.productName || 'Product ' + item.productId }}
                    </div>
                    <div class="font-medium">${{ (item.price * item.quantity).toFixed(2) }}</div>
                  </div>
                </div>
                
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span>Subtotal</span>
                    <span>${{ order.totalAmount.toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Tax</span>
                    <span>${{ order.taxAmount.toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Discount</span>
                    <span>${{ order.discountAmount.toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>${{ order.finalAmount.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Form -->
          <div v-if="order">
            <PaymentForm 
              :order="order" 
              @payment-success="handlePaymentSuccess" 
              @payment-error="handlePaymentError" 
            />
          </div>

          <!-- Cancel Button -->
          <div class="mt-4">
            <button 
              @click="goToHome" 
              class="w-full p-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
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
import PaymentForm from '@/components/PaymentForm.vue';

export default {
  name: 'PaymentPage',
  
  components: {
    PaymentForm
  },
  
  setup() {
    const router = useRouter();
    const order = ref(null);
    const errorMessage = ref('');
    const successMessage = ref('');
    
    onMounted(() => {
      // Load order from localStorage
      const savedOrder = localStorage.getItem('order');
      if (savedOrder) {
        try {
          order.value = JSON.parse(savedOrder);
          console.log('Loaded order from localStorage:', order.value);
        } catch (e) {
          console.error('Error parsing order from localStorage:', e);
          errorMessage.value = 'Error loading order information.';
        }
      } else {
        console.error('No order found in localStorage');
        errorMessage.value = 'No order information found. Please create an order first.';
      }
    });
    
    const handlePaymentSuccess = (paymentInfo) => {
      successMessage.value = `Payment processed successfully! Transaction ID: ${paymentInfo.transactionId}`;
      
      // Clear cart and order from localStorage
      localStorage.removeItem('cart');
      
      // Keep order in localStorage for confirmation page
      // We'll remove it after displaying the confirmation
      
      // Redirect to confirmation page after a brief delay
      setTimeout(() => {
        router.push('/confirmation');
      }, 1500);
    };
    
    const handlePaymentError = (error) => {
      errorMessage.value = error.message || 'An error occurred during payment processing';
    };
    
    const goToHome = () => {
      router.push('/');
    };
    
    return {
      order,
      errorMessage,
      successMessage,
      handlePaymentSuccess,
      handlePaymentError,
      goToHome
    };
  }
};
</script>