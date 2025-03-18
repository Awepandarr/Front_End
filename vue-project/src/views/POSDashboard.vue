<!-- src/views/POSDashboard.vue -->
<template>
  <div class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-6 py-8">
      <div class="flex flex-col gap-8">
        <!-- Barcode Scanner Section -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
          <div class="p-4 bg-gray-800 text-white flex justify-between items-center">
            <h3 class="text-lg font-semibold">Barcode Scanner</h3>
            <div 
              class="px-2 py-1 rounded-full text-xs font-medium" 
              :class="scannerConnected ? 'bg-green-500' : 'bg-red-500'"
            >
              {{ scannerConnected ? 'Connected' : 'Disconnected' }}
            </div>
          </div>
          
          <div class="p-4">
            <!-- Video feed or manual entry form -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Left side: Video feed (if available) or placeholder -->
              <div class="relative">
                <div v-if="scannerConnected" class="relative">
                  <!-- Video feed from scanner service -->
                  <img 
                    :src="videoFeedUrl" 
                    alt="Barcode Scanner Feed" 
                    class="w-full h-auto rounded border border-gray-300"
                    @error="handleVideoError"
                  />
                  
                  <!-- Scanning guide overlay -->
                  <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div class="border-2 border-red-500 w-3/4 h-1/2 max-w-md flex items-center justify-center">
                      <div class="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                        Position barcode here
                      </div>
                    </div>
                  </div>
                </div>
                
                <div v-else class="bg-gray-100 p-8 text-center rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p class="text-gray-600">
                    Video feed not available.
                    <button @click="connectScanner" class="text-blue-500 underline">Try connecting</button>
                  </p>
                </div>
                
                <!-- Latest scan results (if available) -->
                <div v-if="lastScannedBarcode" class="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <div class="font-semibold">Last Scan:</div>
                  <div class="flex justify-between items-center">
                    <div class="text-lg font-mono">{{ lastScannedBarcode.data }}</div>
                    <div class="text-xs text-gray-500">{{ lastScannedBarcode.type }}</div>
                  </div>
                </div>
              </div>
              
              <!-- Right side: Manual barcode entry -->
              <div>
                <div class="relative mb-4">
                  <input 
                    type="text" 
                    ref="barcodeInput"
                    v-model="manualBarcodeValue" 
                    placeholder="Scan or enter barcode" 
                    class="w-full p-3 pl-10 border rounded-lg"
                    @keyup.enter="searchByBarcode"
                    @focus="inputFocused = true"
                    @blur="inputFocused = false"
                  >
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                </div>
                
                <div class="flex space-x-2">
                  <button 
                    @click="searchByBarcode" 
                    class="flex-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
                  >
                    Search
                  </button>
                  <button 
                    @click="clearBarcodeInput" 
                    class="px-4 py-2 border rounded-md hover:bg-gray-100 transition"
                  >
                    Clear
                  </button>
                </div>
                
                <!-- Scanner Animation -->
                <div 
                  v-if="inputFocused" 
                  class="mt-4 h-8 bg-gray-200 rounded-md overflow-hidden relative"
                >
                  <div 
                    class="h-full bg-red-500 w-1 absolute animate-scanner"
                  ></div>
                </div>
                
                <!-- Recent Scans -->
                <div v-if="recentScans.length > 0" class="mt-4">
                  <h4 class="font-medium text-sm text-gray-500 mb-2">Recent Scans</h4>
                  <div class="max-h-40 overflow-y-auto">
                    <div 
                      v-for="(scan, index) in recentScans" 
                      :key="index"
                      class="text-sm py-1 border-b last:border-0 flex justify-between items-center"
                    >
                      <div>
                        <span class="font-medium">{{ scan.barcode }}</span>
                        <p class="text-xs text-gray-500">{{ scan.timestamp }}</p>
                      </div>
                      <span 
                        class="text-blue-500 cursor-pointer"
                        @click="manualBarcodeValue = scan.barcode; searchByBarcode()"
                      >
                        Use
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Toggle Connection Button -->
            <div class="mt-4">
              <button 
                @click="toggleScanner" 
                class="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                {{ scannerConnected ? 'Disconnect Scanner' : 'Connect Scanner' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Main POS Section -->
        <div class="flex flex-col md:flex-row gap-8">
          <!-- Left Panel: Product Categories and List -->
          <div class="w-full md:w-2/3 bg-white rounded-lg shadow-lg overflow-hidden">
            <!-- Category Tabs -->
            <div class="flex overflow-x-auto bg-blue-500">
              <button 
                v-for="category in categories" 
                :key="category.id"
                @click="activeCategory = category.id"
                :class="[
                  'px-6 py-4 text-lg font-medium whitespace-nowrap focus:outline-none',
                  activeCategory === category.id ? 'bg-blue-600 text-white' : 'text-blue-100 hover:bg-blue-400 hover:text-white'
                ]"
              >
                {{ category.name }}
              </button>
            </div>

            <!-- Product Grid -->
            <div class="p-8">
              <div class="mb-6">
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  placeholder="Search products..." 
                  class="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                <div 
                  v-for="product in filteredProducts" 
                  :key="product.productId"
                  @click="addToCart(product)"
                  class="bg-white rounded-lg shadow-md p-6 cursor-pointer transition-transform duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
                >
                  <div class="bg-gray-200 rounded-lg mb-4 p-4 flex items-center justify-center">
                    <span class="text-4xl text-gray-400">Product Image</span>
                  </div>
                  <h4 class="text-xl font-semibold mb-2 truncate">{{ product.name }}</h4>
                  <p class="text-blue-500 text-2xl font-bold mb-2">${{ product.price.toFixed(2) }}</p>
                  <p class="text-lg text-gray-500">Stock: {{ product.stockQuantity }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Panel: Current Order and Actions -->
          <div class="w-full md:w-1/3 bg-white rounded-lg shadow-lg p-8">
            <!-- Current Order -->
            <div class="mb-8">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-2xl font-bold">Current Order</h3>
                <button 
                  @click="clearCart" 
                  class="text-red-500 hover:text-red-600 text-lg focus:outline-none"
                  :disabled="cart.length === 0"
                >
                  Clear All
                </button>
              </div>

              <div class="max-h-96 overflow-y-auto mb-6">
                <div v-if="cart.length === 0" class="text-center py-12 text-xl text-gray-500">
                  No items in cart
                </div>
                <div v-else>
                  <div 
                    v-for="(item, index) in cart" 
                    :key="index"
                    class="flex justify-between items-center py-4 border-b-2 border-gray-200"
                  >
                    <div>
                      <p class="text-xl font-medium">{{ item.name }}</p>
                      <div class="flex items-center mt-2">
                        <button 
                          @click.stop="decrementQuantity(index)" 
                          class="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-l-lg text-xl focus:outline-none"
                        >
                          -
                        </button>
                        <span class="px-4 py-1 text-xl bg-gray-100">{{ item.quantity }}</span>
                        <button 
                          @click.stop="incrementQuantity(index)" 
                          class="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-r-lg text-xl focus:outline-none"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-xl font-semibold">${{ (item.price * item.quantity).toFixed(2) }}</p>
                      <button 
                        @click.stop="removeFromCart(index)" 
                        class="text-red-500 hover:text-red-600 text-lg mt-2 focus:outline-none"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Order Summary -->
              <div class="border-t-4 border-gray-200 pt-4">
                <div class="flex justify-between mb-2 text-xl">
                  <span>Subtotal</span>
                  <span>${{ subtotal.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between mb-2 text-xl">
                  <span>Tax (10%)</span>
                  <span>${{ tax.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between mb-2 text-xl">
                  <span>Discount</span>
                  <span>${{ discount.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-3xl font-bold mt-4 pt-4 border-t-4 border-gray-200">
                  <span>Total</span>
                  <span>${{ total.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <!-- Payment Actions -->
            <div>
              <h3 class="text-2xl font-bold mb-4">Payment Options</h3>
              <div class="grid grid-cols-2 gap-4 mb-6">
                <button 
                  @click="processPayment('CASH')" 
                  class="bg-green-500 hover:bg-green-600 text-white text-xl font-semibold py-4 rounded-lg focus:outline-none"
                  :disabled="cart.length === 0"
                >
                  Cash
                </button>
                <button 
                  @click="processPayment('CARD')" 
                  class="bg-blue-500 hover:bg-blue-600 text-white text-xl font-semibold py-4 rounded-lg focus:outline-none"
                  :disabled="cart.length === 0"
                >
                  Card
                </button>
              </div>
              <button 
                @click="holdOrder" 
                class="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-xl font-semibold py-4 rounded-lg mb-4 focus:outline-none"
                :disabled="cart.length === 0"
              >
                Hold Order
              </button>
              <button 
                @click="cancelOrder" 
                class="w-full bg-red-500 hover:bg-red-600 text-white text-xl font-semibold py-4 rounded-lg focus:outline-none"
                :disabled="cart.length === 0"
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Card Payment Modal -->
    <div v-if="showCardPaymentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 mx-4">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold">Credit Card Payment</h3>
          <button @click="showCardPaymentModal = false" class="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="border-b border-gray-200 mb-4 pb-4">
          <p class="text-gray-600 mb-1">Order Total</p>
          <p class="text-2xl font-bold">${{ total.toFixed(2) }}</p>
        </div>

        <!-- Card Form -->
        <form @submit.prevent="submitCardPayment">
          <!-- Card Number -->
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="cardNumber">
              Card Number
            </label>
            <input 
              id="cardNumber" 
              v-model="cardDetails.number" 
              type="text" 
              placeholder="1234 5678 9012 3456" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              maxlength="19"
              @input="formatCardNumber"
              required
            >
          </div>

          <div class="flex gap-4 mb-4">
            <!-- Expiration Date -->
            <div class="flex-1">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="expDate">
                Expiration (MM/YY)
              </label>
              <input 
                id="expDate" 
                v-model="cardDetails.expiry" 
                type="text" 
                placeholder="MM/YY" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                maxlength="5"
                @input="formatExpiry"
                required
              >
            </div>

            <!-- CVV -->
            <div class="w-1/3">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="cvv">
                CVV
              </label>
              <input 
                id="cvv" 
                v-model="cardDetails.cvv" 
                type="text" 
                placeholder="123" 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                maxlength="4"
                @input="numericOnly('cvv')"
                required
              >
            </div>
          </div>

          <!-- Cardholder Name -->
          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="cardName">
              Cardholder Name
            </label>
            <input 
              id="cardName" 
              v-model="cardDetails.name" 
              type="text" 
              placeholder="John Doe" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            >
          </div>

          <!-- Submit and Cancel Buttons -->
          <div class="flex gap-4">
            <button 
              type="button" 
              @click="showCardPaymentModal = false" 
              class="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              :disabled="processingPayment"
            >
              <span v-if="processingPayment">Processing...</span>
              <span v-else>Pay ${{ total.toFixed(2) }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <!-- Add this new modal right after the card payment modal in your template -->

<!-- Order Confirmation Modal -->
<div v-if="showOrderConfirmation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 mx-4">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-bold text-green-600">Order Complete</h3>
      <button @click="closeOrderConfirmation" class="text-gray-500 hover:text-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="text-center mb-6">
      <div class="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h4 class="text-2xl font-bold mb-2">Thank You!</h4>
      <p class="text-gray-600">Your order has been successfully processed.</p>
    </div>

    <div class="bg-gray-100 rounded-lg p-4 mb-4">
      <div class="flex justify-between mb-2">
        <span class="font-semibold">Order #:</span>
        <span>{{ completedOrder.orderId }}</span>
      </div>
      <div class="flex justify-between mb-2">
        <span class="font-semibold">Date:</span>
        <span>{{ new Date().toLocaleDateString() }}</span>
      </div>
      <div class="flex justify-between mb-2">
        <span class="font-semibold">Time:</span>
        <span>{{ new Date().toLocaleTimeString() }}</span>
      </div>
      <div class="flex justify-between mb-2">
        <span class="font-semibold">Payment Method:</span>
        <span>{{ completedOrder.paymentMethod }}</span>
      </div>
      <div class="flex justify-between">
        <span class="font-semibold">Total Amount:</span>
        <span class="font-bold">${{ completedOrder.total.toFixed(2) }}</span>
      </div>
    </div>

    <!-- Receipt actions -->
    <div class="flex gap-3 mb-4">
      <button 
        @click="printReceipt" 
        class="flex-1 py-2 flex items-center justify-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print Receipt
      </button>
      <button 
        @click="emailReceipt" 
        class="flex-1 py-2 flex items-center justify-center bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Email Receipt
      </button>
    </div>

    <!-- New order button -->
    <button 
      @click="closeOrderConfirmation" 
      class="w-full py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
    >
      Start New Order
    </button>
  </div>
</div>
</template>
<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { productService, orderService, paymentService } from '@/services/api.service';
import axios from 'axios';

// Create a dedicated API client for barcode scanner service
const barcodeApiClient = axios.create({
  baseURL: 'http://localhost:5173', // This will use the proxy if configured properly
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

export default {
  setup() {
    const router = useRouter();
    const cart = ref([]);
    const products = ref([]);
    const categories = ref([
      { id: 'all', name: 'All Products' },
      { id: 1, name: 'Electronics' },
      { id: 2, name: 'Clothing' },
      { id: 3, name: 'Home & Kitchen' },
      { id: 4, name: 'Books' }
    ]);
    const activeCategory = ref('all');
    const searchQuery = ref('');
    const taxRate = 0.10; // 10% tax
    const discountAmount = ref(0);
    
    // Barcode scanner state
    const scannerConnected = ref(false);
    const lastScannedBarcode = ref(null);
    const pollingInterval = ref(null);
    const videoFeedUrl = ref('');
    const manualBarcodeValue = ref('');
    const inputFocused = ref(false);
    const recentScans = ref([]);
    const barcodeInput = ref(null);
    
    // Card payment state
    const showCardPaymentModal = ref(false);
    const processingPayment = ref(false);
    const cardDetails = ref({
      number: '',
      expiry: '',
      cvv: '',
      name: ''
    });
    
    // Order confirmation state
    const showOrderConfirmation = ref(false);
    const completedOrder = ref({
      orderId: '',
      paymentMethod: '',
      total: 0,
      items: []
    });
    
    // Format card number with spaces every 4 digits
    const formatCardNumber = () => {
      // Remove all non-digits
      let value = cardDetails.value.number.replace(/\D/g, '');
      
      // Add a space after every 4 digits
      let formatted = '';
      for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formatted += ' ';
        }
        formatted += value[i];
      }
      
      // Update the value
      cardDetails.value.number = formatted;
    };

    // Format expiry date as MM/YY
    const formatExpiry = () => {
      // Remove all non-digits
      let value = cardDetails.value.expiry.replace(/\D/g, '');
      
      // Format as MM/YY
      if (value.length > 2) {
        cardDetails.value.expiry = value.substring(0, 2) + '/' + value.substring(2);
      } else {
        cardDetails.value.expiry = value;
      }
    };

    // Allow only numeric input for certain fields
    const numericOnly = (field) => {
      cardDetails.value[field] = cardDetails.value[field].replace(/\D/g, '');
    };
    
    // Update video feed URL
    const setVideoFeedUrl = () => {
      videoFeedUrl.value = '/video_feed';
    };
    
    // Handle video loading error
    const handleVideoError = () => {
      scannerConnected.value = false;
      stopPolling();
    };
    
    // Connect to the scanner
    const connectScanner = async () => {
      try {
        const response = await barcodeApiClient.get('/health');
        if (response.data.status === 'OK') {
          scannerConnected.value = true;
          setVideoFeedUrl();
          startPolling();
        } else {
          scannerConnected.value = false;
        }
      } catch (err) {
        console.error('Error connecting to scanner:', err);
        scannerConnected.value = false;
      }
    };
    
    // Disconnect from the scanner
    const disconnectScanner = () => {
      scannerConnected.value = false;
      stopPolling();
    };
    
    // Toggle scanner connection
    const toggleScanner = () => {
      if (scannerConnected.value) {
        disconnectScanner();
      } else {
        connectScanner();
      }
    };
    
    // Start polling for the latest barcode
    const startPolling = () => {
      if (pollingInterval.value) clearInterval(pollingInterval.value);
      
      pollingInterval.value = setInterval(async () => {
        try {
          const response = await barcodeApiClient.get('/latest_barcode');
          if (response.data && !response.data.error) {
            const newBarcode = response.data;
            
            // Only process if we got a new barcode
            if (!lastScannedBarcode.value || 
                lastScannedBarcode.value.data !== newBarcode.data) {
              lastScannedBarcode.value = newBarcode;
              
              // Find product by barcode
              const product = products.value.find(p => p.barcode === newBarcode.data);
              if (product) {
                addToCart(product);
                
                // Add to recent scans
                addToRecentScans(newBarcode.data);
              } else {
                console.log('Product not found for barcode:', newBarcode.data);
              }
            }
          }
        } catch (err) {
          console.error('Error polling for barcode:', err);
        }
      }, 1000); // Poll every second
    };
    
    // Stop polling
    const stopPolling = () => {
      if (pollingInterval.value) {
        clearInterval(pollingInterval.value);
        pollingInterval.value = null;
      }
    };
    
    // Search by manually entered barcode
    const searchByBarcode = async () => {
      if (!manualBarcodeValue.value) return;
      
      try {
        // Try to find product locally first
        const product = products.value.find(p => p.barcode === manualBarcodeValue.value);
        
        if (product) {
          addToCart(product);
          addToRecentScans(manualBarcodeValue.value);
        } else {
          // If not found locally, try to get from API
          try {
            const response = await barcodeApiClient.post('/scan', { barcode: manualBarcodeValue.value });
            if (response.data && !response.data.error) {
              const product = response.data;
              addToCart(product);
              addToRecentScans(manualBarcodeValue.value);
            } else {
              console.log('Product not found for barcode:', manualBarcodeValue.value);
            }
          } catch (err) {
            console.error('Error searching by barcode:', err);
          }
        }
      } finally {
        clearBarcodeInput();
      }
    };
    
    // Clear barcode input
    const clearBarcodeInput = () => {
      manualBarcodeValue.value = '';
      nextTick(() => {
        barcodeInput.value?.focus();
      });
    };
    
    // Add to recent scans
    const addToRecentScans = (barcode) => {
      const scan = {
        barcode,
        timestamp: new Date().toLocaleTimeString()
      };
      
      // Remove duplicates and keep only the last 5 scans
      recentScans.value = [
        scan,
        ...recentScans.value.filter(s => s.barcode !== barcode)
      ].slice(0, 5);
      
      // Save to localStorage
      try {
        localStorage.setItem('recentScans', JSON.stringify(recentScans.value));
      } catch (err) {
        console.error('Error saving recent scans:', err);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await productService.getAllProducts();
        products.value = response.data || [];
        console.log('Products loaded:', products.value);
      } catch (error) {
        console.error('Error fetching products:', error);
        // For demo purposes, let's add some sample products if the API fails
        products.value = [
          { productId: 1, name: 'Laptop', price: 999.99, categoryId: 1, stockQuantity: 10, barcode: '123456789' },
          { productId: 2, name: 'Smartphone', price: 499.99, categoryId: 1, stockQuantity: 15, barcode: '234567890' },
          { productId: 3, name: 'T-Shirt', price: 19.99, categoryId: 2, stockQuantity: 50, barcode: '345678901' },
          { productId: 4, name: 'Coffee Maker', price: 89.99, categoryId: 3, stockQuantity: 8, barcode: '456789012' },
          { productId: 5, name: 'Novel', price: 12.99, categoryId: 4, stockQuantity: 30, barcode: '567890123' }
        ];
      }
    };

    const filteredProducts = computed(() => {
      let result = products.value;
      
      // Filter by category
      if (activeCategory.value !== 'all') {
        result = result.filter(product => product.categoryId === activeCategory.value);
      }
      
      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(product => 
          product.name.toLowerCase().includes(query) || 
          product.barcode?.includes(query)
        );
      }
      
      return result;
    });

    const addToCart = (product) => {
      const existingItem = cart.value.find(item => item.productId === product.productId);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.value.push({
          ...product,
          quantity: 1
        });
      }
      
      // Save cart to localStorage
      localStorage.setItem('cart', JSON.stringify(cart.value));
    };

    const removeFromCart = (index) => {
      cart.value.splice(index, 1);
      localStorage.setItem('cart', JSON.stringify(cart.value));
    };

    const incrementQuantity = (index) => {
      cart.value[index].quantity += 1;
      localStorage.setItem('cart', JSON.stringify(cart.value));
    };

    const decrementQuantity = (index) => {
      if (cart.value[index].quantity > 1) {
        cart.value[index].quantity -= 1;
      } else {
        removeFromCart(index);
      }
      localStorage.setItem('cart', JSON.stringify(cart.value));
    };

    const clearCart = () => {
      cart.value = [];
      localStorage.removeItem('cart');
    };

    const subtotal = computed(() => {
      return cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    });

    const tax = computed(() => {
      return subtotal.value * taxRate;
    });

    const discount = computed(() => {
      return discountAmount.value;
    });

    const total = computed(() => {
      return subtotal.value + tax.value - discount.value;
    });

    // Process payment - Updated version that shows order confirmation
    const processPayment = async (paymentMethod) => {
      console.log("Processing payment method:", paymentMethod);
      
      if (cart.value.length === 0) return;

      // If Card payment, show the payment modal and exit early
      if (paymentMethod === 'CARD') {
        console.log("Showing card payment modal");
        showCardPaymentModal.value = true;
        return; // Important! This prevents the function from continuing
      }

      // For Cash or other payment methods, continue with original logic
      try {
        console.log("Processing cash payment");
        // Create order
        const orderData = {
          customerId: 1, // Replace with actual customer ID
          totalAmount: subtotal.value,
          taxAmount: tax.value,
          discountAmount: discount.value,
          finalAmount: total.value,
          orderType: "IN_STORE",
          paymentStatus: "PENDING",
          orderItems: cart.value.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity
          }))
        };

        const orderResponse = await orderService.createOrder(orderData);
        const order = orderResponse.data;
        console.log('Order created:', order);

        // Process payment
        const paymentData = {
          transactionId: generateTransactionId(),
          orderId: order.orderId,
          amount: total.value,
          paymentMethod: paymentMethod,
          paymentType: paymentMethod === 'CARD' ? 'CARD' : 'CASH'
        };

        const paymentResponse = await paymentService.processPayment(paymentData);
        console.log('Payment processed:', paymentResponse.data);

        // Set completed order data for confirmation
        completedOrder.value = {
          orderId: order.orderId,
          paymentMethod: 'Cash',
          total: total.value,
          items: [...cart.value]
        };
        
        // Clear cart
        clearCart();
        
        // Show order confirmation
        showOrderConfirmation.value = true;
        
      } catch (error) {
        console.error('Error processing order:', error);
        alert('There was an error processing your order. Please try again.');
      }
    };
    
    // Submit card payment with confirmation
    const submitCardPayment = async () => {
      processingPayment.value = true;
      
      try {
        // Validate card details
        const cardNumber = cardDetails.value.number.replace(/\s/g, '');
        if (cardNumber.length < 13 || cardNumber.length > 19) {
          alert('Please enter a valid card number');
          processingPayment.value = false;
          return;
        }
        
        // Simple validation for other fields
        if (cardDetails.value.expiry.length !== 5) {
          alert('Please enter a valid expiration date (MM/YY)');
          processingPayment.value = false;
          return;
        }
        
        if (cardDetails.value.cvv.length < 3) {
          alert('Please enter a valid CVV code');
          processingPayment.value = false;
          return;
        }
        
        if (cardDetails.value.name.length < 3) {
          alert('Please enter the cardholder name');
          processingPayment.value = false;
          return;
        }
        
        // In a real application, you would send the card details to a payment processor
        // Here we'll simulate a payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Now continue with the order processing
        const orderData = {
          customerId: 1,
          totalAmount: subtotal.value,
          taxAmount: tax.value,
          discountAmount: discount.value,
          finalAmount: total.value,
          orderType: "IN_STORE",
          paymentStatus: "COMPLETED",
          orderItems: cart.value.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity
          }))
        };
        
        // Create order
        const orderResponse = await orderService.createOrder(orderData);
        const order = orderResponse.data;
        
        // Process payment
        const paymentData = {
          transactionId: generateTransactionId(),
          orderId: order.orderId,
          amount: total.value,
          paymentMethod: 'CARD',
          paymentType: 'CARD',
          cardDetails: {
            last4: cardNumber.slice(-4),
            cardholderName: cardDetails.value.name,
            expiryDate: cardDetails.value.expiry
          }
        };
        
        const paymentResponse = await paymentService.processPayment(paymentData);
        
        // Set completed order data for confirmation display
        completedOrder.value = {
          orderId: order.orderId,
          paymentMethod: 'Credit Card',
          total: total.value,
          items: [...cart.value]
        };
        
        // Reset state
        showCardPaymentModal.value = false;
        processingPayment.value = false;
        
        // Reset card details
        cardDetails.value = {
          number: '',
          expiry: '',
          cvv: '',
          name: ''
        };
        
        // Show order confirmation
        showOrderConfirmation.value = true;
        
        // Clear cart
        clearCart();
        
      } catch (error) {
        console.error('Error processing card payment:', error);
        alert('There was an error processing your payment. Please try again.');
        processingPayment.value = false;
      }
    };

    // Close the order confirmation modal and reset for a new order
    const closeOrderConfirmation = () => {
      showOrderConfirmation.value = false;
      // Reset any other order-related state if needed
    };

    // Print receipt functionality
// Print receipt functionality with PDF generation
const printReceipt = () => {
  // Create a new window for the receipt
  const receiptWindow = window.open('', '_blank');
  
  // Current date and time
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB'); // UK date format (DD/MM/YYYY)
  const timeStr = now.toLocaleTimeString('en-GB'); // UK time format
  
  // Format the items for the receipt
  const itemsHtml = completedOrder.value.items.map(item => `
    <tr>
      <td style="padding: 4px 8px; text-align: left;">${item.name}</td>
      <td style="padding: 4px 8px; text-align: center;">${item.quantity}</td>
      <td style="padding: 4px 8px; text-align: right;">£${item.price.toFixed(2)}</td>
      <td style="padding: 4px 8px; text-align: right;">£${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');
  
  // Calculate totals
  const itemsSubtotal = completedOrder.value.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAmount = itemsSubtotal * 0.20; // 20% VAT
  const totalAmount = completedOrder.value.total;
  
  // Write the receipt HTML
  receiptWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt #${completedOrder.value.orderId}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 20px;
          font-size: 12px;
          color: #333;
        }
        .receipt {
          max-width: 300px;
          margin: 0 auto;
          border: 1px solid #ddd;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 1px dashed #ddd;
          padding-bottom: 10px;
        }
        .store-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .store-info {
          font-size: 10px;
          margin-bottom: 5px;
        }
        .receipt-details {
          margin-bottom: 15px;
          font-size: 10px;
        }
        .order-id {
          font-weight: bold;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        th {
          border-bottom: 1px solid #ddd;
          padding: 5px;
          text-align: left;
          font-size: 11px;
        }
        .totals {
          border-top: 1px dashed #ddd;
          padding-top: 10px;
          margin-top: 10px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        .grand-total {
          font-weight: bold;
          font-size: 14px;
          margin-top: 5px;
          border-top: 1px solid #333;
          padding-top: 5px;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 10px;
          border-top: 1px dashed #ddd;
          padding-top: 10px;
        }
        @media print {
          body {
            padding: 0;
          }
          .receipt {
            border: none;
          }
          .print-btn {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <div class="store-name">Retail POS System</div>
          <div class="store-info">123 Main Street</div>
          <div class="store-info">Manchester, M1 1AB</div>
          <div class="store-info">Tel: 0161 123 4567</div>
          <div class="store-info">VAT Reg: GB123456789</div>
        </div>
        
        <div class="receipt-details">
          <div><span class="order-id">Order #:</span> ${completedOrder.value.orderId}</div>
          <div><span class="order-id">Date:</span> ${dateStr}</div>
          <div><span class="order-id">Time:</span> ${timeStr}</div>
          <div><span class="order-id">Payment Method:</span> ${completedOrder.value.paymentMethod}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="text-align: left;">Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>£${itemsSubtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>VAT (20%):</span>
            <span>£${taxAmount.toFixed(2)}</span>
          </div>
          <div class="total-row grand-total">
            <span>TOTAL:</span>
            <span>£${totalAmount.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="footer">
          <div>Thank you for your purchase!</div>
          <div>Please keep this receipt for your records</div>
          <div>www.retailpos.com</div>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px;" class="print-btn">
        <button onclick="window.print();return false;" style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Print Receipt / Save as PDF
        </button>
      </div>
    </body>
    </html>
  `);
  
  receiptWindow.document.close();
};

    // Email receipt functionality
// Email receipt functionality
const emailReceipt = async () => {
  // Prompt for email
  const email = prompt('Please enter email address for receipt:');
  if (!email) return; // User cancelled
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address');
    return;
  }
  
  // In a real app, you would make an API call to your backend
  // Here, we'll simulate the email sending process
  
  try {
    // Show loading message
    alert('Preparing to send receipt to ' + email + '...');
    
    // Create email data - this would be sent to your backend
    const emailData = {
      to: email,
      subject: `Receipt for Order #${completedOrder.value.orderId}`,
      storeInfo: {
        name: 'Retail POS System',
        address: '123 Main Street',
        city: 'Manchester',
        postcode: 'M1 1AB',
        phone: '0161 123 4567',
        vatNumber: 'GB123456789'
      },
      orderInfo: {
        orderId: completedOrder.value.orderId,
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('en-GB'),
        paymentMethod: completedOrder.value.paymentMethod
      },
      items: completedOrder.value.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      totals: {
        subtotal: completedOrder.value.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        tax: completedOrder.value.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.20, // 20% VAT
        total: completedOrder.value.total
      }
    };
    
    console.log('Email receipt data:', emailData);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real application, you would make an API call like:
    // await axios.post('/api/send-receipt-email', emailData);
    
    // Success message
    alert(`Receipt has been sent to ${email}. Thank you for your purchase!`);
    
  } catch (error) {
    console.error('Error sending email receipt:', error);
    alert('There was an error sending the receipt. Please try again later.');
  }
};

    const generateTransactionId = () => {
      return 'TXN' + Date.now().toString();
    };

    const holdOrder = () => {
      if (cart.value.length === 0) return;
      alert('Order has been put on hold.');
    };

    const cancelOrder = () => {
      if (cart.value.length === 0) return;
      if (confirm('Are you sure you want to cancel this order?')) {
        clearCart();
      }
    };

    onMounted(() => {
      fetchProducts();
      
      // Load cart from localStorage if available
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          cart.value = JSON.parse(savedCart);
        } catch (e) {
          console.error('Error parsing saved cart:', e);
          localStorage.removeItem('cart');
        }
      }
      
      // Load recent scans from localStorage if available
      const savedScans = localStorage.getItem('recentScans');
      if (savedScans) {
        try {
          recentScans.value = JSON.parse(savedScans);
        } catch (e) {
          console.error('Error parsing recent scans:', e);
          localStorage.removeItem('recentScans');
        }
      }
      
      // Try to connect to the scanner
      connectScanner();
      
      // Focus barcode input
      nextTick(() => {
        barcodeInput.value?.focus();
      });
    });
    
    onUnmounted(() => {
      // Clean up
      stopPolling();
    });

    return {
      // POS state
      products,
      categories,
      activeCategory,
      searchQuery,
      cart,
      filteredProducts,
      
      // Barcode scanner state
      scannerConnected,
      videoFeedUrl,
      lastScannedBarcode,
      manualBarcodeValue,
      inputFocused,
      recentScans,
      barcodeInput,
      
      // Card payment state
      showCardPaymentModal,
      processingPayment,
      cardDetails,
      
      // Order confirmation state
      showOrderConfirmation,
      completedOrder,
      
      // Barcode methods
      handleVideoError,
      connectScanner,
      toggleScanner,
      searchByBarcode,
      clearBarcodeInput,
      
      // Card payment methods
      formatCardNumber,
      formatExpiry,
      numericOnly,
      submitCardPayment,
      
      // Order confirmation methods
      closeOrderConfirmation,
      printReceipt,
      emailReceipt,
      
      // Cart methods
      addToCart,
      removeFromCart,
      incrementQuantity,
      decrementQuantity,
      clearCart,
      
      // Payment calculations and methods
      subtotal,
      tax,
      discount,
      total,
      processPayment,
      holdOrder,
      cancelOrder
    };
  }
};
</script>