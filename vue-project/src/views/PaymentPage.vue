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
import { invoiceService } from '@/services/api.service';
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
    } catch (error) {
      console.error('Error parsing order:', error);
      errorMessage.value = 'Unable to load order details. Please try again.';
    }
  } else {
    errorMessage.value = 'No order found. Please create an order first.';
  }
});

const handlePaymentSuccess = async (paymentInfo) => {
  try {
    // Create invoice
    const invoiceData = {
      orderId: order.value.orderId,
      customerId: order.value.customerId || 1,
      invoiceDate: new Date().toISOString(),
      subtotal: order.value.totalAmount,
      discount: order.value.discountAmount || 0,
      taxAmount: order.value.taxAmount,
      serviceCharge: 0,
      finalAmount: order.value.finalAmount
    };

    await invoiceService.generateInvoice(invoiceData);

    // Clear local storage
    localStorage.removeItem('order');
    localStorage.removeItem('cart');

    // Navigate to confirmation page with payment details
    router.push({
      path: '/confirmation',
      query: {
        transactionId: paymentInfo.transactionId,
        amount: paymentInfo.amount,
        method: paymentInfo.method
      }
    });
  } catch (error) {
    console.error('Invoice generation error:', error);
    errorMessage.value = 'Payment successful, but invoice generation failed.';
  }
};

const handlePaymentError = (error) => {
  errorMessage.value = error.message || 'Payment processing failed. Please try again.';
};
</script>