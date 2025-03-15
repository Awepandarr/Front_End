// src/components/PaymentForm.vue
<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <!-- Payment Method Selection -->
    <div class="mb-6">
      <h3 class="text-xl font-bold mb-4">Payment Method</h3>
      <div class="grid grid-cols-2 gap-4">
        <div 
          class="border rounded-lg p-4 cursor-pointer transition-all duration-300"
          :class="{'border-blue-500 bg-blue-50 shadow-md': paymentMethod === 'CARD'}"
          @click="selectPaymentMethod('CARD')"
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
          class="border rounded-lg p-4 cursor-pointer transition-all duration-300"
          :class="{'border-blue-500 bg-blue-50 shadow-md': paymentMethod === 'CASH'}"
          @click="selectPaymentMethod('CASH')"
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

    <!-- Card Payment Form -->
    <div v-if="paymentMethod === 'CARD'" class="mb-6">
      <h3 class="text-xl font-bold mb-4">Card Details</h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
          <input 
            type="text" 
            v-model="cardDetails.cardNumber" 
            placeholder="1234 5678 9012 3456" 
            class="w-full p-3 border rounded-md"
            :class="{'border-red-500': errors.cardNumber}"
            @input="formatCardNumber"
            maxlength="19"
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
              @input="formatExpiry"
              maxlength="5"
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
              maxlength="4"
              @input="validateNumericInput('cvc')"
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

    <!-- Cash Payment -->
    <div v-if="paymentMethod === 'CASH'" class="mb-6">
      <h3 class="text-xl font-bold mb-4">Cash Payment</h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Amount Tendered</label>
          <div class="relative">
            <span class="absolute left-3 top-3 text-gray-500">$</span>
            <input 
              type="text" 
              v-model="cashAmount" 
              class="w-full p-3 pl-7 border rounded-md"
              :class="{'border-red-500': errors.cashAmount}"
              @input="validateNumericInput('cash')"
            >
          </div>
          <p v-if="errors.cashAmount" class="text-red-500 text-sm mt-1">{{ errors.cashAmount }}</p>
        </div>
        <div v-if="parseFloat(cashAmount) > 0 && orderTotal > 0">
          <label class="block text-sm font-medium text-gray-700 mb-1">Change</label>
          <div class="p-3 bg-gray-100 rounded-md font-bold">
            ${{ calculateChange() }}
          </div>
        </div>
      </div>
    </div>

    <!-- Process Payment Button -->
    <button 
      @click="processPayment" 
      class="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-bold"
      :disabled="processing"
    >
      <span v-if="processing">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Processing...
      </span>
      <span v-else>Process Payment</span>
    </button>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { paymentService } from '../services/api.service';

export default {
  name: 'PaymentForm',
  
  props: {
    order: {
      type: Object,
      required: true
    }
  },
  
  emits: ['payment-success', 'payment-error'],
  
  setup(props, { emit }) {
    const router = useRouter();
    const paymentMethod = ref('CARD');
    const processing = ref(false);
    const errors = ref({});
    
    const cardDetails = ref({
      cardNumber: '',
      expiry: '',
      cvc: '',
      cardholderName: ''
    });
    
    const cashAmount = ref('');
    
    const orderTotal = computed(() => {
      return props.order?.finalAmount || 0;
    });
    
    const selectPaymentMethod = (method) => {
      paymentMethod.value = method;
      errors.value = {};
    };
    
    const formatCardNumber = () => {
      // Remove any non-digit characters
      let value = cardDetails.value.cardNumber.replace(/\D/g, '');
      
      // Format with spaces after every 4 digits
      let formattedValue = '';
      for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formattedValue += ' ';
        }
        formattedValue += value[i];
      }
      
      // Update the value
      cardDetails.value.cardNumber = formattedValue.trim();
    };
    
    const formatExpiry = () => {
      // Remove any non-digit characters
      let value = cardDetails.value.expiry.replace(/\D/g, '');
      
      // Format as MM/YY
      if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2);
      }
      
      // Update the value
      cardDetails.value.expiry = value;
    };
    
    const validateNumericInput = (field) => {
      if (field === 'cvc') {
        // Allow only digits for CVC
        cardDetails.value.cvc = cardDetails.value.cvc.replace(/\D/g, '');
      } else if (field === 'cash') {
        // Allow digits and one decimal point for cash amount
        const value = cashAmount.value.replace(/[^\d.]/g, '');
        
        // Ensure only one decimal point
        const parts = value.split('.');
        if (parts.length > 2) {
          cashAmount.value = parts[0] + '.' + parts.slice(1).join('');
        } else {
          cashAmount.value = value;
        }
      }
    };
    
    const calculateChange = () => {
      const amount = parseFloat(cashAmount.value) || 0;
      const total = orderTotal.value;
      
      const change = amount - total;
      return change > 0 ? change.toFixed(2) : '0.00';
    };
    
    const validateCardDetails = () => {
      errors.value = {};
      let valid = true;
      
      // Card number validation
      if (!cardDetails.value.cardNumber) {
        errors.value.cardNumber = 'Card number is required';
        valid = false;
      } else {
        // Remove spaces and check if it's a valid 16-digit number
        const cardNumber = cardDetails.value.cardNumber.replace(/\s/g, '');
        if (!/^\d{16}$/.test(cardNumber)) {
          errors.value.cardNumber = 'Please enter a valid 16-digit card number';
          valid = false;
        }
      }
      
      // Expiry date validation
      if (!cardDetails.value.expiry) {
        errors.value.expiry = 'Expiry date is required';
        valid = false;
      } else if (!/^\d{2}\/\d{2}$/.test(cardDetails.value.expiry)) {
        errors.value.expiry = 'Please enter a valid expiry date (MM/YY)';
        valid = false;
      } else {
        // Check if the expiry date is in the future
        const [month, year] = cardDetails.value.expiry.split('/');
        const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
        const currentDate = new Date();
        
        if (expiryDate < currentDate) {
          errors.value.expiry = 'Card has expired';
          valid = false;
        }
      }
      
      // CVC validation
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
      
      if (!cashAmount.value || isNaN(parseFloat(cashAmount.value))) {
        errors.value.cashAmount = 'Please enter a valid amount';
        valid = false;
      } else if (parseFloat(cashAmount.value) < orderTotal.value) {
        errors.value.cashAmount = `Amount must be at least $${orderTotal.value.toFixed(2)}`;
        valid = false;
      }
      
      return valid;
    };
    
    const processPayment = async () => {
      // Validate based on payment method
      const isValid = paymentMethod.value === 'CARD' 
        ? validateCardDetails() 
        : validateCashPayment();
      
      if (!isValid) return;
      
      processing.value = true;
      
      try {
        // Prepare payment data
        const paymentData = {
          transactionId: 'TXN' + Date.now(),
          orderId: props.order.orderId,
          amount: orderTotal.value,
          paymentMethod: paymentMethod.value
        };
        
        // Add card details if paying by card
        if (paymentMethod.value === 'CARD') {
          paymentData.cardDetails = {
            cardNumber: cardDetails.value.cardNumber.replace(/\s/g, ''),
            expiryDate: cardDetails.value.expiry,
            cvc: cardDetails.value.cvc,
            cardholderName: cardDetails.value.cardholderName
          };
        }
        
        // Send payment request
        const response = await paymentService.processPayment(paymentData);
        
        // Emit success event
        emit('payment-success', {
          transactionId: paymentData.transactionId,
          paymentMethod: paymentMethod.value,
          amount: orderTotal.value
        });
        
        // Generate invoice
        await generateInvoice(props.order);
        
        // Navigate to confirmation page
        router.push('/confirmation');
      } catch (error) {
        console.error('Payment error:', error);
        
        // Emit error event
        emit('payment-error', {
          message: error.response?.data?.message || 'Payment processing failed'
        });
      } finally {
        processing.value = false;
      }
    };
    
    const generateInvoice = async (order) => {
      try {
        // Prepare invoice data
        const invoiceData = {
          orderId: order.orderId,
          customerId: order.customerId || 1,
          invoiceDate: new Date().toISOString(),
          subtotal: order.totalAmount,
          discount: order.discountAmount || 0,
          taxAmount: order.taxAmount || 0,
          serviceCharge: 0,
          finalAmount: order.finalAmount
        };
        
        // Call the invoice service API
        const response = await fetch('/invoice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(invoiceData)
        });
        
        if (!response.ok) {
          throw new Error('Failed to generate invoice');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error generating invoice:', error);
        // Don't throw error here - invoice generation failure shouldn't block payment completion
      }
    };
    
    return {
      paymentMethod,
      cardDetails,
      cashAmount,
      errors,
      processing,
      orderTotal,
      selectPaymentMethod,
      formatCardNumber,
      formatExpiry,
      validateNumericInput,
      calculateChange,
      processPayment
    };
  }
};
</script>