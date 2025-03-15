<!-- src/views/OrdersPage.vue -->
<template>
  <div class="bg-white shadow-lg rounded-lg overflow-hidden">
    <div class="p-6 bg-blue-600 text-white">
      <h1 class="text-2xl font-bold">Orders</h1>
    </div>

    <!-- Filters and Search -->
    <div class="p-6 border-b">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search orders by ID or customer..." 
            class="w-full p-3 border rounded-lg"
            @input="searchOrders"
          >
        </div>
        <div class="flex gap-4">
          <select 
            v-model="statusFilter" 
            class="p-3 border rounded-lg bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select 
            v-model="dateFilter" 
            class="p-3 border rounded-lg bg-white"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Orders List -->
    <div class="p-6">
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-4 text-gray-500">Loading orders...</p>
      </div>

      <div v-else-if="filteredOrders.length === 0" class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p class="text-lg text-gray-500">No orders found</p>
      </div>

      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="order in paginatedOrders" :key="order.orderId">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{{ order.orderId }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {{ getCustomerInitials(order.customerName) }}
                    </div>
                    <div class="ml-3">
                      <div class="text-sm font-medium text-gray-900">{{ order.customerName }}</div>
                      <div class="text-sm text-gray-500">ID: {{ order.customerId }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(order.orderDate) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${{ order.finalAmount.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    :class="[
                      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                      getStatusColor(order.orderStatus)
                    ]"
                  >
                    {{ order.orderStatus }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    @click="viewOrderDetails(order)" 
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View
                  </button>
                  <button 
                    v-if="order.orderStatus === 'Pending'"
                    @click="updateOrderStatus(order, 'Processing')" 
                    class="text-green-600 hover:text-green-900 mr-3"
                  >
                    Process
                  </button>
                  <button 
                    v-if="order.orderStatus === 'Processing'"
                    @click="updateOrderStatus(order, 'Completed')" 
                    class="text-green-600 hover:text-green-900 mr-3"
                  >
                    Complete
                  </button>
                  <button 
                    v-if="order.orderStatus === 'Pending' || order.orderStatus === 'Processing'"
                    @click="updateOrderStatus(order, 'Cancelled')" 
                    class="text-red-600 hover:text-red-900"
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex justify-between items-center mt-4">
          <div class="text-sm text-gray-500">
            Showing {{ pagination.start + 1 }} to {{ Math.min(pagination.end, filteredOrders.length) }} of {{ filteredOrders.length }} orders
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

    <!-- Order Details Modal -->
    <div v-if="showOrderDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-screen overflow-y-auto">
        <div class="p-6 border-b">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold">Order Details</h2>
            <button 
              @click="showOrderDetailsModal = false" 
              class="text-gray-400 hover:text-gray-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div class="p-6">
          <div v-if="selectedOrder">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 class="text-lg font-semibold mb-2">Order Information</h3>
                <div class="bg-gray-50 p-4 rounded-md">
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <p class="text-sm text-gray-500">Order ID</p>
                      <p class="font-medium">#{{ selectedOrder.orderId }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Date</p>
                      <p class="font-medium">{{ formatDate(selectedOrder.orderDate) }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Status</p>
                      <p class="font-medium">{{ selectedOrder.orderStatus }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Order Type</p>
                      <p class="font-medium">{{ selectedOrder.orderType }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-2">Customer Information</h3>
                <div class="bg-gray-50 p-4 rounded-md">
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <p class="text-sm text-gray-500">Name</p>
                      <p class="font-medium">{{ selectedOrder.customerName }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Customer ID</p>
                      <p class="font-medium">{{ selectedOrder.customerId }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Email</p>
                      <p class="font-medium">{{ selectedOrder.customerEmail || 'N/A' }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Phone</p>
                      <p class="font-medium">{{ selectedOrder.customerPhone || 'N/A' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h3 class="text-lg font-semibold mb-2">Order Items</h3>
            <div class="bg-gray-50 p-4 rounded-md mb-6">
              <table class="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="(item, index) in selectedOrder.orderItems" :key="index">
                    <td class="px-4 py-2 text-sm text-gray-900">{{ item.productName || `Product #${item.productId}` }}</td>
                    <td class="px-4 py-2 text-sm text-gray-900">{{ item.quantity }}</td>
                    <td class="px-4 py-2 text-sm text-gray-900">${{ item.price.toFixed(2) }}</td>
                    <td class="px-4 py-2 text-sm text-gray-900">${{ (item.price * item.quantity).toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 class="text-lg font-semibold mb-2">Order Summary</h3>
            <div class="bg-gray-50 p-4 rounded-md mb-6">
              <div class="flex justify-between mb-1">
                <span>Subtotal</span>
                <span>${{ selectedOrder.totalAmount.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between mb-1">
                <span>Tax</span>
                <span>${{ selectedOrder.taxAmount.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between mb-1">
                <span>Discount</span>
                <span>${{ selectedOrder.discountAmount.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                <span>Total</span>
                <span>${{ selectedOrder.finalAmount.toFixed(2) }}</span>
              </div>
            </div>

            <div class="flex justify-between">
              <div>
                <button 
                  @click="printOrder" 
                  class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mr-2"
                >
                  Print Order
                </button>
                <button 
                  @click="emailOrderDetails" 
                  class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                >
                  Email Details
                </button>
              </div>
              <div>
                <button 
                  v-if="selectedOrder.orderStatus === 'Pending'"
                  @click="updateOrderStatus(selectedOrder, 'Processing')" 
                  class="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 mr-2"
                >
                  Mark as Processing
                </button>
                <button 
                  v-if="selectedOrder.orderStatus === 'Processing'"
                  @click="updateOrderStatus(selectedOrder, 'Completed')" 
                  class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 mr-2"
                >
                  Mark as Completed
                </button>
                <button 
                  v-if="selectedOrder.orderStatus === 'Pending' || selectedOrder.orderStatus === 'Processing'"
                  @click="updateOrderStatus(selectedOrder, 'Cancelled')" 
                  class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
// In a real implementation, import the service
// import { orderService } from '../services/api.service';

export default {
  setup() {
    const orders = ref([]);
    const loading = ref(true);
    const searchQuery = ref('');
    const statusFilter = ref('all');
    const dateFilter = ref('all');
    const showOrderDetailsModal = ref(false);
    const selectedOrder = ref(null);
    
    // Pagination
    const pagination = ref({
      page: 1,
      perPage: 10,
      start: 0,
      end: 10
    });

    const fetchOrders = async () => {
      loading.value = true;
      try {
        // In a real implementation, we would use the API service
        // const response = await orderService.getAllOrders();
        // orders.value = response.data || [];
        
        // For demo/development, we'll use mock data
        orders.value = [
          {
            orderId: 'ORD10001',
            customerId: 1,
            customerName: 'John Doe',
            customerEmail: 'john.doe@example.com',
            customerPhone: '123-456-7890',
            orderDate: '2025-03-15T10:30:00',
            totalAmount: 1299.97,
            taxAmount: 130.00,
            discountAmount: 0,
            finalAmount: 1429.97,
            paymentStatus: 'PAID',
            orderType: 'IN_STORE',
            orderStatus: 'Completed',
            orderItems: [
              { productId: 1, productName: 'Laptop', quantity: 1, price: 999.99 },
              { productId: 2, productName: 'Wireless Mouse', quantity: 1, price: 49.99 },
              { productId: 3, productName: 'Laptop Bag', quantity: 1, price: 249.99 }
            ]
          },
          {
            orderId: 'ORD10002',
            customerId: 2,
            customerName: 'Jane Smith',
            customerEmail: 'jane.smith@example.com',
            customerPhone: '987-654-3210',
            orderDate: '2025-03-14T15:45:00',
            totalAmount: 599.98,
            taxAmount: 60.00,
            discountAmount: 50.00,
            finalAmount: 609.98,
            paymentStatus: 'PAID',
            orderType: 'ONLINE',
            orderStatus: 'Processing',
            orderItems: [
              { productId: 2, productName: 'Smartphone', quantity: 1, price: 499.99 },
              { productId: 6, productName: 'Phone Case', quantity: 1, price: 29.99 },
              { productId: 7, productName: 'Screen Protector', quantity: 1, price: 19.99 }
            ]
          },
          {
            orderId: 'ORD10003',
            customerId: 3,
            customerName: 'Robert Johnson',
            customerEmail: 'robert@example.com',
            customerPhone: '555-123-4567',
            orderDate: '2025-03-14T09:15:00',
            totalAmount: 49.98,
            taxAmount: 5.00,
            discountAmount: 0,
            finalAmount: 54.98,
            paymentStatus: 'PENDING',
            orderType: 'IN_STORE',
            orderStatus: 'Pending',
            orderItems: [
              { productId: 3, productName: 'T-Shirt', quantity: 2, price: 19.99 },
              { productId: 9, productName: 'Socks', quantity: 1, price: 9.99 }
            ]
          },
          {
            orderId: 'ORD10004',
            customerId: 4,
            customerName: 'Sarah Williams',
            customerEmail: 'sarah@example.com',
            customerPhone: '111-222-3333',
            orderDate: '2025-03-13T14:20:00',
            totalAmount: 159.99,
            taxAmount: 16.00,
            discountAmount: 0,
            finalAmount: 175.99,
            paymentStatus: 'PAID',
            orderType: 'ONLINE',
            orderStatus: 'Completed',
            orderItems: [
              { productId: 8, productName: 'Headphones', quantity: 1, price: 159.99 }
            ]
          },
          {
            orderId: 'ORD10005',
            customerId: 5,
            customerName: 'Michael Brown',
            customerEmail: 'michael@example.com',
            customerPhone: '444-555-6666',
            orderDate: '2025-03-12T11:10:00',
            totalAmount: 89.97,
            taxAmount: 9.00,
            discountAmount: 10.00,
            finalAmount: 88.97,
            paymentStatus: 'FAILED',
            orderType: 'ONLINE',
            orderStatus: 'Cancelled',
            orderItems: [
              { productId: 4, productName: 'Coffee Maker', quantity: 1, price: 89.97 }
            ]
          }
        ];
        
        // Sort orders by date (newest first)
        orders.value.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        loading.value = false;
      }
    };

    const getCustomerInitials = (name) => {
      if (!name) return 'N/A';
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const getStatusColor = (status) => {
      const statusColors = {
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Processing': 'bg-blue-100 text-blue-800',
        'Completed': 'bg-green-100 text-green-800',
        'Cancelled': 'bg-red-100 text-red-800'
      };
      return statusColors[status] || 'bg-gray-100 text-gray-800';
    };

    // Filter orders based on search query, status, and date
    const filteredOrders = computed(() => {
      let result = orders.value;
      
      // Filter by status
      if (statusFilter.value !== 'all') {
        result = result.filter(order => order.orderStatus === statusFilter.value);
      }
      
      // Filter by date
      if (dateFilter.value !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        result = result.filter(order => {
          const orderDate = new Date(order.orderDate);
          if (dateFilter.value === 'today') {
            return orderDate >= today;
          } else if (dateFilter.value === 'week') {
            return orderDate >= weekStart;
          } else if (dateFilter.value === 'month') {
            return orderDate >= monthStart;
          }
          return true;
        });
      }
      
      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(order => 
          order.orderId.toLowerCase().includes(query) || 
          order.customerName.toLowerCase().includes(query) ||
          (order.customerEmail && order.customerEmail.toLowerCase().includes(query))
        );
      }
      
      return result;
    });

    // Computed properties for pagination
    const totalPages = computed(() => {
      return Math.ceil(filteredOrders.value.length / pagination.value.perPage);
    });

    const paginatedOrders = computed(() => {
      return filteredOrders.value.slice(pagination.value.start, pagination.value.end);
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
    watch([searchQuery, statusFilter, dateFilter], () => {
      pagination.value.page = 1;
      updatePagination();
    });

    // Order operations
    const searchOrders = () => {
      pagination.value.page = 1;
      updatePagination();
    };

    const viewOrderDetails = (order) => {
      selectedOrder.value = order;
      showOrderDetailsModal.value = true;
    };

    const updateOrderStatus = async (order, newStatus) => {
      try {
        // In a real implementation, we would use the API service
        // await orderService.updateOrder(order.orderId, { ...order, orderStatus: newStatus });
        
        // For demo/development, we'll just update the local state
        const index = orders.value.findIndex(o => o.orderId === order.orderId);
        if (index !== -1) {
          orders.value[index].orderStatus = newStatus;
          
          // If we're updating the currently selected order, update that too
          if (selectedOrder.value && selectedOrder.value.orderId === order.orderId) {
            selectedOrder.value.orderStatus = newStatus;
          }
        }
      } catch (error) {
        console.error('Error updating order status:', error);
        alert('Failed to update order status. Please try again.');
      }
    };

    const printOrder = () => {
      // In a real implementation, this would open a print dialog
      window.print();
    };

    const emailOrderDetails = () => {
      // In a real implementation, this would trigger an email to be sent
      alert(`Order details would be emailed to ${selectedOrder.value.customerEmail}`);
    };

    onMounted(() => {
      fetchOrders();
    });

    return {
      orders,
      loading,
      searchQuery,
      statusFilter,
      dateFilter,
      showOrderDetailsModal,
      selectedOrder,
      pagination,
      filteredOrders,
      paginatedOrders,
      totalPages,
      getCustomerInitials,
      formatDate,
      getStatusColor,
      searchOrders,
      viewOrderDetails,
      updateOrderStatus,
      printOrder,
      emailOrderDetails,
      nextPage,
      prevPage
    };
  }
};
</script>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  .modal-content, .modal-content * {
    visibility: visible;
  }
  .modal-content {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>