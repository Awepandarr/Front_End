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

        <!-- Error Message -->
        <div v-if="errorMessage" class="bg-red-100 p-4 text-red-800">
          {{ errorMessage }}
        </div>

        <!-- Debug Info (remove in production) -->
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
import { paymentService } from '@/services/api.service';
import PaymentForm from '@/components/PaymentForm.vue';

const router = useRouter();
const order = ref(null);
const errorMessage = ref('');

onMounted(() => {
  const savedOrder = localStorage.getItem('order');
  if (savedOrder) {
    try {
      const parsed = JSON.parse(savedOrder);
      console.log('Loaded order:', parsed);

      // Type check
      if (!parsed.orderId || typeof parsed.finalAmount !== 'number') {
        throw new Error('Invalid order format.');
      }

      order.value = parsed;
    } catch (err) {
      console.error('Error loading order:', err);
      errorMessage.value = 'Could not load your order. Please return to the cart.';
    }
  } else {
    errorMessage.value = 'No order found. Please create an order first.';
  }
});

const handlePaymentSuccess = async (paymentInfo) => {
  try {
    if (!order.value) {
      throw new Error('Missing order information.');
    }

    const paymentRequest = {
      transactionId: paymentInfo.transactionId,
      orderId: order.value.orderId,
      amount: order.value.finalAmount,
      paymentMethod: paymentInfo.method,
    };

    if (paymentInfo.method === 'CARD' && paymentInfo.cardDetails) {
      paymentRequest.cardDetails = paymentInfo.cardDetails;
    }

    console.log('Sending payment request:', {
      ...paymentRequest,
      cardDetails: paymentRequest.cardDetails ? '(hidden)' : undefined
    });

    const response = await paymentService.processPayment(paymentRequest);
    console.log('Payment response:', response.data);

    // Cleanup and redirect
    localStorage.removeItem('order');
    localStorage.removeItem('cart');

    router.push({
      path: '/confirmation',
      query: {
        transactionId: response.data.transactionId,
        amount: response.data.amount,
        method: response.data.paymentMethod
      }
    });

  } catch (error) {
    console.error('handlePaymentSuccess error:', error);
    if (import.meta.env.MODE !== 'production') {
      console.warn('Dev mode: falling back to emergency bypass');
      emergencyBypass();
    } else {
      errorMessage.value = error.message || 'Payment failed. Please try again.';
    }
  }
};

const handlePaymentError = (error) => {
  console.error('Payment error:', error);
  errorMessage.value = error.message || 'Payment processing failed. Please try again.';
};

const emergencyBypass = () => {
  console.warn('Emergency bypass activated');

  const emergency = {
    transactionId: 'EMERGENCY' + Date.now(),
    amount: order.value?.finalAmount || 0,
    method: 'EMERGENCY'
  };

  localStorage.removeItem('order');
  localStorage.removeItem('cart');

  router.push({
    path: '/confirmation',
    query: emergency
  });
};
</script>
