<template>
  <div class="bg-white shadow-lg rounded-lg p-6 mb-4">
    <h3 class="text-xl font-bold mb-4">Order Confirmation</h3>
    <div v-if="order">
      <p><strong>Order ID:</strong> {{ order.id }}</p>
      <ul>
        <li v-for="(item, index) in order.products" :key="index">
          {{ item.name }} - ${{ item.price }}
        </li>
      </ul>
      <p class="mt-4 font-semibold">Total Amount: ${{ order.totalAmount }}</p>
      <p class="mt-4 text-green-500">Your order has been confirmed!</p>
    </div>
    <div v-else>
      <p>No order found. Redirecting you to the cart.</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      order: JSON.parse(localStorage.getItem('order')) || null,
    };
  },
  created() {
    if (!this.order) {
      // If no order, redirect to cart or homepage
      this.$router.push('/');
    }
  },
};
</script>
