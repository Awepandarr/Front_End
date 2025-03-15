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
                <p class="text-sm text-gray-500">Secure card payment</p>
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
  
      <!-- Card Payment Form with Enhanced Validation -->
      <div v-if="paymentMethod === 'CARD'" class="mb-6">
        <h3 class="text-xl font-bold mb-4">Card Details</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
            <div class="relative">
              <input 
                type="text" 
                v-model="cardDetails.cardNumber" 
                @input="formatCardNumber"
                placeholder="1234 5678 9012 3456" 
                class="w-full p-3 border rounded-md"
                :class="{'border-red-500': v$.cardDetails.cardNumber.$error}"
                maxlength="19"
              />
              <div v-if="cardTypeIcon" class="absolute right-3 top-3">
                <component :is="cardTypeIcon" class="h-6 w-6 text-gray-500" />
              </div>
            </div>
            <p v-if="v$.cardDetails.cardNumber.$error" class="text-red-500 text-sm mt-1">
              {{ v$.cardDetails.cardNumber.$errors[0].$message }}
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
                :class="{'border-red-500': v$.cardDetails.expiryDate.$error}"
                maxlength="5"
              />
              <p v-if="v$.cardDetails.expiryDate.$error" class="text-red-500 text-sm mt-1">
                {{ v$.cardDetails.expiryDate.$errors[0].$message }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">CVC</label>
              <input 
                type="text" 
                v-model="cardDetails.cvc" 
                @input="formatCVC"
                placeholder="123" 
                class="w-full p-3 border rounded-md"
                :class="{'border-red-500': v$.cardDetails.cvc.$error}"
                maxlength="4"
              />
              <p v-if="v$.cardDetails.cvc.$error" class="text-red-500 text-sm mt-1">
                {{ v$.cardDetails.cvc.$errors[0].$message }}
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
              :class="{'border-red-500': v$.cardDetails.cardholderName.$error}"
            />
            <p v-if="v$.cardDetails.cardholderName.$error" class="text-red-500 text-sm mt-1">
              {{ v$.cardDetails.cardholderName.$errors[0].$message }}
            </p>
          </div>
        </div>
      </div>
  
      <!-- Cash Payment Section -->
      <div v-if="paymentMethod === 'CASH'" class="mb-6">
        <h3 class="text-xl font-bold mb-4">Cash Payment</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Cash Tendered</label>
            <div class="relative">
              <span class="absolute left-3 top-3 text-gray-500">$</span>
              <input 
                type="text"
                v-model="cashAmount"
                @input="formatCashAmount"
                placeholder="Enter cash amount"
                class="w-full p-3 pl-8 border rounded-md"
                :class="{'border-red-500': v$.cashAmount.$error}"
              />
            </div>
            <p v-if="v$.cashAmount.$error" class="text-red-500 text-sm mt-1">
              {{ v$.cashAmount.$errors[0].$message }}
            </p>
          </div>
          
          <div v-if="changeAmount > 0" class="bg-green-50 p-3 rounded-md">
            <div class="flex justify-between items-center">
              <span class="text-green-700">Change Due:</span>
              <span class="text-xl font-bold text-green-800">${{ changeAmount.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Payment Button -->
      <button 
        @click="processPayment"
        :disabled="!isPaymentValid || processing"
        class="w-full p-3 rounded-md transition-colors duration-300"
        :class="{
          'bg-blue-500 text-white hover:bg-blue-600': isPaymentValid && !processing,
          'bg-gray-300 cursor-not-allowed': !isPaymentValid || processing
        }"
      >
        <template v-if="processing">
          <div class="flex items-center justify-center">
            <Spinner class="mr-2 h-5 w-5" />
            Processing Payment...
          </div>
        </template>
        <template v-else>
          Process Payment
        </template>
      </button>
    </div>
  </template>
  <script setup>
  import { ref, computed } from 'vue';
  import { useVuelidate } from '@vuelidate/core';
  import { 
    required, 
    minLength, 
    maxLength, 
    helpers 
  } from '@vuelidate/validators';
  import { 
    CreditCardIcon, 
    DollarSignIcon 
  } from 'lucide-vue-next';
  
  import { paymentService } from '@/services/api.service';
  import Spinner from '@/components/Spinner.vue';
  
  const props = defineProps({
    order: {
      type: Object,
      required: true
    }
  });
  
  const emit = defineEmits(['payment-success', 'payment-error']);
  
  const paymentMethod = ref('CARD');
  const processing = ref(false);
  
  const cardDetails = ref({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    cardholderName: ''
  });
  
  const cashAmount = ref('');
  
  const cardValidations = {
    cardNumber: {
      required: helpers.withMessage('Card number is required', required),
      validCardNumber: helpers.withMessage('Invalid card number', 
        (value) => {
          const cleanNumber = value.replace(/\s/g, '');
          return /^\d{16}$/.test(cleanNumber);
        }
      )
    },
    expiryDate: {
      required: helpers.withMessage('Expiry date is required', required),
      validExpiry: helpers.withMessage('Invalid expiry date', 
        (value) => {
          const [month, year] = value.split('/');
          const currentDate = new Date();
          const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
          return expiryDate > currentDate;
        }
      )
    },
    cvc: {
      required: helpers.withMessage('CVC is required', required),
      minLength: minLength(3),
      maxLength: maxLength(4),
      numeric: helpers.withMessage('CVC must be numeric', 
        (value) => /^\d+$/.test(value)
      )
    },
    cardholderName: {
      required: helpers.withMessage('Cardholder name is required', required),
      validName: helpers.withMessage('Invalid name', 
        (value) => /^[a-zA-Z\s]+$/.test(value)
      )
    }
  };
  
// Continued PaymentForm component script

const cashValidations = {
  cashAmount: {
    required: helpers.withMessage('Cash amount is required', required),
    minAmount: helpers.withMessage('Amount must cover total', 
      (value) => parseFloat(value) >= props.order.finalAmount
    )
  }
};

const rules = computed(() => {
  return paymentMethod.value === 'CARD' 
    ? { cardDetails: cardValidations }
    : { cashAmount: cashValidations.cashAmount };
});

const v$ = useVuelidate(rules, { cardDetails, cashAmount });

const changeAmount = computed(() => {
  const cashAmountValue = parseFloat(cashAmount.value) || 0;
  return paymentMethod.value === 'CASH' 
    ? Math.max(0, cashAmountValue - props.order.finalAmount) 
    : 0;
});

const isPaymentValid = computed(() => {
  return paymentMethod.value === 'CARD' 
    ? !v$.value.cardDetails.$invalid
    : !v$.value.cashAmount.$invalid;
});

const cardTypeIcon = computed(() => {
  const cardNumber = cardDetails.value.cardNumber.replace(/\s/g, '');
  if (/^4/.test(cardNumber)) return 'VisaIcon';
  if (/^5[1-5]/.test(cardNumber)) return 'MastercardIcon';
  if (/^3[47]/.test(cardNumber)) return 'AmexIcon';
  return null;
});

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

const formatExpiryDate = () => {
  let value = cardDetails.value.expiryDate.replace(/\D/g, '');
  
  if (value.length > 2) {
    value = value.substring(0, 2) + '/' + value.substring(2);
  }
  
  cardDetails.value.expiryDate = value;
};

const formatCVC = () => {
  cardDetails.value.cvc = cardDetails.value.cvc.replace(/\D/g, '');
};

const formatCashAmount = () => {
  cashAmount.value = cashAmount.value.replace(/[^\d.]/g, '');
  
  const parts = cashAmount.value.split('.');
  if (parts.length > 2) {
    cashAmount.value = parts[0] + '.' + parts.slice(1).join('');
  }
};

const selectPaymentMethod = (method) => {
  paymentMethod.value = method;
  v$.value.$reset();
};

const processPayment = async () => {
  // Validate input
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  processing.value = true;

  try {
    // Prepare payment data
    const paymentData = {
      transactionId: `TXN${Date.now()}`,
      orderId: props.order.orderId,
      amount: props.order.finalAmount,
      paymentMethod: paymentMethod.value
    };

    // Add payment-method-specific details
    if (paymentMethod.value === 'CARD') {
      paymentData.cardDetails = {
        cardNumber: cardDetails.value.cardNumber.replace(/\s/g, ''),
        expiryDate: cardDetails.value.expiryDate,
        cvc: cardDetails.value.cvc,
        cardholderName: cardDetails.value.cardholderName
      };
    } else {
      paymentData.cashAmount = parseFloat(cashAmount.value);
    }

    // Process payment via service
    const response = await paymentService.processPayment(paymentData);

    // Emit success event
    emit('payment-success', {
      transactionId: paymentData.transactionId,
      paymentMethod: paymentMethod.value,
      amount: props.order.finalAmount
    });
  } catch (error) {
    // Emit error event
    emit('payment-error', {
      message: error.message || 'Payment processing failed'
    });
  } finally {
    processing.value = false;
  }
};

// Expose methods and computed properties
defineExpose({
  processPayment,
  isPaymentValid,
  paymentMethod
});
</script>