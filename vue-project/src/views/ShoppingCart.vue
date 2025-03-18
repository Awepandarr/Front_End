<!-- src/components/ShoppingCart.vue -->
<template>
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Current Order</h2>
        <button 
          @click="clearCart" 
          class="text-red-500 hover:text-red-600 font-medium transition-colors"
          :disabled="items.length === 0"
          :class="{ 'opacity-50 cursor-not-allowed': items.length === 0 }"
        >
          Clear All
        </button>
      </div>
  
      <!-- Empty Cart Message -->
      <div v-if="items.length === 0" class="text-center py-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p class="text-gray-500 mt-4 text-lg">Your cart is empty</p>
        <p class="text-gray-400">Scan products or browse the catalog to add items</p>
      </div>
  
      <!-- Cart Items -->
      <div v-else class="max-h-80 overflow-y-auto mb-6">
        <div 
          v-for="(item, index) in items" 
          :key="index"
          class="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 border-b border-gray-200 last:border-0"
        >
          <div class="flex-1">
            <div class="flex justify-between sm:block">
              <h3 class="text-lg font-medium">{{ item.name }}</h3>
              <span class="sm:hidden text-lg font-bold">${{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
            <p class="text-gray-500">${{ item.price.toFixed(2) }} each</p>
            
            <div class="flex items-center mt-2">
              <button 
                @click="decrementQuantity(index)" 
                class="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-l text-lg focus:outline-none transition"
                :disabled="item.quantity <= 1"
                :class="{ 'opacity-50 cursor-not-allowed': item.quantity <= 1 }"
              >
                -
              </button>
              <span class="px-4 py-1 text-lg bg-gray-100">{{ item.quantity }}</span>
              <button 
                @click="incrementQuantity(index)" 
                class="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-r text-lg focus:outline-none transition"
              >
                +
              </button>
              
              <button 
                @click="removeItem(index)" 
                class="ml-4 text-red-500 hover:text-red-700 transition"
                title="Remove item"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          
          <div class="hidden sm:block text-right">
            <span class="text-xl font-bold">${{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
        </div>
      </div>
  
      <!-- Order Summary -->
      <div v-if="items.length > 0" class="border-t-2 border-gray-200 pt-4">
        <div class="flex justify-between mb-2">
          <span class="text-gray-600">Subtotal</span>
          <span>${{ subtotal.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between mb-2">
          <span class="text-gray-600">Tax ({{ (taxRate * 100).toFixed(0) }}%)</span>
          <span>${{ tax.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between mb-2">
          <div class="flex items-center">
            <span class="text-gray-600">Discount</span>
            <button 
              @click="showDiscountInput = !showDiscountInput" 
              class="ml-2 text-blue-500 text-sm hover:text-blue-700 focus:outline-none"
            >
              {{ showDiscountInput ? 'Hide' : 'Add' }}
            </button>
          </div>
          <span>${{ discount.toFixed(2) }}</span>
        </div>
        
        <!-- Discount Input -->
        <div v-if="showDiscountInput" class="mb-4 p-3 bg-gray-50 rounded-md">
          <div class="flex space-x-2">
            <select 
              v-model="discountType" 
              class="p-2 border rounded"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
            <input 
              v-model="discountValue" 
              type="number" 
              min="0" 
              :max="discountType === 'percentage' ? 100 : subtotal"
              class="flex-1 p-2 border rounded"
              placeholder="Enter discount"
            />
            <button 
              @click="applyDiscount" 
              class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Apply
            </button>
          </div>
        </div>
        
        <div class="flex justify-between font-bold text-xl mt-4 pt-4 border-t-2 border-gray-200">
          <span>Total</span>
          <span>${{ total.toFixed(2) }}</span>
        </div>
      </div>
  
      <!-- Payment Actions -->
      <div class="mt-6" v-if="items.length > 0">
        <h3 class="text-lg font-bold mb-3">Payment</h3>
        <div class="grid grid-cols-2 gap-3 mb-4">
          <button 
            @click="checkout('CASH')" 
            class="bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
            <span>Cash</span>
          </button>
          <button 
            @click="checkout('CARD')" 
            class="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span>Card</span>
          </button>
        </div>
        
        <div class="flex space-x-3">
          <button 
            @click="holdOrder" 
            class="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg transition"
          >
            Hold Order
          </button>
          <button 
            @click="cancelOrder" 
            class="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, watch, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  
  export default {
    props: {
      initialItems: {
        type: Array,
        default: () => []
      },
      taxRate: {
        type: Number,
        default: 0.1 // 10% tax rate by default
      },
    },
    
    emits: ['update:items', 'checkout', 'hold', 'cancel'],
    
    setup(props, { emit }) {
      const router = useRouter();
      const items = ref([...props.initialItems]);
      const showDiscountInput = ref(false);
      const discountType = ref('percentage');
      const discountValue = ref(0);
      const appliedDiscount = ref(0);
      
      // Watch for prop changes
      watch(() => props.initialItems, (newItems) => {
        items.value = [...newItems];
      }, { deep: true });
      
      // Load cart from localStorage on mount
      onMounted(() => {
        console.log('ShoppingCart component mounted');
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          try {
            items.value = JSON.parse(savedCart);
            console.log('Loaded items from localStorage:', items.value.length);
          } catch (err) {
            console.error('Error parsing saved cart:', err);
          }
        }
      });
      
      // Save cart to localStorage whenever it changes
      watch(items, (newItems) => {
        try {
          localStorage.setItem('cart', JSON.stringify(newItems));
          emit('update:items', newItems);
          console.log('Cart updated, items:', newItems.length);
        } catch (err) {
          console.error('Error saving cart:', err);
        }
      }, { deep: true });
      
      const subtotal = computed(() => {
        return items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      });
      
      const tax = computed(() => {
        return subtotal.value * props.taxRate;
      });
      
      const discount = computed(() => {
        return appliedDiscount.value;
      });
      
      const total = computed(() => {
        return subtotal.value + tax.value - discount.value;
      });
      
      const incrementQuantity = (index) => {
        items.value[index].quantity += 1;
        console.log(`Increased quantity for ${items.value[index].name} to ${items.value[index].quantity}`);
      };
      
      const decrementQuantity = (index) => {
        if (items.value[index].quantity > 1) {
          items.value[index].quantity -= 1;
          console.log(`Decreased quantity for ${items.value[index].name} to ${items.value[index].quantity}`);
        }
      };
      
      const removeItem = (index) => {
        console.log(`Removing item: ${items.value[index].name}`);
        items.value.splice(index, 1);
      };
      
      const clearCart = () => {
        if (items.value.length > 0 && confirm('Are you sure you want to clear the cart?')) {
          console.log('Clearing cart...');
          items.value = [];
          appliedDiscount.value = 0;
        }
      };
      
      const applyDiscount = () => {
        const value = parseFloat(discountValue.value) || 0;
        console.log(`Applying ${discountType.value} discount: ${value}`);
        
        if (discountType.value === 'percentage') {
          // Calculate percentage of subtotal
          appliedDiscount.value = subtotal.value * (value / 100);
        } else {
          // Fixed amount discount
          appliedDiscount.value = Math.min(value, subtotal.value); // Can't discount more than subtotal
        }
        
        // Reset discount input
        discountValue.value = 0;
        showDiscountInput.value = false;
        
        console.log(`Applied discount: ${appliedDiscount.value.toFixed(2)}`);
      };
      
      const checkout = (paymentMethod) => {
        if (items.value.length === 0) return;
        
        console.log(`Initiating checkout with ${paymentMethod} payment method`);
        
        // Prepare order data
        const orderData = {
          orderItems: items.value,
          customerId: 1, // Default customer ID
          totalAmount: subtotal.value,
          taxAmount: tax.value,
          discountAmount: discount.value,
          finalAmount: total.value,
          orderType: 'IN_STORE',
          paymentMethod: paymentMethod,
          paymentStatus: 'PENDING'
        };
        
        // Save order to localStorage for the payment page
        localStorage.setItem('order', JSON.stringify(orderData));
        
        // Emit event with order data
        emit('checkout', { orderData, paymentMethod });
        
        // Navigate to payment page
        router.push('/payment');
      };
      
      const holdOrder = () => {
        if (items.value.length === 0) return;
        
        console.log('Putting order on hold...');
        emit('hold', items.value);
      };
      
      
      const cancelOrder = () => {
        if (items.value.length === 0) return;
        
        if (confirm('Are you sure you want to cancel this order?')) {
          console.log('Cancelling order...');
          items.value = [];
          appliedDiscount.value = 0;
          emit('cancel');
        }
      };
      
      return {
        items,
        showDiscountInput,
        discountType,
        discountValue,
        subtotal,
        tax,
        discount,
        total,
        incrementQuantity,
        decrementQuantity,
        removeItem,
        clearCart,
        applyDiscount,
        checkout,
        holdOrder,
        cancelOrder
      };
    }
  };
  </script>
  
  <style scoped>
  /* Animation for buttons */
  button {
    transition: all 0.2s ease-in-out;
  }
  
  /* Optional: add some hover effects for the payment buttons */
  button.bg-green-500:hover, 
  button.bg-blue-500:hover,
  button.bg-yellow-500:hover,
  button.bg-red-500:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  </style>