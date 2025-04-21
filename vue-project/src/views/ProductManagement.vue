<!-- src/views/ProductManagement.vue -->
<template>
  <div class="bg-white shadow-lg rounded-lg overflow-hidden">
    <div class="p-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white flex justify-between items-center">
      <h1 class="text-3xl font-bold">Product Management</h1>
      <button 
        @click="showAddProductModal = true" 
        class="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition duration-300"
      >
        Add Product
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="p-8 border-b">
      <div class="flex flex-col md:flex-row gap-6">
        <div class="flex-1">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search products..." 
            class="w-full px-4 py-3 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            @input="searchProducts"
          >
        </div>
        <div class="flex gap-4">
          <select 
            v-model="filterCategory" 
            class="px-4 py-3 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">All Categories</option>
            <option value="1">Electronics</option>
            <option value="2">Clothing</option>
            <option value="3">Home & Kitchen</option>
            <option value="4">Books</option>
          </select>
          <select 
            v-model="sortBy" 
            class="px-4 py-3 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="stock">Sort by Stock</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Product List -->
    <div class="p-8">
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-xl text-gray-500">Loading products...</p>
      </div>

      <div v-else-if="filteredProducts.length === 0" class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <p class="text-2xl text-gray-500">No products found</p>
        <button 
          @click="showAddProductModal = true" 
          class="mt-6 bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300"
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
              <tr v-for="product in paginatedProducts" :key="product.productId" class="hover:bg-gray-100 transition duration-300">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div class="ml-4">
                      <div class="text-lg font-medium text-gray-900">{{ product.name }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {{ getCategoryName(product.categoryId) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-lg text-gray-900">
                  ${{ product.price.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-lg">
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
                <td class="px-6 py-4 whitespace-nowrap text-lg text-gray-500">
                  {{ product.barcode }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-lg">
                  <button 
                    @click="editProduct(product)" 
                    class="text-blue-600 hover:text-blue-800 font-semibold mr-4 focus:outline-none"
                  >
                    Edit
                  </button>
                  <button 
                    @click="confirmDeleteProduct(product)" 
                    class="text-red-600 hover:text-red-800 font-semibold focus:outline-none"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex justify-between items-center mt-8">
          <div class="text-lg text-gray-500">
            Showing {{ pagination.start + 1 }} to {{ Math.min(pagination.end, filteredProducts.length) }} of {{ filteredProducts.length }} products
          </div>
          <div class="flex space-x-4">
            <button 
              @click="prevPage" 
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-300 focus:outline-none"
              :disabled="pagination.page === 1"
            >
              Previous
            </button>
            <button 
              @click="nextPage" 
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-300 focus:outline-none"
              :disabled="pagination.page === totalPages"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Product Modal -->
    <div v-if="showAddProductModal || showEditProductModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4">
        <div class="p-6 border-b">
          <h2 class="text-2xl font-bold">{{ showEditProductModal ? 'Edit Product' : 'Add New Product' }}</h2>
        </div>
        <div class="p-6">
          <form @submit.prevent="submitProductForm">
            <div class="space-y-6">
              <div>
                <label class="block text-lg font-medium text-gray-700 mb-1">Product Name</label>
                <input 
                  type="text" 
                  v-model="productForm.name" 
                  class="w-full px-4 py-3 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                >
              </div>
              <div>
                <label class="block text-lg font-medium text-gray-700 mb-1">Category</label>
                <select 
                  v-model="productForm.categoryId" 
                  class="w-full px-4 py-3 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                >
                  <option value="1">Electronics</option>
                  <option value="2">Clothing</option>
                  <option value="3">Home & Kitchen</option>
                  <option value="4">Books</option>
                </select>
              </div>
              <div>
                <label class="block text-lg font-medium text-gray-700 mb-1">Price</label>
                <input 
                  type="number" 
                  v-model="productForm.price" 
                  step="0.01" 
                  min="0.01" 
                  class="w-full px-4 py-3 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                >
              </div>
              <div>
                <label class="block text-lg font-medium text-gray-700 mb-1">Stock Quantity</label>
                <input 
                  type="number" 
                  v-model="productForm.stockQuantity" 
                  min="0" 
                  class="w-full px-4 py-3 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                >
              </div>
              <div>
                <label class="block text-lg font-medium text-gray-700 mb-1">Barcode</label>
                <input 
                  type="text" 
                  v-model="productForm.barcode" 
                  class="w-full px-4 py-3 text-gray-700 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                >
              </div>
            </div>
            <div class="mt-8 flex justify-end space-x-4">
              <button 
                type="button"
                @click="closeProductModal" 
                class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-300 focus:outline-none"
              >
                Cancel
              </button>
              <button 
                type="submit"
                class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 focus:outline-none"
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
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div class="p-6">
          <h2 class="text-2xl font-bold mb-4">Confirm Delete</h2>
          <p class="text-lg">Are you sure you want to delete product <strong>{{ productToDelete?.name }}</strong>? This action cannot be undone.</p>
        </div>
        <div class="px-6 py-4 bg-gray-100 flex justify-end space-x-4 rounded-b-lg">
          <button 
            @click="showDeleteModal = false" 
            class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-300 focus:outline-none"
          >
            Cancel
          </button>
          <button 
            @click="deleteProduct" 
            class="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 focus:outline-none"
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
  import { productService } from '../services/api.service';  // Make sure to uncomment this

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
  
      // In your ProductManagement.vue script section, modify the imports and fetchProducts function:

// First, uncom
// Then update your fetchProducts function
const fetchProducts = async () => {
  loading.value = true;
  try {
    // Use the real API service instead of mock data
    const response = await productService.getAllProducts();
    console.log('Products loaded from API:', response);
    
    // Map the API response to your products array
    // The response structure might be different based on your backend
    if (Array.isArray(response.data)) {
      products.value = response.data;
    } else if (typeof response.data === 'string') {
      // If the response is a JSON string, parse it
      try {
        products.value = JSON.parse(response.data);
      } catch (parseError) {
        console.error('Error parsing products JSON:', parseError);
        products.value = [];
      }
    } else {
      products.value = [];
    }
    
    // If no products are returned, log it for debugging
    if (products.value.length === 0) {
      console.log('No products returned from API');
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    if (error.response) {
      console.error('API error response:', error.response.data);
    }
    // Set products to empty array on error
    products.value = [];
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
  
// Update your deleteProduct function to properly use the API service

const deleteProduct = async () => {
  if (!productToDelete.value) return;
  
  submitting.value = true;
  try {
    console.log(`Attempting to delete product with ID: ${productToDelete.value.productId}`);
    
    // Call the API to delete the product
    await productService.deleteProduct(productToDelete.value.productId);
    
    console.log('Product deleted successfully, updating UI');
    
    // Update the local state to remove the deleted product
    products.value = products.value.filter(p => p.productId !== productToDelete.value.productId);
    
    // Close the modal and clear the selected product
    showDeleteModal.value = false;
    productToDelete.value = null;
  } catch (error) {
    console.error('Error deleting product:', error);
    
    // Log more detailed error information
    if (error.response) {
      console.error('Server responded with:', {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('No response received from server');
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    alert('Failed to delete product. Please try again.');
  } finally {
    submitting.value = false;
  }
};
  
      // Update the submitProductForm function to use the API service

const submitProductForm = async () => {
  submitting.value = true;
  
  try {
    const productData = {
      name: productForm.value.name,
      price: parseFloat(productForm.value.price),
      categoryId: parseInt(productForm.value.categoryId),
      stockQuantity: parseInt(productForm.value.stockQuantity),
      barcode: productForm.value.barcode,
      image_url: productForm.value.imageUrl || '' // Include an image URL field if you have one
    };
    
    console.log('Submitting product data:', productData);
    
    if (showEditProductModal.value) {
      // Update existing product
      const response = await productService.updateProduct(
        productForm.value.productId,
        productData
      );
      
      console.log('Update product response:', response);
      
      // Update the local state
      const index = products.value.findIndex(p => p.productId === productForm.value.productId);
      if (index !== -1) {
        // You might need to adapt this based on your API response structure
        if (response.data) {
          products.value[index] = response.data;
        } else {
          // If the response doesn't include the updated product, update with our local data
          products.value[index] = { 
            ...products.value[index],
            ...productData,
            productId: productForm.value.productId
          };
        }
      }
    } else {
      // Create new product
      const response = await productService.createProduct(productData);
      console.log('Create product response:', response);
      
      // Add the new product to the local state
      // You might need to adapt this based on your API response structure
      if (response.data) {
        products.value.push(response.data);
      }
    }
    
    // Close the modal and reset the form
    closeProductModal();
    
    // Refresh the product list to ensure we have the latest data
    fetchProducts();
  } catch (error) {
    console.error('Error saving product:', error);
    
    // Log more detailed error information
    if (error.response) {
      console.error('Server responded with:', {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('No response received from server');
    } else {
      console.error('Error setting up request:', error.message);
    }
    
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