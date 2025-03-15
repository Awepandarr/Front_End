<template>
    <div class="bg-gray-100 min-h-screen p-6">
      <div class="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 class="text-2xl font-bold text-center mb-4">POS System</h2>
        <div class="grid grid-cols-2 gap-4">
          <!-- Left Panel -->
          <div>
            <Transaction />
            <OrderDetails />
          </div>
          <!-- Right Panel -->
          <div>
            <ProductList />
            <Payment />
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import Transaction from '../views/Transaction.vue';
  import OrderDetails from '../views/OrderDetails.vue';
  import ProductList from '../views/ProductList.vue';
  import Payment from '../views/Payment.vue';
  
  export default {
    components: { Transaction, OrderDetails, ProductList, Payment },
  };
  </script>
  
  <style scoped>
  /* Custom styles (if needed) */
  </style>
  