<template>
  <div class="bg-white shadow-lg rounded-lg p-6 mb-4">
    <h3 class="text-xl font-bold mb-4">Product List</h3>
    <div class="grid grid-cols-2 gap-4">
      <div v-for="product in products" :key="product.id" class="border p-4 rounded-md">
        <h4 class="text-lg font-semibold">{{ product.name }}</h4>
        <p>Price: ${{ product.price }}</p>
        <p>Stock: {{ product.stockQuantity }}</p>
        <button 
          @click="addToOrder(product)" 
          class="mt-4 bg-blue-500 text-white p-2 rounded-md"
        >
          Add to Order
        </button>
      </div>
    </div>
    
    <!-- Cart Section -->
    <div class="mt-6 bg-gray-100 p-4 rounded-md">
      <h4 class="text-lg font-semibold">Your Cart</h4>
      <div v-if="cart.length === 0">Your cart is empty.</div>
      <ul v-else>
        <li v-for="(item, index) in cart" :key="index">
          {{ item.name }} - ${{ item.price }} 
          <button @click="removeFromCart(index)" class="ml-2 text-red-500">Remove</button>
        </li>
      </ul>
      <button 
        @click="proceedToOrder"
        class="mt-4 bg-blue-500 text-white p-2 rounded-md"
        :disabled="cart.length === 0"
      >
        Place Order
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      products: [],
      cart: JSON.parse(localStorage.getItem('cart')) || [],
    };
  },
  methods: {
    async fetchProducts() {
      try {
        const response = await axios.get('http://localhost:8080/api/products');
        this.products = response.data;
      } catch (error) {
        console.error("Error fetching products:", error);
        alert("There was an error fetching products. Please try again later.");
      }
    },
    addToOrder(product) {
      this.cart.push(product);
      localStorage.setItem('cart', JSON.stringify(this.cart));
    },
    removeFromCart(index) {
      this.cart.splice(index, 1);
      localStorage.setItem('cart', JSON.stringify(this.cart));
    },
    async proceedToOrder() {
      const orderData = {
        customerId: 1,  // Replace with actual logged-in user ID
        totalAmount: this.cart.reduce((sum, item) => sum + item.price, 0),
        orderType: "ONLINE",
        finalAmount: this.cart.reduce((sum, item) => sum + item.price, 0),
        products: this.cart,
      };

      try {
        const response = await axios.post('http://localhost:8080/api/order', orderData);
        console.log("Order created successfully:", response);  // Log the response
        const order = response.data;

        // Store order in local storage
        localStorage.setItem('order', JSON.stringify(order));

        // Navigate to order confirmation page
        this.$router.push({ name: "ConfirmationPage" })
  .catch(err => {
    console.error("Navigation error:", err);
  });
      } catch (error) {
        console.error("Error creating order:", error.response || error);
        alert("There was an error creating your order. Please try again later.");
      }
    },
  },
  created() {
    this.fetchProducts();
  },
};
</script>
