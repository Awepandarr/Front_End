<!-- src/views/PaymentPage.vue -->
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

        <!-- Loading Indicator -->
        <div v-if="loading" class="p-12 text-center">
          <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-500">Processing your payment...</p>
        </div>

        <!-- Content -->
        <div v-else class="p-6">
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
              <!-- Items Summary -->
              <div class="border-b pb-4 mb-4">
                <div 
                  v-for="(item, index) in order.orderItems" 
                  :key="index" 
                  class="flex justify-between items-center mb-2"
                >
                  <div>
                    <span class="font-medium">{{ item.quantity }}x</span> 
                    {{ item.name }}
                  </div>
                  <div class="font-medium">
                    ${{ (item.price * item.quantity).toFixed(2) }}
                  </div>
                </div>
              </div>
              
              <!-- Order Totals -->
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span>Subtotal</span>
                  <span>${{ order.totalAmount?.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Tax</span>
                  <span>${{ order.taxAmount?.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Discount</span>
                  <span>${{ order.discountAmount?.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>${{ order.finalAmount?.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Payment Method Selection -->
          <section v-if="order" class="mb-8">
            <h2 class="text-xl font-bold mb-4">Payment Method</h2>
            <div class="grid grid-cols-2 gap-4">
              <!-- Cash Payment Option -->
              <div 
                class="border rounded-lg p-4 cursor-pointer transition-all duration-300"
                :class="{
                  'border-green-500 bg-green-50 shadow-md': paymentMethod === 'CASH',
                  'border-gray-300 hover:border-green-300 hover:bg-green-50': paymentMethod !== 'CASH'
                }"
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
                    <p class="text-sm text-gray-500">Pay with physical currency</p>
                  </div>
                </div>
              </div>
              
              <!-- Card Payment Option -->
              <div 
                class="border rounded-lg p-4 cursor-pointer transition-all duration-300"
                :class="{
                  'border-blue-500 bg-blue-50 shadow-md': paymentMethod === 'CARD',
                  'border-gray-300 hover:border-blue-300 hover:bg-blue-50': paymentMethod !== 'CARD'
                }"
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
                    <p class="text-sm text-gray-500">Secure card payment</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Cash Payment Section -->
          <section v-if="paymentMethod === 'CASH' && order" class="mb-8">
            <h2 class="text-xl font-bold mb-4">Cash Payment</h2>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Cash Tendered</label>
                <div class="relative">
                  <span class="absolute left-3 top-3 text-gray-500">$</span>
                  <input 
                    v-model="cashAmount" 
                    type="text"
                    @input="formatCashAmount"
                    placeholder="Enter amount"
                    class="w-full p-3 pl-8 border rounded-md"
                  />
                </div>
                <p v-if="cashAmountError" class="text-red-500 text-sm mt-1">
                  {{ cashAmountError }}
                </p>
              </div>
              
              <div v-if="changeAmount > 0" class="bg-green-50 p-3 rounded-md">
                <div class="flex justify-between items-center">
                  <span class="text-green-700">Change Due:</span>
                  <span class="text-xl font-bold text-green-800">${{ changeAmount.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Card Payment Section -->
          <section v-if="paymentMethod === 'CARD' && order" class="mb-8">
            <h2 class="text-xl font-bold mb-4">Card Details</h2>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <div class="relative">
                    <input 
                      v-model="cardDetails.cardNumber" 
                      @input="formatCardNumber"
                      type="text" 
                      placeholder="1234 5678 9012 3456" 
                      class="w-full p-3 border rounded-md"
                      :class="{'border-red-500': cardErrors.cardNumber}"
                      maxlength="19"
                    />
                    <div class="absolute right-3 top-3 text-gray-400">
                      <!-- Card type icon would go here -->
                    </div>
                  </div>
                  <p v-if="cardErrors.cardNumber" class="text-red-500 text-sm mt-1">
                    {{ cardErrors.cardNumber }}
                  </p>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input 
                      v-model="cardDetails.expiryDate" 
                      @input="formatExpiryDate"
                      type="text" 
                      placeholder="MM/YY" 
                      class="w-full p-3 border rounded-md"
                      :class="{'border-red-500': cardErrors.expiryDate}"
                      maxlength="5"
                    />
                    <p v-if="cardErrors.expiryDate" class="text-red-500 text-sm mt-1">
                      {{ cardErrors.expiryDate }}
                    </p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                    <input 
                      v-model="cardDetails.cvc" 
                      @input="formatCVC"
                      type="text" 
                      placeholder="123" 
                      class="w-full p-3 border rounded-md"
                      :class="{'border-red-500': cardErrors.cvc}"
                      maxlength="4"
                    />
                    <p v-if="cardErrors.cvc" class="text-red-500 text-sm mt-1">
                      {{ cardErrors.cvc }}
                    </p>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                  <input 
                    v-model="cardDetails.cardholderName"
                    type="text"
                    placeholder="John Doe"
                    class="w-full p-3 border rounded-md"
                    :class="{'border-red-500': cardErrors.cardholderName}"
                  />
                  <p v-if="cardErrors.cardholderName" class="text-red-500 text-sm mt-1">
                    {{ cardErrors.cardholderName }}
                  </p>
                </div>
              </div>
            </div>
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
              @click="processPayment"
              :disabled="!canProcessPayment"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete Payment
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
import { paymentService, invoiceService } from '@/services/api.service';

export default {
  setup() {
    const router = useRouter();
    const order = ref(null);
    const loading = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');
    const paymentMethod = ref('');
    
    // Cash payment
    const cashAmount = ref('');
    const cashAmountError = ref('');
    
    // Card payment
    const cardDetails = ref({
      cardNumber: '',
      expiryDate: '',
      cvc: '',
      cardholderName: ''
    });
    
    const cardErrors = ref({
      cardNumber: '',
      expiryDate: '',
      cvc: '',
      cardholderName: ''
    });

    // Load order from localStorage
    onMounted(() => {
      console.log('PaymentPage component mounted');
      
      const savedOrder = localStorage.getItem('order');
      if (savedOrder) {
        try {
          order.value = JSON.parse(savedOrder);
          console.log('Loaded order from localStorage:', order.value);
          
          // Set initial payment method from the order if available
          if (order.value.paymentMethod) {
            paymentMethod.value = order.value.paymentMethod;
            console.log('Using payment method from order:', paymentMethod.value);
          }
        } catch (error) {
          console.error('Error parsing order:', error);
          errorMessage.value = 'Failed to load order details.';
        }
      } else {
        errorMessage.value = 'No order found. Please create an order first.';
      }
    });
    
    // Format cash amount input (allow only numbers and decimal point)
    const formatCashAmount = () => {
      cashAmount.value = cashAmount.value.replace(/[^\d.]/g, '');
      
      // Ensure only one decimal point
      const parts = cashAmount.value.split('.');
      if (parts.length > 2) {
        cashAmount.value = parts[0] + '.' + parts.slice(1).join('');
      }
    };
    
    // Compute change amount when paying with cash
    const changeAmount = computed(() => {
      if (!order.value || !cashAmount.value) return 0;
      
      const amount = parseFloat(cashAmount.value) || 0;
      const orderTotal = order.value.finalAmount || 0;
      
      return Math.max(0, amount - orderTotal);
    });
    
    // Format card number input (add spaces every 4 digits)
    const formatCardNumber = () => {
      let value = cardDetails.value.cardNumber.replace(/\D/g, '');
      let formattedValue = '';
      
      for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formattedValue += ' ';
        }
        formattedValue += value[i];
      }
      
      cardDetails.value.cardNumber = formattedValue.trim();
    };
    
    // Format expiry date input (add slash after 2 digits)
    const formatExpiryDate = () => {
      let value = cardDetails.value.expiryDate.replace(/\D/g, '');
      
      if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2);
      }
      
      cardDetails.value.expiryDate = value;
    };
    
    // Format CVC input (numbers only)
    const formatCVC = () => {
      cardDetails.value.cvc = cardDetails.value.cvc.replace(/\D/g, '');
    };
    
    // Validate card details
    const validateCardDetails = () => {
      let isValid = true;
      
      // Reset errors
      cardErrors.value = {
        cardNumber: '',
        expiryDate: '',
        cvc: '',
        cardholderName: ''
      };
      
      // Card number validation (16 digits, spaces allowed)
      const cardNumberClean = cardDetails.value.cardNumber.replace(/\s/g, '');
      if (!cardNumberClean) {
        cardErrors.value.cardNumber = 'Card number is required';
        isValid = false;
      } else if (!/^\d{16}$/.test(cardNumberClean)) {
        cardErrors.value.cardNumber = 'Card number must be 16 digits';
        isValid = false;
      }
      
      // Expiry date validation (MM/YY format)
      if (!cardDetails.value.expiryDate) {
        cardErrors.value.expiryDate = 'Expiry date is required';
        isValid = false;
      } else if (!/^\d{2}\/\d{2}$/.test(cardDetails.value.expiryDate)) {
        cardErrors.value.expiryDate = 'Use MM/YY format';
        isValid = false;
      } else {
        // Check if the card is expired
        const [month, year] = cardDetails.value.expiryDate.split('/');
        const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
        const currentDate = new Date();
        
        if (expiryDate <= currentDate) {
          cardErrors.value.expiryDate = 'Card has expired';
          isValid = false;
        }
      }
      
      // CVC validation (3-4 digits)
      if (!cardDetails.value.cvc) {
        cardErrors.value.cvc = 'CVC is required';
        isValid = false;
      } else if (!/^\d{3,4}$/.test(cardDetails.value.cvc)) {
        cardErrors.value.cvc = 'CVC must be 3-4 digits';
        isValid = false;
      }
      
      // Cardholder name validation
      if (!cardDetails.value.cardholderName) {
        cardErrors.value.cardholderName = 'Cardholder name is required';
        isValid = false;
      }
      
      return isValid;
    };
    
    // Validate cash amount
    const validateCashAmount = () => {
      cashAmountError.value = '';
      
      if (!cashAmount.value) {
        cashAmountError.value = 'Please enter cash amount';
        return false;
      }
      
      const amount = parseFloat(cashAmount.value);
      if (isNaN(amount)) {
        cashAmountError.value = 'Please enter a valid amount';
        return false;
      }
      
      if (amount < order.value.finalAmount) {
        cashAmountError.value = 'Cash amount must cover the total';
        return false;
      }
      
      return true;
    };
    
    // Check if payment can be processed
    const canProcessPayment = computed(() => {
      if (!order.value || !paymentMethod.value) return false;
      
      if (paymentMethod.value === 'CASH') {
        return parseFloat(cashAmount.value) >= order.value.finalAmount;
      } else if (paymentMethod.value === 'CARD') {
        return cardDetails.value.cardNumber &&
               cardDetails.value.expiryDate &&
               cardDetails.value.cvc &&
               cardDetails.value.cardholderName;
      }
      
      return false;
    });
    
    // Process payment
    const processPayment = async () => {
      if (!order.value) {
        errorMessage.value = 'No order found';
        return;
      }
      
      if (!paymentMethod.value) {
        errorMessage.value = 'Please select a payment method';
        return;
      }
      
      // Validate based on payment method
      if (paymentMethod.value === 'CARD' && !validateCardDetails()) {
        return;
      } else if (paymentMethod.value === 'CASH' && !validateCashAmount()) {
        return;
      }
      
      loading.value = true;
      errorMessage.value = '';
      successMessage.value = '';
      
      try {
        // Generate a transaction ID
        const transactionId = 'TXN' + Date.now().toString();
        
        // Prepare payment data
        const paymentData = {
          transactionId: transactionId,
          orderId: order.value.orderId || 'ORD' + Math.floor(Math.random() * 10000),
          amount: order.value.finalAmount,
          paymentMethod: paymentMethod.value
        };
        
        console.log('Processing payment:', paymentData);
        
        // Process the payment
        const paymentResponse = await paymentService.processPayment(paymentData);
        console.log('Payment response:', paymentResponse);
        
        // Create invoice
        try {
          const invoiceData = {
            orderId: paymentData.orderId,
            invoiceDate: new Date().toISOString(),
            subtotal: order.value.totalAmount,
            taxAmount: order.value.taxAmount,
            discount: order.value.discountAmount,
            finalAmount: order.value.finalAmount,
            customerId: 1 // Default customer ID
          };
          
          console.log('Creating invoice:', invoiceData);
          await invoiceService.createInvoice(invoiceData);
        } catch (invoiceError) {
          console.error('Invoice creation error:', invoiceError);
          // Continue even if invoice creation fails
        }
        
        // Set success message
        successMessage.value = 'Payment successful!';
        
        // Clear the cart and order from localStorage
        localStorage.removeItem('cart');
        localStorage.removeItem('order');
        
        // Store only necessary data for confirmation page
        const confirmationData = {
          transactionId: transactionId,
          amount: order.value.finalAmount,
          paymentMethod: paymentMethod.value,
          orderItems: order.value.orderItems,
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('confirmation', JSON.stringify(confirmationData));
        
        // Delay navigation to show the success message
        setTimeout(() => {
          router.push('/confirmation');
        }, 1000);
        
      } catch (error) {
        console.error('Payment error:', error);
        errorMessage.value = error.message || 'Payment processing failed. Please try again.';
      } finally {
        loading.value = false;
      }
    };
    
    // Navigate back to home
    const goToHome = () => {
      router.push('/');
    };
    
    // Return values and methods for the template
    return {
      order,
      loading,
      errorMessage,
      successMessage,
      paymentMethod,
      cashAmount,
      cashAmountError,
      cardDetails,
      cardErrors,
      changeAmount,
      canProcessPayment,
      formatCardNumber,
      formatExpiryDate,
      formatCVC,
      formatCashAmount,
      processPayment,
      goToHome
    };
  }
};
</script>