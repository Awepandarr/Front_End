<!-- src/views/POSDashboard.vue -->
<template>
  <div class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-6 py-8">
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
                        @click="decrementQuantity(index)" 
                        class="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-l-lg text-xl focus:outline-none"
                      >
                        -
                      </button>
                      <span class="px-4 py-1 text-xl bg-gray-100">{{ item.quantity }}</span>
                      <button 
                        @click="incrementQuantity(index)" 
                        class="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-r-lg text-xl focus:outline-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-xl font-semibold">${{ (item.price * item.quantity).toFixed(2) }}</p>
                    <button 
                      @click="removeFromCart(index)" 
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
</template>
<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { productService, orderService, paymentService } from '@/services/api.service';

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
          product.barcode.includes(query)
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

    const processPayment = async (paymentMethod) => {
      if (cart.value.length === 0) return;

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

      try {
        // Create order
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

        // Clear cart and show success
        clearCart();
        alert(`Payment successful! Order #${order.orderId} completed.`);
      } catch (error) {
        console.error('Error processing order:', error);
        alert('There was an error processing your order. Please try again.');
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
        cart.value = JSON.parse(savedCart);
      }
    });

    return {
      products,
      categories,
      activeCategory,
      searchQuery,
      cart,
      filteredProducts,
      addToCart,
      removeFromCart,
      incrementQuantity,
      decrementQuantity,
      clearCart,
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