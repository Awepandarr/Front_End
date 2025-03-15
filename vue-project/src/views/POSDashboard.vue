<!-- src/views/POSDashboard.vue -->
<template>
  <div class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-6 py-8">
      <div class="flex flex-col md:flex-row gap-6">
        <!-- Left Panel: Product Categories and List -->
        <div class="w-full md:w-2/3 bg-white rounded-lg shadow-md overflow-hidden">
          <!-- Category Tabs -->
          <div class="flex overflow-x-auto bg-gray-100 border-b">
            <button 
              v-for="category in categories" 
              :key="category.id"
              @click="activeCategory = category.id"
              :class="[
                'px-4 py-3 text-sm font-medium whitespace-nowrap',
                activeCategory === category.id ? 'bg-white border-b-2 border-blue-500' : 'hover:bg-gray-200'
              ]"
            >
              {{ category.name }}
            </button>
          </div>

          <!-- Product Grid -->
          <div class="p-4">
            <div class="mb-4">
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Search products..." 
                class="w-full p-2 border rounded-md"
              >
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div 
                v-for="product in filteredProducts" 
                :key="product.productId"
                @click="addToCart(product)"
                class="border rounded-lg p-3 cursor-pointer hover:shadow-md transition"
              >
                <div class="h-24 bg-gray-200 rounded-md mb-2 flex items-center justify-center text-gray-400">
                  <span>Product Image</span>
                </div>
                <h4 class="font-semibold text-sm truncate">{{ product.name }}</h4>
                <p class="text-blue-600 font-bold text-sm">${{ product.price.toFixed(2) }}</p>
                <p class="text-xs text-gray-500">Stock: {{ product.stockQuantity }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Current Order and Actions -->
        <div class="w-full md:w-1/3 flex flex-col gap-4">
          <!-- Current Order -->
          <div class="bg-white rounded-lg shadow-md p-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold">Current Order</h3>
              <button 
                @click="clearCart" 
                class="text-red-500 text-sm"
                :disabled="cart.length === 0"
              >
                Clear All
              </button>
            </div>

            <div class="max-h-80 overflow-y-auto mb-4">
              <div v-if="cart.length === 0" class="text-center py-8 text-gray-500">
                No items in cart
              </div>
              <div v-else>
                <div 
                  v-for="(item, index) in cart" 
                  :key="index"
                  class="flex justify-between items-center py-2 border-b"
                >
                  <div>
                    <p class="font-medium">{{ item.name }}</p>
                    <div class="flex items-center mt-1">
                      <button 
                        @click="decrementQuantity(index)" 
                        class="bg-gray-200 px-2 rounded-l"
                      >
                        -
                      </button>
                      <span class="px-2 bg-gray-100">{{ item.quantity }}</span>
                      <button 
                        @click="incrementQuantity(index)" 
                        class="bg-gray-200 px-2 rounded-r"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold">${{ (item.price * item.quantity).toFixed(2) }}</p>
                    <button 
                      @click="removeFromCart(index)" 
                      class="text-xs text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Summary -->
            <div class="border-t pt-2">
              <div class="flex justify-between mb-1">
                <span>Subtotal</span>
                <span>${{ subtotal.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between mb-1">
                <span>Tax (10%)</span>
                <span>${{ tax.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between mb-1">
                <span>Discount</span>
                <span>${{ discount.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                <span>Total</span>
                <span>${{ total.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- Payment Actions -->
          <div class="bg-white rounded-lg shadow-md p-4">
            <h3 class="text-lg font-bold mb-3">Payment Options</h3>
            <div class="grid grid-cols-2 gap-2 mb-4">
              <button 
                @click="processPayment('CASH')" 
                class="bg-green-500 text-white py-3 rounded-md hover:bg-green-600"
                :disabled="cart.length === 0"
              >
                Cash
              </button>
              <button 
                @click="processPayment('CARD')" 
                class="bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600"
                :disabled="cart.length === 0"
              >
                Card
              </button>
            </div>
            <button 
              @click="holdOrder" 
              class="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 mb-2"
              :disabled="cart.length === 0"
            >
              Hold Order
            </button>
            <button 
              @click="cancelOrder" 
              class="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600"
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