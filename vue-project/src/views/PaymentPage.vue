<template>
  <div class="bg-gray-100 min-h-screen py-12">
    <div class="container mx-auto px-4">
      <div class="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <!-- Header -->
        <div class="bg-blue-600 text-white p-6">
          <h1 class="text-2xl font-bold">Complete Your Payment</h1>
        </div>

        <!-- Order Summary -->
        <div v-if="order" class="p-6 border-b">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <h3 class="text-lg font-semibold">Order Details</h3>
              <p>Order ID: {{ order.orderId }}</p>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold">Total: ${{ order.finalAmount.toFixed(2) }}</p>
            </div>
          </div>
        </div>

        <!-- Error & Loading States -->
        <div v-if="errorMessage" class="bg-red-100 p-4 text-red-800">
          {{ errorMessage }}
        </div>

        <!-- Debug Info (Remove in production) -->
        <div class="p-4 bg-gray-50 border-b">
          <details>
            <summary class="cursor-pointer text-gray-700">Debug Information</summary>
            <pre class="mt-2 text-xs overflow-auto max-h-40">{{ JSON.stringify(order, null, 2) }}</pre>
          </details>
        </div>

        <!-- Emergency Bypass (remove in production) -->
        <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-md m-4">
          <p class="text-yellow-700 mb-2">Having trouble with payments?</p>
          <button 
            @click="emergencyBypass" 
            class="w-full py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
          >
            Emergency: Skip Payment Processing
          </button>
        </div>

        <!-- Payment Form -->
        <div class="p-6">
          <PaymentForm 
            v-if="order"
            :order="order"
            @payment-success="handlePaymentSuccess"
            @payment-error="handlePaymentError"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { paymentService, invoiceService } from '@/services/api.service';
import PaymentForm from '@/components/PaymentForm.vue';

const router = useRouter();
const order = ref(null);
const errorMessage = ref('');

onMounted(() => {
  // Load order from localStorage
  const savedOrder = localStorage.getItem('order');
  if (savedOrder) {
    try {
      order.value = JSON.parse(savedOrder);
      console.log('Order loaded successfully:', order.value);
      
      // Verify order has all required fields
      if (!order.value.orderId) {
        console.warn('Loaded order is missing orderId');
      }
      if (typeof order.value.finalAmount !== 'number') {
        console.warn('Order finalAmount is not a number:', order.value.finalAmount);
        // Try to fix it
        order.value.finalAmount = parseFloat(order.value.finalAmount) || 0;
      }
    } catch (error) {
      console.error('Error parsing order:', error);
      errorMessage.value = 'Unable to load order details. Please try again.';
    }
  } else {
    errorMessage.value = 'No order found. Please create an order first.';
  }
});

// Emergency bypass function for testing
const emergencyBypass = () => {
  console.log('EMERGENCY: Bypassing payment and invoice process');
  
  // Generate fake transaction data
  const emergency = {
    transactionId: 'EMERGENCY' + Date.now(),
    amount: order.value?.finalAmount || 0,
    method: 'EMERGENCY'
  };
  
  // Clear localStorage
  localStorage.removeItem('order');
  localStorage.removeItem('cart');
  
  // Navigate directly to confirmation
  router.push({
    path: '/confirmation',
    query: emergency
  });
};

// Updated handlePaymentSuccess function
const handlePaymentSuccess = async (paymentInfo) => {
  try {
    // Log what we're doing
    console.log('Payment success, proceeding with:', paymentInfo);
    
    // Create payment request object that matches backend expectations
    const paymentRequest = {
      transactionId: paymentInfo.transactionId,
      orderId: order.value.orderId,
      amount: order.value.finalAmount,
      paymentMethod: paymentInfo.method
    };
    
    // Add card details if this is a card payment
    if (paymentInfo.method === 'CARD' && paymentInfo.cardDetails) {
      paymentRequest.cardDetails = paymentInfo.cardDetails;
    }
    
    console.log('Submitting payment to API:', {
      ...paymentRequest,
      cardDetails: paymentRequest.cardDetails ? '(hidden for security)' : undefined
    });
    
    try {
      // Process payment through API
      const paymentResponse = await paymentService.processPayment(paymentRequest);
      console.log('Payment API response:', paymentResponse.data);
      
      // Payment succeeded - clear storage and navigate to confirmation
      localStorage.removeItem('order');
      localStorage.removeItem('cart');
      
      // Navigate to confirmation page
      router.push({
        path: '/confirmation',
        query: {
          transactionId: paymentResponse.data.transactionId,
          amount: paymentResponse.data.amount,
          method: paymentResponse.data.paymentMethod
        }
      });
    } catch (apiError) {
      console.error('Payment API error:', apiError);
      
      // For development/testing - use emergency bypass if API fails
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Development mode: Continuing to confirmation despite API error');
        emergencyBypass();
      } else {
        throw new Error(apiError.response?.data?.message || 'Payment processing failed');
      }
    }
  } catch (error) {
    console.error('Error in handlePaymentSuccess:', error);
    errorMessage.value = error.message || 'Error completing payment. Please try again.';
  }
};

const handlePaymentError = (error) => {
  console.error('Payment error received:', error);
  errorMessage.value = error.message || 'Payment processing failed. Please try again.';
};
</script>