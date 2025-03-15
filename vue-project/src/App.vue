<script setup>
import { defineComponent } from 'vue';
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-blue-600 text-white py-4 shadow-md">
      <div class="container mx-auto flex justify-between items-center px-6">
        <h1 class="text-xl font-bold">POS System</h1>
      </div>
    </header>

    <!-- Main content -->
    <main class="container mx-auto p-6">
      <!-- This is where the routed components will be injected -->
      <router-view></router-view>
    </main>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>
