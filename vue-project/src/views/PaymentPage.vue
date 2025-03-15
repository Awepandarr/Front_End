<template>
  <div class="bg-gray-100 min-h-screen py-12">
    <div class="max-w-3xl mx-auto">
      <div class="bg-white shadow-lg rounded-lg overflow-hidden">
        <!-- Header -->
        <div class="bg-blue-600 text-white p-6">
          <h1 class="text-2xl font-bold">Payment</h1>
          <p>Complete your purchase securely</p>
        </div>

        <!-- System Messages -->
        <div v-if="errorMessage" class="bg-red-100 border-l-4 border-red-500 p-4">
          <p class="text-red-700">{{ errorMessage }}</p>
        </div>
        <div v-if="successMessage" class="bg-green-100 border-l-4 border-green-500 p-4">
          <p class="text-green-700">{{ successMessage }}</p>
        </div>

        <!-- Content -->
        <div class="p-6">
          <!-- Order Summary -->
          <section class="mb-8">
            <h2 class="text-xl font-bold mb-4">Order Summary</h2>
            <div v-if="!order" class="text-center py-8 text-red-500">
              <p>No order information found.</p>
              <button 
                @click="goToHome" 
                class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Return to Home
              </button>
            </div>
            <div v-else class="bg-gray-50 rounded-lg p-4">
              <div class="border-b pb-4 mb-4">
                <div 
                  v-for="(item, index) in order.orderItems" 
                  :key="index" 
                  class="flex justify-between items-center mb-2"
                >
                  <div>
                    <span class="font-medium">{{ item.quantity }}x</span> 
                    {{ item.productName || `Product ${item.productId}` }}
                  </div>
                  <div class="font-medium">
                    ${{ (item.price * item.quantity).toFixed(2) }}
                  </div>
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
          </section>

          <!-- Payment Section -->
          <section v-if="order">
            <PaymentForm 
              :order="order" 
              ref="paymentFormRef"
              @payment-success="handlePaymentSuccess" 
              @payment-error="handlePaymentError" 
            />
          </section>

          <!-- Cancel/Back Navigation -->
          <div class="mt-6 flex justify-between">
            <button 
              @click="goToHome" 
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel Payment
            </button>
            <button 
              @click="proceedWithPayment"
              :disabled="!paymentFormRef || !paymentFormRef.isPaymentValid"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Confirm Payment
            </button>
          </div>
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
const paymentFormRef = ref(null);
const errorMessage = ref('');
const successMessage = ref('');

onMounted(() => {
  // Load order from localStorage
  const savedOrder = localStorage.getItem('order');
  if (savedOrder) {
    try {
      order.value = JSON.parse(savedOrder);
    } catch (error) {
      console.error('Error parsing order:', error);
      errorMessage.value = 'Failed to load order details.';
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
      invoiceDate: new Date().toISOString(),
      subtotal: order.value.totalAmount,
      taxAmount: order.value.taxAmount,
      discount: order.value.discountAmount,
      finalAmount: order.value.finalAmount
    };

    await invoiceService.generateInvoice(invoiceData);

    // Clear local storage
    localStorage.removeItem('order');
    localStorage.removeItem('cart');

    // Navigate to confirmation page
    router.push({
      path: '/confirmation',
      query: {
        transactionId: paymentInfo.transactionId,
        amount: paymentInfo.amount,
        method: paymentInfo.paymentMethod
      }
    });
  } catch (error) {
    console.error('Invoice generation error:', error);
    errorMessage.value = 'Payment successful, but invoice generation failed.';
  }
};

const handlePaymentError = (error) => {
  errorMessage.value = error.message || 'Payment processing failed';
};

const goToHome = () => {
  router.push('/');
};

const proceedWithPayment = () => {
  if (paymentFormRef.value) {
    paymentFormRef.value.processPayment();
  }
};
</script>