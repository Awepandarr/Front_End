<!-- Enhanced PaymentForm Component -->
<template>
    <div class="bg-white rounded-lg shadow-lg p-6">
      <!-- Payment Method Selection with Enhanced Validation -->
      <div class="mb-6">
        <h3 class="text-xl font-bold mb-4">Payment Method</h3>
        <div class="grid grid-cols-2 gap-4">
          <div 
            class="border rounded-lg p-4 cursor-pointer transition-all duration-300"
            :class="{
              'border-blue-500 bg-blue-50 shadow-md': paymentMethod === 'CARD',
              'border-gray-300': paymentMethod !== 'CARD'
            }"
            @click="selectPaymentMethod('CARD')"
          >
            <div class="flex items-center">
              <div class="bg-blue-100 rounded-full p-2 mr-3">
                <CreditCardIcon class="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 class="font-bold">Credit/Debit Card</h3>
                <p class="text-sm text-gray-500">Secure online payment</p>
              </div>
            </div>
          </div>
          <div 
            class="border rounded-lg p-4 cursor-pointer transition-all duration-300"
            :class="{
              'border-green-500 bg-green-50 shadow-md': paymentMethod === 'CASH',
              'border-gray-300': paymentMethod !== 'CASH'
            }"
            @click="selectPaymentMethod('CASH')"
          >
            <div class="flex items-center">
              <div class="bg-green-100 rounded-full p-2 mr-3">
                <DollarSignIcon class="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 class="font-bold">Cash</h3>
                <p class="text-sm text-gray-500">Pay with physical currency</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Card Payment Form with Detailed Validation -->
      <div v-if="paymentMethod === 'CARD'" class="mb-6">
        <h3 class="text-xl font-bold mb-4">Card Details</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
            <input 
              type="text" 
              v-model="cardDetails.cardNumber" 
              @input="formatCardNumber"
              placeholder="1234 5678 9012 3456" 
              class="w-full p-3 border rounded-md"
              :class="{'border-red-500': cardNumberError}"
              maxlength="19"
            />
            <p v-if="cardNumberError" class="text-red-500 text-sm mt-1">
              {{ cardNumberError }}
            </p>
          </div>
  
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input 
                type="text" 
                v-model="cardDetails.expiryDate" 
                @input="formatExpiryDate"
                placeholder="MM/YY" 
                class="w-full p-3 border rounded-md"
                :class="{'border-red-500': expiryDateError}"
                maxlength="5"
              />
              <p v-if="expiryDateError" class="text-red-500 text-sm mt-1">
                {{ expiryDateError }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">CVV</label>
              <input 
                type="text" 
                v-model="cardDetails.cvv" 
                @input="formatCVV"
                placeholder="123" 
                class="w-full p-3 border rounded-md"
                :class="{'border-red-500': cvvError}"
                maxlength="4"
              />
              <p v-if="cvvError" class="text-red-500 text-sm mt-1">
                {{ cvvError }}
              </p>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
            <input 
              type="text" 
              v-model="cardDetails.cardholderName"
              placeholder="John Doe"
              class="w-full p-3 border rounded-md"
              :class="{'border-red-500': cardholderNameError}"
            />
            <p v-if="cardholderNameError" class="text-red-500 text-sm mt-1">
              {{ cardholderNameError }}
            </p>
          </div>
        </div>
      </div>
  
      <!-- Cash Payment Section -->
      <div v-if="paymentMethod === 'CASH'" class="mb-6">
        <h3 class="text-xl font-bold mb-4">Cash Payment</h3>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Cash Tendered</label>
          <input 
            type="number" 
            v-model="cashAmount" 
            placeholder="Enter cash amount" 
            class="w-full p-3 border rounded-md"
            :class="{'border-red-500': cashAmountError}"
            min="0" 
            step="0.01"
          />
          <p v-if="cashAmountError" class="text-red-500 text-sm mt-1">
            {{ cashAmountError }}
          </p>
        </div>
        
        <div v-if="cashAmount > 0" class="mt-4 bg-green-50 p-3 rounded-md">
          <div class="flex justify-between items-center">
            <span>Change Due:</span>
            <span class="font-bold">${{ changeAmount.toFixed(2) }}</span>
          </div>
        </div>
      </div>
  
      <!-- Global Error Message -->
      <div v-if="globalErrorMessage" class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {{ globalErrorMessage }}
      </div>
  
      <!-- Proceed Button -->
      <button 
        @click="processPayment"
        class="w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        :disabled="!isPaymentValid || processing"
      >
        {{ processing ? 'Processing...' : 'Proceed to Confirmation' }}
      </button>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { CreditCardIcon, DollarSignIcon } from 'lucide-vue-next';
import { paymentService } from '@/services/api.service';

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['payment-success', 'payment-error']);

const paymentMethod = ref('CARD');
const processing = ref(false);
const globalErrorMessage = ref('');

const cardDetails = ref({
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  cardholderName: ''
});
const cashAmount = ref(null);

// Validation error messages
const cardNumberError = computed(() => {
  const cleanNumber = cardDetails.value.cardNumber.replace(/\s/g, '');
  if (!cleanNumber) return 'Card number is required';
  if (cleanNumber.length !== 16) return 'Card number must be 16 digits';
  return '';
});

const expiryDateError = computed(() => {
  const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!cardDetails.value.expiryDate) return 'Expiry date is required';
  if (!expiryRegex.test(cardDetails.value.expiryDate)) return 'Invalid expiry date format';
  
  const [month, year] = cardDetails.value.expiryDate.split('/');
  const currentDate = new Date();
  const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
  
  if (expiryDate <= currentDate) return 'Card has expired';
  
  return '';
});

const cvvError = computed(() => {
  if (!cardDetails.value.cvv) return 'CVV is required';
  if (cardDetails.value.cvv.length < 3 || cardDetails.value.cvv.length > 4) return 'CVV must be 3-4 digits';
  return '';
});

const cardholderNameError = computed(() => {
  if (!cardDetails.value.cardholderName) return 'Cardholder name is required';
  if (cardDetails.value.cardholderName.length < 2) return 'Name is too short';
  return '';
});

const cashAmountError = computed(() => {
  if (paymentMethod.value === 'CASH') {
    if (!cashAmount.value) return 'Cash amount is required';
    if (cashAmount.value < props.order.finalAmount) return `Minimum amount is $${props.order.finalAmount.toFixed(2)}`;
  }
  return '';
});

const formatCardNumber = () => {
  let value = cardDetails.value.cardNumber.replace(/\D/g, '');
  let formatted = '';
  
  for (let i = 0; i < value.length; i++) {
    if (i > 0 && i % 4 === 0) {
      formatted += ' ';
    }
    formatted += value[i];
  }
  
  cardDetails.value.cardNumber = formatted.trim();
};

const formatExpiryDate = () => {
  let value = cardDetails.value.expiryDate.replace(/\D/g, '');
  
  if (value.length > 2) {
    value = value.substring(0, 2) + '/' + value.substring(2);
  }
  
  cardDetails.value.expiryDate = value;
};

const formatCVV = () => {
  cardDetails.value.cvv = cardDetails.value.cvv.replace(/\D/g, '');
};

const selectPaymentMethod = (method) => {
  paymentMethod.value = method;
  // Reset error messages when switching payment methods
  globalErrorMessage.value = '';
};

const changeAmount = computed(() => {
  if (paymentMethod.value === 'CASH' && cashAmount.value) {
    return Math.max(0, cashAmount.value - props.order.finalAmount);
  }
  return 0;
});

const isPaymentValid = computed(() => {
  if (paymentMethod.value === 'CARD') {
    return !cardNumberError.value && 
           !expiryDateError.value && 
           !cvvError.value && 
           !cardholderNameError.value;
  }
  if (paymentMethod.value === 'CASH') {
    return !cashAmountError.value;
  }
  return false;
});

const processPayment = async () => {
  // Reset error messages
  globalErrorMessage.value = '';
  processing.value = true;

  try {
    const paymentData = {
      transactionId: `TXN${Date.now()}`,
      orderId: props.order.orderId,
      amount: props.order.finalAmount,
      paymentMethod: paymentMethod.value
    };

    // Add payment method specific details
    if (paymentMethod.value === 'CARD') {
      paymentData.cardDetails = {
        cardNumber: cardDetails.value.cardNumber.replace(/\s/g, ''),
        expiryDate: cardDetails.value.expiryDate,
        cvv: cardDetails.value.cvv,
        cardholderName: cardDetails.value.cardholderName
      };
    } else {
      paymentData.cashAmount = parseFloat(cashAmount.value);
    }

    // Log the request payload for debugging
    console.log('Payment Request Payload:', paymentData);

    const response = await paymentService.processPayment(paymentData);

    // Emit success event
    emit('payment-success', {
      transactionId: paymentData.transactionId,
      amount: props.order.finalAmount,
      method: paymentMethod.value
    });
  } catch (error) {
    // Log the full error for debugging
    console.error('Payment Processing Error:', error);

    // Try to extract a meaningful error message
    const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'There was an error processing your order.';
    
    // Set global error message
    globalErrorMessage.value = errorMessage;

    // Emit error event
    emit('payment-error', {
      message: errorMessage
    });
  } finally {
    processing.value = false;
  }
};

// Expose methods for potential parent component interaction
defineExpose({
  processPayment,
  isPaymentValid,
  paymentMethod
});
</script>