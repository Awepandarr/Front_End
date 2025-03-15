<template>
    <div class="border rounded p-4 shadow bg-white">
      <h3 class="text-lg font-bold mb-3">Barcode Scanner</h3>
  
      <div class="p-3">
        <p><strong>Scanner ID:</strong> {{ scanner.id }}</p>
        <p><strong>Status:</strong> <span :class="statusClass">{{ scanner.status }}</span></p>
      </div>
  
      <button class="bg-blue-600 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700">
        Scan Barcode
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  const scanner = ref({
    id: 'SC001',
    status: 'Connected'
  });
  
  const statusClass = computed(() => ({
    'text-green-600': scanner.value.status === 'Connected',
    'text-red-600': scanner.value.status === 'Disconnected'
  }));
  </script>
  
  <style scoped>
  /* Keeping it minimal for consistency */
  </style>
  