<template>
  <div class="bg-white shadow-lg rounded-lg p-6 mb-4">
    <h3 class="text-xl font-bold mb-4">Payment Information</h3>

    <div v-if="cart.length === 0">
      <p>Your cart is empty. Please add products to the cart before proceeding.</p>
    </div>

    <div v-else>
      <h4 class="text-lg font-semibold">Order Summary</h4>
      <ul>
        <li v-for="(item, index) in cart" :key="index">
          {{ item.name }} - ${{ item.price }}
        </li>
      </ul>
      <p class="mt-4 font-semibold">Total: ${{ totalAmount }}</p>

      <!-- Payment Form -->
      <div>
        <label for="card-element">Credit or Debit Card</label>
        <input type="text" v-model="cardDetails.cardNumber" placeholder="Card Number" class="p-2 border rounded-md w-full mt-2"/>
        <input type="text" v-model="cardDetails.expiry" placeholder="Expiry Date (MM/YY)" class="p-2 border rounded-md w-full mt-2"/>
        <input type="text" v-model="cardDetails.cvc" placeholder="CVC" class="p-2 border rounded-md w-full mt-2"/>
        <button
          @click="handlePayment"
          class="mt-4 bg-green-500 text-white p-2 rounded-md"
          :disabled="processing"
        >
          {{ processing ? 'Processing...' : 'Pay Now' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      cart: JSON.parse(localStorage.getItem('cart')) || [],
      processing: false,
      cardDetails: {
        cardNumber: '',
        expiry: '',
        cvc: '',
      },
    };
  },
  methods: {
    async handlePayment() {
      // Validate the card details
      if (!this.cardDetails.cardNumber || !this.cardDetails.expiry || !this.cardDetails.cvc) {
        return alert("Please provide valid card details.");
      }

      this.processing = true;

      const order = JSON.parse(localStorage.getItem('order'));
      if (!order) {
        alert("Order not found. Redirecting to home.");
        this.$router.push('/');
        return;
      }

      // Prepare the payment data
      const paymentData = {
        orderId: order.id,
        amount: order.finalAmount,
        paymentMethod: "CREDIT_CARD",
        cardDetails: this.cardDetails,
      };

      try {
        // Send the payment data to the backend for processing
        const response = await axios.post('http://localhost:8080/api/payment', paymentData);

        if (response.data.status === 'success') {
          alert("Payment successful!");
          localStorage.removeItem("cart");
          localStorage.removeItem("order");
          this.$router.push("/confirmation");
        } else {
          alert("Payment failed. Please try again.");
        }
      } catch (error) {
        console.error("Error processing payment:", error);
        alert("There was an error during payment processing.");
      } finally {
        this.processing = false;
      }
    },
  },
  computed: {
    totalAmount() {
      return this.cart.reduce((sum, item) => sum + item.price, 0);
    },
  },
  watch: {
    totalAmount(newValue) {
      if (newValue > 0) {
        // Trigger payment flow if total amount is positive
      }
    },
  },
  created() {
    if (this.cart.length === 0) {
      this.$router.push('/');
    }
  },
};
</script>
