<!-- src/views/POSDashboard.vue -->
<template>
  <div class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-6 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Panel: Barcode Scanner and Product Search -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Barcode Scanner -->
          <BarcodeScanner 
            @product-found="handleProductFound" 
            @add-to-cart="addToCart" 
          />
          
          <!-- Product Categories and List -->
          <div class="bg-white rounded-lg shadow-lg overflow-hidden">
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

            <!-- Loading Indicator -->
            <div v-if="loading" class="p-8 text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p class="mt-4 text-gray-500">Loading products...</p>
            </div>

            <!-- Error Message -->
            <div v-else-if="errorMessage" class="p-8 text-center">
              <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                <p>{{ errorMessage }}</p>
              </div>
              <button 
                @click="fetchProducts" 
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Try Again
              </button>
            </div>

            <!-- Product Grid -->
            <div v-else class="p-8">
              <div class="mb-6">
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  placeholder="Search products..." 
                  class="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
              </div>
              
              <!-- No Products Message -->
              <div v-if="filteredProducts.length === 0" class="text-center py-8">
                <p class="text-xl text-gray-500">No products found. Try a different category or search term.</p>
              </div>
              
              <!-- Products Grid -->
              <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div 
                  v-for="product in filteredProducts" 
                  :key="product.productId"
                  @click="addToCart(product)"
                  class="bg-white rounded-lg shadow-md p-4 cursor-pointer transition-transform duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
                >
                  <div class="bg-gray-200 rounded-lg mb-4 p-3 flex items-center justify-center">
                    <span class="text-4xl text-gray-400">{{ getCategoryIcon(product.categoryId) }}</span>
                  </div>
                  <h4 class="text-lg font-semibold mb-2 truncate">{{ product.name }}</h4>
                  <p class="text-blue-500 text-xl font-bold mb-2">${{ product.price.toFixed(2) }}</p>
                  <p class="text-sm text-gray-500">Stock: {{ product.stockQuantity }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Shopping Cart -->
        <div class="lg:col-span-1">
          <ShoppingCart 
            :initial-items="cart" 
            @update:items="updateCart" 
            @checkout="handleCheckout"
            @hold="handleHoldOrder"
            @cancel="handleCancelOrder"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { productService } from '@/services/api.service';
import BarcodeScanner from '@/components/BarcodeScanner.vue';
import ShoppingCart from '@/components/ShoppingCart.vue';

export default {
  components: {
    BarcodeScanner,
    ShoppingCart
  },
  
  setup() {
    const router = useRouter();
    const cart = ref([]);
    const products = ref([]);
    const loading = ref(true);
    const errorMessage = ref('');
    
    const categories = ref([
      { id: 'all', name: 'All Products' },
      { id: 1, name: 'Electronics' },
      { id: 2, name: 'Clothing' },
      { id: 3, name: 'Home & Kitchen' },
      { id: 4, name: 'Books' }
    ]);
    
    const activeCategory = ref('all');
    const searchQuery = ref('');

    const fetchProducts = async () => {
      loading.value = true;
      errorMessage.value = '';
      
      try {
        console.log('Fetching products from API...');
        const response = await productService.getAllProducts();
        
        // Check if the response has data
        if (response && response.data && response.data.length > 0) {
          console.log(`Successfully loaded ${response.data.length} products from API`);
          products.value = response.data;
        } else {
          console.log('API returned empty data, using sample products');
          useSampleProducts();
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        
        // Determine if it's a connection error
        if (error.message && error.message.includes('Network Error')) {
          errorMessage.value = 'Could not connect to the server. Please check your connection.';
        } else {
          errorMessage.value = 'Failed to load products. Using sample data instead.';
          useSampleProducts();
        }
      } finally {
        loading.value = false;
      }
    };

    // Function to load sample products (moved to a separate function)
    const useSampleProducts = () => {
      console.log('Loading sample products...');
      products.value = [
        { productId: 1, name: 'Laptop', price: 999.99, categoryId: 1, stockQuantity: 10, barcode: '123456789' },
        { productId: 2, name: 'Smartphone', price: 499.99, categoryId: 1, stockQuantity: 15, barcode: '234567890' },
        { productId: 3, name: 'T-Shirt', price: 19.99, categoryId: 2, stockQuantity: 50, barcode: '345678901' },
        { productId: 4, name: 'Coffee Maker', price: 89.99, categoryId: 3, stockQuantity: 8, barcode: '456789012' },
        { productId: 5, name: 'Novel', price: 12.99, categoryId: 4, stockQuantity: 30, barcode: '567890123' },
        { productId: 6, name: 'Headphones', price: 159.99, categoryId: 1, stockQuantity: 12, barcode: '678901234' },
        { productId: 7, name: 'Jeans', price: 45.99, categoryId: 2, stockQuantity: 25, barcode: '789012345' },
        { productId: 8, name: 'Blender', price: 69.99, categoryId: 3, stockQuantity: 10, barcode: '890123456' },
        { productId: 9, name: 'Cookbook', price: 24.99, categoryId: 4, stockQuantity: 15, barcode: '901234567' }
      ];
      console.log(`Loaded ${products.value.length} sample products`);
    };

    // Watch for changes in the selected category
    watch(activeCategory, (newCategory) => {
      console.log(`Category changed to: ${newCategory}`);
    });

    const filteredProducts = computed(() => {
      console.log(`Computing filtered products. Category: ${activeCategory.value}, Search: "${searchQuery.value}", Total Products: ${products.value.length}`);
      
      let result = products.value;
      
      // Filter by category
      if (activeCategory.value !== 'all') {
        const categoryId = typeof activeCategory.value === 'string' 
          ? parseInt(activeCategory.value) 
          : activeCategory.value;
          
        result = result.filter(product => product.categoryId === categoryId);
        console.log(`After category filter: ${result.length} products`);
      }
      
      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(product => 
          product.name.toLowerCase().includes(query) || 
          (product.barcode && product.barcode.includes(query))
        );
        console.log(`After search filter: ${result.length} products`);
      }
      
      return result;
    });

    // Get the appropriate icon for each category
    const getCategoryIcon = (categoryId) => {
      switch (categoryId) {
        case 1: return '📱'; // Electronics
        case 2: return '👚'; // Clothing
        case 3: return '🏠'; // Home & Kitchen
        case 4: return '📚'; // Books
        default: return '📦'; // Default
      }
    };

    const addToCart = (product) => {
      console.log(`Adding product to cart: ${product.name}`);
      const existingItem = cart.value.find(item => item.productId === product.productId);
      
      if (existingItem) {
        existingItem.quantity += 1;
        console.log(`Increased quantity for ${product.name} to ${existingItem.quantity}`);
      } else {
        cart.value.push({
          ...product,
          quantity: 1
        });
        console.log(`Added new product to cart: ${product.name}`);
      }
      
      // Save cart to localStorage
      localStorage.setItem('cart', JSON.stringify(cart.value));
    };

    // Update cart from ShoppingCart component
    const updateCart = (newCart) => {
      cart.value = newCart;
      console.log('Cart updated, new count:', cart.value.length);
    };

    // Handle checkout from shopping cart
    const handleCheckout = (data) => {
      console.log('Checkout initiated with data:', data);
      
      // Store order in localStorage
      localStorage.setItem('order', JSON.stringify(data.orderData));
      
      // Navigate to payment page
      router.push('/payment');
    };

    // Handle product found from barcode scanner
    const handleProductFound = (product) => {
      console.log('Product found from barcode scanner:', product);
      // You can do additional processing here if needed
    };

    // Handle hold order
    const handleHoldOrder = (items) => {
      console.log('Order held with items:', items);
      // In a real implementation, you would save this to a database
      alert('Order has been put on hold.');
    };

    // Handle cancel order
    const handleCancelOrder = () => {
      console.log('Order cancelled');
      cart.value = [];
      localStorage.removeItem('cart');
    };

    onMounted(() => {
      console.log('POSDashboard component mounted');
      
      // Fetch products
      fetchProducts();
      
      // Load cart from localStorage if available
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          cart.value = JSON.parse(savedCart);
          console.log(`Loaded ${cart.value.length} items from saved cart`);
        } catch (error) {
          console.error('Error parsing saved cart:', error);
        }
      }
    });

    return {
      products,
      categories,
      activeCategory,
      searchQuery,
      cart,
      loading,
      errorMessage,
      filteredProducts,
      addToCart,
      updateCart,
      handleCheckout,
      handleProductFound,
      handleHoldOrder,
      handleCancelOrder,
      fetchProducts,
      getCategoryIcon
    };
  }
};
</script>