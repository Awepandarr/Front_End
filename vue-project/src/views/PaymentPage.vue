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
          <!-- Order Summary -->
          <div class="mb-8">
            <h2 class="text-xl font-bold mb-4">Order Summary</h2>
            <div class="bg-gray-50 rounded-lg p-4">
              <div v-if="!order" class="text-center py-8 text-red-500">
                <p>No order information found.</p>
                <button @click="goToHome" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
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

          <!-- System Messages -->
          <div v-if="errorMessage" class="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong class="font-bold">Error!</strong>
            <span class="block sm:inline"> {{ errorMessage }}</span>
          </div>

          <div v-if="successMessage" class="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <strong class="font-bold">Success!</strong>
            <span class="block sm:inline"> {{ successMessage }}</span>
          </div>

          <!-- Payment Method Selection -->
          <div class="mb-8">
            <h2 class="text-xl font-bold mb-4">Payment Method</h2>
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div 
                class="border rounded-lg p-4 cursor-pointer"
                :class="{'border-blue-500 bg-blue-50': paymentMethod === 'CARD'}"
                @click="paymentMethod = 'CARD'"
              >
                <div class="flex items-center">
                  <div class="bg-blue-100 rounded-full p-2 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-bold">Credit/Debit Card</h3>
                    <p class="text-sm text-gray-500">Pay with credit or debit card</p>
                  </div>
                </div>
              </div>
              <div 
                class="border rounded-lg p-4 cursor-pointer"
                :class="{'border-blue-500 bg-blue-50': paymentMethod === 'CASH'}"
                @click="paymentMethod = 'CASH'"
              >
                <div class="flex items-center">
                  <div class="bg-green-100 rounded-full p-2 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-bold">Cash</h3>
                    <p class="text-sm text-gray-500">Pay with cash</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card Payment Form (shown when card is selected) -->
          <div v-if="paymentMethod === 'CARD'" class="mb-8">
            <h3 class="font-bold mb-4">Card Details</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input 
                  type="text" 
                  v-model="cardDetails.cardNumber" 
                  placeholder="1234 5678 9012 3456" 
                  class="w-full p-3 border rounded-md"
                  :class="{'border-red-500': errors.cardNumber}"
                >
                <p v-if="errors.cardNumber" class="text-red-500 text-sm mt-1">{{ errors.cardNumber }}</p>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input 
                    type="text" 
                    v-model="cardDetails.expiry" 
                    placeholder="MM/YY" 
                    class="w-full p-3 border rounded-md"
                    :class="{'border-red-500': errors.expiry}"
                  >
                  <p v-if="errors.expiry" class="text-red-500 text-sm mt-1">{{ errors.expiry }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                  <input 
                    type="text" 
                    v-model="cardDetails.cvc" 
                    placeholder="123" 
                    class="w-full p-3 border rounded-md"
                    :class="{'border-red-500': errors.cvc}"
                  >
                  <p v-if="errors.cvc" class="text-red-500 text-sm mt-1">{{ errors.cvc }}</p>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                <input 
                  type="text" 
                  v-model="cardDetails.cardholderName" 
                  placeholder="John Doe" 
                  class="w-full p-3 border rounded-md"
                  :class="{'border-red-500': errors.cardholderName}"
                >
                <p v-if="errors.cardholderName" class="text-red-500 text-sm mt-1">{{ errors.cardholderName }}</p>
              </div>
            </div>
          </div>

          <!-- Cash Payment (shown when cash is selected) -->
          <div v-if="paymentMethod === 'CASH'" class="mb-8">
            <h3 class="font-bold mb-4">Cash Payment</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Amount Tendered</label>
                <input 
                  type="number" 
                  v-model="cashAmount" 
                  class="w-full p-3 border rounded-md"
                  :class="{'border-red-500': errors.cashAmount}"
                >
                <p v-if="errors.cashAmount" class="text-red-500 text-sm mt-1">{{ errors.cashAmount }}</p>
              </div>
              <div v-if="cashAmount > 0 && order">
                <label class="block text-sm font-medium text-gray-700 mb-1">Change</label>
                <div class="p-3 bg-gray-100 rounded-md font-bold">
                  ${{ calculateChange() }}
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex space-x-4">
            <button 
              @click="goToHome" 
              class="flex-1 py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              @click="processPayment" 
              class="flex-1 py-3 bg-blue-600 rounded-md text-white font-medium hover:bg-blue-700"
              :disabled="processing"
            >
              <span v-if="processing">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
              <span v-else>Complete Payment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { paymentService, orderService } from '../services/api.service';

export default {
  name: 'PaymentPage',
  setup() {
    const router = useRouter();
    const order = ref(null);
    const paymentMethod = ref('CARD');
    const processing = ref(false);
    const errors = ref({});
    const errorMessage = ref('');
    const successMessage = ref('');
    
    const cardDetails = ref({
      cardNumber: '',
      expiry: '',
      cvc: '',
      cardholderName: ''
    });
    
    const cashAmount = ref(0);

    onMounted(() => {
      // Try to load order from localStorage
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

    // Reset error message when payment method changes
    watch(paymentMethod, () => {
      errorMessage.value = '';
      errors.value = {};
    });

    const calculateChange = () => {
      if (!order.value || !cashAmount.value) return '0.00';
      const change = cashAmount.value - order.value.finalAmount;
      return change > 0 ? change.toFixed(2) : '0.00';
    };

    const validateCardDetails = () => {
      errors.value = {};
      let valid = true;

      // Card number validation (16 digits, possibly with spaces)
      if (!cardDetails.value.cardNumber) {
        errors.value.cardNumber = 'Card number is required';
        valid = false;
      } else if (!/^\d{16}$/.test(cardDetails.value.cardNumber.replace(/\s/g, ''))) {
        errors.value.cardNumber = 'Please enter a valid 16-digit card number';
        valid = false;
      }

      // Expiry date validation (MM/YY format)
      if (!cardDetails.value.expiry) {
        errors.value.expiry = 'Expiry date is required';
        valid = false;
      } else if (!/^\d{2}\/\d{2}$/.test(cardDetails.value.expiry)) {
        errors.value.expiry = 'Please enter a valid expiry date (MM/YY)';
        valid = false;
      } else {
        // Additional validation for expiry date
        const [month, year] = cardDetails.value.expiry.split('/');
        const expiryMonth = parseInt(month, 10);
        const expiryYear = parseInt('20' + year, 10);
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        
        if (expiryMonth < 1 || expiryMonth > 12) {
          errors.value.expiry = 'Invalid month in expiry date';
          valid = false;
        }         else if (expiryYear < currentYear || 
            (expiryYear === currentYear && expiryMonth < currentMonth)) {
          errors.value.expiry = 'Card has expired';
          valid = false;
        }
      }

      // CVC validation (3-4 digits)
      if (!cardDetails.value.cvc) {
        errors.value.cvc = 'CVC is required';
        valid = false;
      } else if (!/^\d{3,4}$/.test(cardDetails.value.cvc)) {
        errors.value.cvc = 'Please enter a valid CVC (3-4 digits)';
        valid = false;
      }

      // Cardholder name validation
      if (!cardDetails.value.cardholderName) {
        errors.value.cardholderName = 'Cardholder name is required';
        valid = false;
      }

      return valid;
    };

    const validateCashPayment = () => {
      errors.value = {};
      let valid = true;

      if (!cashAmount.value || cashAmount.value <= 0) {
        errors.value.cashAmount = 'Please enter a valid amount';
        valid = false;
      } else if (order.value && cashAmount.value < order.value.finalAmount) {
        errors.value.cashAmount = 'Amount must be at least equal to the total';
        valid = false;
      }

      return valid;
    };

    const processPayment = async () => {
      // Reset messages
      errorMessage.value = '';
      successMessage.value = '';
      
      // Validate order exists
      if (!order.value) {
        errorMessage.value = 'No order information found.';
        return;
      }

      // Validate based on payment method
      let isValid = paymentMethod.value === 'CARD' 
        ? validateCardDetails() 
        : validateCashPayment();

      if (!isValid) return;

      processing.value = true;

      try {
        // Generate a unique transaction ID
        const transactionId = 'TXN' + Date.now();
        
        // Create payment data
        const paymentData = {
          transactionId: transactionId,
          orderId: order.value.orderId,
          amount: order.value.finalAmount,
          paymentMethod: paymentMethod.value,
          paymentType: paymentMethod.value
        };

        // Add additional card details for card payments
        if (paymentMethod.value === 'CARD') {
          paymentData.cardDetails = {
            ...cardDetails.value,
            cardNumber: cardDetails.value.cardNumber.replace(/\s/g, '') // Remove spaces
          };
        }

        console.log('Sending payment data:', paymentData);

        // Process the payment
        const paymentResponse = await paymentService.processPayment(paymentData);
        console.log('Payment response:', paymentResponse.data);
        
        // Payment successful
        successMessage.value = 'Payment processed successfully!';
        
        // Clear localStorage
        localStorage.removeItem('cart');
        localStorage.removeItem('order');
        
        // Allow success message to be shown briefly before redirecting
        setTimeout(() => {
          // Navigate to confirmation page
          router.push('/confirmation');
        }, 1500);
      } catch (error) {
        console.error('Payment error:', error);
        
        // Extract the most useful error message
        let detailedMessage = 'There was an error processing your payment.';
        
        if (error.response && error.response.data) {
          if (typeof error.response.data === 'string') {
            // Try to parse JSON string
            try {
              const errorData = JSON.parse(error.response.data);
              if (errorData.message) {
                detailedMessage = errorData.message;
              }
            } catch (e) {
              // If it's not JSON, use the raw string
              detailedMessage = error.response.data;
            }
          } else if (error.response.data.message) {
            // If it's already a JSON object
            detailedMessage = error.response.data.message;
          }
        }
        
        // Set appropriate error message
        errorMessage.value = detailedMessage;
        
        // Check for specific database constraint error
        if (error.response && error.response.status === 500 && 
            error.response.data && error.response.data.includes('CHECK constraint failed')) {
          errorMessage.value = 'Payment type validation failed. Please contact support.';
        }
        
        // If the issue is specifically with the payment endpoint
        if (error.response && error.response.status === 404 && 
            error.config.url.includes('/api/payment')) {
          errorMessage.value = 'Payment service unavailable. Please try again later or contact support.';
        }
      } finally {
        processing.value = false;
      }
    };

    const goToHome = () => {
      router.push('/');
    };

    return {
      order,
      paymentMethod,
      cardDetails,
      cashAmount,
      processing,
      errors,
      errorMessage,
      successMessage,
      calculateChange,
      processPayment,
      goToHome
    };
  }
};
</script>