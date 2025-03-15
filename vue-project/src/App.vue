<template>
  <MainLayout v-if="!isSimplePage">
    <router-view />
  </MainLayout>
  <router-view v-else />
</template>

<script>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import MainLayout from '@/components/MainLayout.vue';

export default {
  components: {
    MainLayout
  },
  setup() {
    const route = useRoute();
    
    // Define which routes don't need the main layout (e.g., login page, confirmation page)
    const isSimplePage = computed(() => {
      const simplePages = ['/confirmation', '/login', '/payment'];
      return simplePages.includes(route.path);
    });
    
    return {
      isSimplePage
    };
  }
};
</script>

<style>
@import './assets/main.css';
</style>