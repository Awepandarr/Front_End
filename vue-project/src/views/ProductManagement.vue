<!-- src/views/ProductManagement.vue -->
<template>
    <div class="bg-white shadow-lg rounded-lg overflow-hidden">
      <div class="p-6 bg-blue-600 text-white flex justify-between items-center">
        <h1 class="text-2xl font-bold">Product Management</h1>
        <button 
          @click="showAddProductModal = true" 
          class="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50"
        >
          Add Product
        </button>
      </div>
  
      <!-- Search and Filter -->
      <div class="p-6 border-b">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search products..." 
              class="w-full p-3 border rounded-lg"
              @input="searchProducts"
            >
          </div>
          <div class="flex gap-4">
            <select 
              v-model="filterCategory" 
              class="p-3 border rounded-lg bg-white"
            >
              <option value="all">All Categories</option>
              <option value="1">Electronics</option>
              <option value="2">Clothing</option>
              <option value="3">Home & Kitchen</option>
              <option value="4">Books</option>
            </select>
            <select 
              v-model="sortBy" 
              class="p-3 border rounded-lg bg-white"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="stock">Sort by Stock</option>
            </select>
          </div>
        </div>
      </div>
  
      <!-- Product List -->
      <div class="p-6">
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-500">Loading products...</p>
        </div>
  
        <div v-else-if="filteredProducts.length === 0" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p class="text-lg text-gray-500">No products found</p>
          <button 
            @click="showAddProductModal = true" 
            class="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Add Your First Product
          </button>
        </div>
  
        <div v-else>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barcode</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="product in paginatedProducts" :key="product.productId">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {{ getCategoryName(product.categoryId) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${{ product.price.toFixed(2) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span 
                      :class="[
                        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                        product.stockQuantity > 10 ? 'bg-green-100 text-green-800' : 
                        product.stockQuantity > 5 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      ]"
                    >
                      {{ product.stockQuantity }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ product.barcode }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <button 
                      @click="editProduct(product)" 
                      class="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button 
                      @click="confirmDeleteProduct(product)" 
                      class="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <!-- Pagination -->
          <div class="flex justify-between items-center mt-4">
            <div class="text-sm text-gray-500">
              Showing {{ pagination.start + 1 }} to {{ Math.min(pagination.end, filteredProducts.length) }} of {{ filteredProducts.length }} products
            </div>
            <div class="flex space-x-2">
              <button 
                @click="prevPage" 
                class="px-3 py-1 border rounded"
                :disabled="pagination.page === 1"
                :class="pagination.page === 1 ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50'"
              >
                Previous
              </button>
              <button 
                @click="nextPage" 
                class="px-3 py-1 border rounded"
                :disabled="pagination.page === totalPages"
                :class="pagination.page === totalPages ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50'"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Add/Edit Product Modal -->
      <div v-if="showAddProductModal || showEditProductModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg w-full max-w-lg mx-4">
          <div class="p-6 border-b">
            <h2 class="text-xl font-bold">{{ showEditProductModal ? 'Edit Product' : 'Add New Product' }}</h2>
          </div>
          <div class="p-6">
            <form @submit.prevent="submitProductForm">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input 
                    type="text" 
                    v-model="productForm.name" 
                    class="w-full p-2 border rounded"
                    required
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    v-model="productForm.categoryId" 
                    class="w-full p-2 border rounded"
                    required
                  >
                    <option value="1">Electronics</option>
                    <option value="2">Clothing</option>
                    <option value="3">Home & Kitchen</option>
                    <option value="4">Books</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input 
                    type="number" 
                    v-model="productForm.price" 
                    step="0.01" 
                    min="0.01" 
                    class="w-full p-2 border rounded"
                    required
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input 
                    type="number" 
                    v-model="productForm.stockQuantity" 
                    min="0" 
                    class="w-full p-2 border rounded"
                    required
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                  <input 
                    type="text" 
                    v-model="productForm.barcode" 
                    class="w-full p-2 border rounded"
                    required
                  >
                </div>
              </div>
              <div class="mt-6 flex justify-end space-x-3">
                <button 
                  type="button"
                  @click="closeProductModal" 
                  class="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  :disabled="submitting"
                >
                  {{ submitting ? 'Saving...' : 'Save Product' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  
      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg w-full max-w-md mx-4">
          <div class="p-6">
            <h2 class="text-xl font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete product <strong>{{ productToDelete?.name }}</strong>? This action cannot be undone.</p>
          </div>
          <div class="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
            <button 
              @click="showDeleteModal = false" 
              class="px-4 py-2 border rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button 
              @click="deleteProduct" 
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              :disabled="submitting"
            >
              {{ submitting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted, watch } from 'vue';
  // In a real implementation, import the product service
  // import { productService } from '../services/api.service';
  
  export default {
    setup() {
      const products = ref([]);
      const loading = ref(true);
      const searchQuery = ref('');
      const filterCategory = ref('all');
      const sortBy = ref('name');
      const showAddProductModal = ref(false);
      const showEditProductModal = ref(false);
      const showDeleteModal = ref(false);
      const submitting = ref(false);
      const productToDelete = ref(null);
      
      const productForm = ref({
        productId: null,
        name: '',
        categoryId: 1,
        price: 0,
        stockQuantity: 0,
        barcode: ''
      });
  
      // Pagination
      const pagination = ref({
        page: 1,
        perPage: 10,
        start: 0,
        end: 10
      });
  
      const fetchProducts = async () => {
        loading.value = true;
        try {
          // In a real implementation, we would use the API service
          // const response = await productService.getAllProducts();
          // products.value = response.data || [];
          
          // For demo/development, we'll use mock data
          products.value = [
            { productId: 1, name: 'Laptop', price: 999.99, categoryId: 1, stockQuantity: 10, barcode: '123456789' },
            { productId: 2, name: 'Smartphone', price: 499.99, categoryId: 1, stockQuantity: 15, barcode: '234567890' },
            { productId: 3, name: 'T-Shirt', price: 19.99, categoryId: 2, stockQuantity: 50, barcode: '345678901' },
            { productId: 4, name: 'Coffee Maker', price: 89.99, categoryId: 3, stockQuantity: 8, barcode: '456789012' },
            { productId: 5, name: 'Novel', price: 12.99, categoryId: 4, stockQuantity: 30, barcode: '567890123' },
            { productId: 6, name: 'Headphones', price: 149.99, categoryId: 1, stockQuantity: 20, barcode: '678901234' },
            { productId: 7, name: 'Jeans', price: 39.99, categoryId: 2, stockQuantity: 45, barcode: '789012345' },
            { productId: 8, name: 'Blender', price: 59.99, categoryId: 3, stockQuantity: 12, barcode: '890123456' },
            { productId: 9, name: 'Cookbook', price: 24.99, categoryId: 4, stockQuantity: 25, barcode: '901234567' },
            { productId: 10, name: 'Tablet', price: 299.99, categoryId: 1, stockQuantity: 7, barcode: '012345678' },
            { productId: 11, name: 'Dress', price: 49.99, categoryId: 2, stockQuantity: 30, barcode: '123456780' },
            { productId: 12, name: 'Toaster', price: 29.99, categoryId: 3, stockQuantity: 18, barcode: '234567801' }
          ];
        } catch (error) {
          console.error('Error fetching products:', error);
        } finally {
          loading.value = false;
        }
      };
  
      const getCategoryName = (categoryId) => {
        const categories = {
          1: 'Electronics',
          2: 'Clothing',
          3: 'Home & Kitchen',
          4: 'Books'
        };
        return categories[categoryId] || 'Unknown';
      };
  
      // Filter products based on search query and category
      const filteredProducts = computed(() => {
        let result = products.value;
        
        // Filter by category
        if (filterCategory.value !== 'all') {
          result = result.filter(product => product.categoryId.toString() === filterCategory.value);
        }
        
        // Filter by search query
        if (searchQuery.value) {
          const query = searchQuery.value.toLowerCase();
          result = result.filter(product => 
            product.name.toLowerCase().includes(query) || 
            (product.barcode && product.barcode.includes(query))
          );
        }
        
        // Sort products
        if (sortBy.value === 'name') {
          result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy.value === 'price') {
          result = [...result].sort((a, b) => a.price - b.price);
        } else if (sortBy.value === 'stock') {
          result = [...result].sort((a, b) => a.stockQuantity - b.stockQuantity);
        }
        
        return result;
      });
  
      // Computed properties for pagination
      const totalPages = computed(() => {
        return Math.ceil(filteredProducts.value.length / pagination.value.perPage);
      });
  
      const paginatedProducts = computed(() => {
        return filteredProducts.value.slice(pagination.value.start, pagination.value.end);
      });
  
      // Pagination methods
      const updatePagination = () => {
        pagination.value.start = (pagination.value.page - 1) * pagination.value.perPage;
        pagination.value.end = pagination.value.start + pagination.value.perPage;
      };
  
      const nextPage = () => {
        if (pagination.value.page < totalPages.value) {
          pagination.value.page++;
          updatePagination();
        }
      };
  
      const prevPage = () => {
        if (pagination.value.page > 1) {
          pagination.value.page--;
          updatePagination();
        }
      };
  
      // Reset pagination when filters change
      watch([searchQuery, filterCategory, sortBy], () => {
        pagination.value.page = 1;
        updatePagination();
      });
  
      // Product CRUD operations
      const searchProducts = () => {
        pagination.value.page = 1;
        updatePagination();
      };
  
      const editProduct = (product) => {
        productForm.value = { ...product };
        showEditProductModal.value = true;
      };
  
      const confirmDeleteProduct = (product) => {
        productToDelete.value = product;
        showDeleteModal.value = true;
      };
  
      const deleteProduct = async () => {
        if (!productToDelete.value) return;
        
        submitting.value = true;
        try {
          // In a real implementation, we would use the API service
          // await productService.deleteProduct(productToDelete.value.productId);
          
          // For demo/development, we'll just update the local state
          products.value = products.value.filter(p => p.productId !== productToDelete.value.productId);
          showDeleteModal.value = false;
          productToDelete.value = null;
        } catch (error) {
          console.error('Error deleting product:', error);
          alert('Failed to delete product. Please try again.');
        } finally {
          submitting.value = false;
        }
      };
  
      const submitProductForm = async () => {
        submitting.value = true;
        
        try {
          if (showEditProductModal.value) {
            // Update existing product
            // In a real implementation, we would use the API service
            // const response = await productService.updateProduct(
            //   productForm.value.productId,
            //   productForm.value
            // );
            
            // For demo/development, we'll just update the local state
            const index = products.value.findIndex(p => p.productId === productForm.value.productId);
            if (index !== -1) {
              products.value[index] = { ...productForm.value };
            }
          } else {
            // Create new product
            // In a real implementation, we would use the API service
            // const response = await productService.createProduct(productForm.value);
            
            // For demo/development, we'll just update the local state
            const newProduct = { 
              ...productForm.value,
              productId: Math.max(0, ...products.value.map(p => p.productId)) + 1
            };
            products.value.push(newProduct);
          }
          
          closeProductModal();
        } catch (error) {
          console.error('Error saving product:', error);
          alert('Failed to save product. Please try again.');
        } finally {
          submitting.value = false;
        }
      };
  
      const closeProductModal = () => {
        showAddProductModal.value = false;
        showEditProductModal.value = false;
        productForm.value = {
          productId: null,
          name: '',
          categoryId: 1,
          price: 0,
          stockQuantity: 0,
          barcode: ''
        };
      };
  
      onMounted(() => {
        fetchProducts();
      });
  
      return {
        products,
        loading,
        searchQuery,
        filterCategory,
        sortBy,
        showAddProductModal,
        showEditProductModal,
        showDeleteModal,
        submitting,
        productToDelete,
        productForm,
        pagination,
        filteredProducts,
        paginatedProducts,
        totalPages,
        fetchProducts,
        getCategoryName,
        searchProducts,
        editProduct,
        confirmDeleteProduct,
        deleteProduct,
        submitProductForm,
        closeProductModal,
        nextPage,
        prevPage
      };
    }
  };
  </script>