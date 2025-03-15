<template>
  <div class="bg-white shadow-md rounded-lg p-4">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-bold">Barcode Scanner</h3>
      <div 
        class="px-2 py-1 rounded-full text-xs font-medium" 
        :class="scannerStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
      >
        {{ scannerStatus ? 'Connected' : 'Disconnected' }}
      </div>
    </div>

    <div class="relative mb-4">
      <input 
        type="text" 
        ref="barcodeInput"
        v-model="barcodeValue" 
        placeholder="Scan or enter barcode" 
        class="w-full p-3 pl-10 border rounded-lg"
        @keyup.enter="searchProduct"
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
        @click="searchProduct" 
        class="flex-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
      >
        Search
      </button>
      <button 
        @click="clearInput" 
        class="px-4 py-2 border rounded-md hover:bg-gray-100 transition"
      >
        Clear
      </button>
    </div>

    <!-- Scanner Animation (shows when input is focused) -->
    <div 
      v-if="inputFocused" 
      class="mt-4 h-8 bg-gray-200 rounded-md overflow-hidden relative"
    >
      <div 
        class="h-full bg-red-500 w-1 absolute animate-scanner"
      ></div>
    </div>

    <!-- Video Feed (optional, if you want to display the actual video feed) -->
    <div v-if="showVideoFeed" class="mt-4">
      <div class="relative">
        <img :src="videoFeedUrl" class="w-full rounded-md" alt="Scanner Video Feed" />
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="border-2 border-blue-500 w-64 h-32 opacity-50"></div>
        </div>
      </div>
      <button 
        @click="showVideoFeed = false" 
        class="mt-2 text-sm text-blue-600 hover:underline"
      >
        Hide Video Feed
      </button>
    </div>
    <div v-else class="mt-2">
      <button 
        @click="showVideoFeed = true" 
        class="text-sm text-blue-600 hover:underline"
      >
        Show Video Feed
      </button>
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
            @click="barcodeValue = scan.barcode; searchProduct()"
          >
            Use
          </span>
        </div>
      </div>
    </div>

    <!-- Loading and Error States -->
    <div v-if="loading" class="mt-4 text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      <p class="text-sm text-gray-500 mt-2">Searching...</p>
    </div>

    <div v-if="error" class="mt-4 bg-red-100 text-red-800 p-3 rounded-md">
      {{ error }}
    </div>

    <!-- Product Result -->
    <div v-if="foundProduct" class="mt-4 bg-green-50 p-4 rounded-lg border border-green-200">
      <div class="flex justify-between">
        <h4 class="font-bold">{{ foundProduct.name }}</h4>
        <span class="text-green-600 font-bold">${{ foundProduct.price.toFixed(2) }}</span>
      </div>
      <p class="text-sm text-gray-600">Product ID: {{ foundProduct.productId }}</p>
      <p class="text-sm text-gray-600">Stock: {{ foundProduct.stockQuantity }}</p>
      <button 
        @click="addToCart(foundProduct)" 
        class="mt-2 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        Add to Cart
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, onUnmounted } from 'vue';
import { productService } from '../services/api.service';

export default {
  emits: ['product-found', 'add-to-cart'],
  
  setup(props, { emit }) {
    const barcodeInput = ref(null);
    const barcodeValue = ref('');
    const scannerStatus = ref(true);
    const inputFocused = ref(false);
    const loading = ref(false);
    const error = ref('');
    const foundProduct = ref(null);
    const recentScans = ref([]);
    const showVideoFeed = ref(false);
    const videoFeedUrl = ref('http://localhost:5001/video_feed');
    const pollingInterval = ref(null);
    const flaskApiUrl = ref('http://localhost:5001');

    // Check scanner connection
    const checkScannerConnection = async () => {
      try {
        const response = await fetch(`${flaskApiUrl.value}/health`);
        scannerStatus.value = response.ok;
      } catch (err) {
        console.error('Error checking scanner connection:', err);
        scannerStatus.value = false;
      }
    };

    // Poll for latest barcode
    const startPollingForBarcode = () => {
      pollingInterval.value = setInterval(async () => {
        if (scannerStatus.value) {
          try {
            const response = await fetch(`${flaskApiUrl.value}/latest_barcode`);
            if (response.ok) {
              const data = await response.json();
              if (data && data.data && data.data !== barcodeValue.value) {
                console.log('Barcode detected:', data.data);
                barcodeValue.value = data.data;
                await searchProduct();
              }
            }
          } catch (err) {
            console.error('Error polling for barcode:', err);
          }
        }
      }, 1000); // Poll every second
    };

    onMounted(() => {
      // Focus the input on component mount
      nextTick(() => {
        barcodeInput.value.focus();
      });
      
      // Check connection and start polling
      checkScannerConnection();
      startPollingForBarcode();
      
      // Schedule periodic connection checks
      setInterval(checkScannerConnection, 5000);
      
      // Load recent scans from localStorage if available
      const savedScans = localStorage.getItem('recentScans');
      if (savedScans) {
        try {
          recentScans.value = JSON.parse(savedScans);
        } catch (err) {
          console.error('Error parsing recent scans:', err);
        }
      }
    });

    // Clean up on component unmount
    onUnmounted(() => {
      if (pollingInterval.value) {
        clearInterval(pollingInterval.value);
      }
    });

    const searchProduct = async () => {
      if (!barcodeValue.value) return;
      
      loading.value = true;
      error.value = '';
      foundProduct.value = null;
      
      try {
        const response = await productService.getProductByBarcode(barcodeValue.value);
        
        if (response.data) {
          foundProduct.value = response.data;
          emit('product-found', foundProduct.value);
          
          // Add to recent scans
          addToRecentScans(barcodeValue.value);
        } else {
          error.value = 'Product not found';
        }
      } catch (err) {
        console.error('Error fetching product by barcode:', err);
        error.value = err.response?.data || 'Error searching for product';
        
        // For demo purposes, simulate finding a product even if API fails
        if (barcodeValue.value === '123456789') {
          foundProduct.value = {
            productId: 1,
            name: 'Demo Product',
            price: 29.99,
            stockQuantity: 10,
            barcode: barcodeValue.value
          };
          emit('product-found', foundProduct.value);
          addToRecentScans(barcodeValue.value);
        }
      } finally {
        loading.value = false;
      }
    };

    const addToRecentScans = (barcode) => {
      // Add to recent scans with timestamp
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

    const clearInput = () => {
      barcodeValue.value = '';
      error.value = '';
      foundProduct.value = null;
      nextTick(() => {
        barcodeInput.value.focus();
      });
    };

    const addToCart = (product) => {
      emit('add-to-cart', product);
      clearInput();
    };

    return {
      barcodeInput,
      barcodeValue,
      scannerStatus,
      inputFocused,
      loading,
      error,
      foundProduct,
      recentScans,
      showVideoFeed,
      videoFeedUrl,
      searchProduct,
      clearInput,
      addToCart
    };
  }
};
</script>

<style scoped>
.animate-scanner {
  animation: scan 1.5s infinite linear;
}

@keyframes scan {
  0% { left: 0%; }
  100% { left: 100%; }
}
</style>