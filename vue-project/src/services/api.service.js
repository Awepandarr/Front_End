// src/services/api.service.js

import axios from 'axios';
// Create an Axios instance with default config
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  },
  // Add timeout to handle network issues
  timeout: 10000
});

// Request interceptor to log requests
apiClient.interceptors.request.use(config => {
  console.log('API Request:', {
    method: config.method,
    url: config.url,
    data: config.data
  });
  return config;
}, error => {
  console.error('Request Error:', error);
  return Promise.reject(error);
});

// Response interceptor to log responses and handle errors
apiClient.interceptors.response.use(
  response => {
    console.log('API Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Customer service
export const customerService = {
  getAllCustomers() {
    return apiClient.get('/api/customers');
  },
  getCustomerByID(id) {
    return apiClient.get(`/api/customer/${id}`);
  },
  createCustomer(customerData) {
    return apiClient.post('/api/customer', customerData);
  },
  updateCustomer(id, customerData) {
    return apiClient.put(`/api/customer/${id}`, customerData);
  },
  deleteCustomer(id) {
    return apiClient.delete(`/api/customer/${id}`);
  }
};

// Product service
export const productService = {
  getAllProducts() {
    return apiClient.get('/api/products');
  },
  getProductByID(id) {
    return apiClient.get(`/api/product/id/${id}`);
  },
  getProductByBarcode(barcode) {
    return apiClient.get(`/api/product/barcode/${barcode}`);
  },
  createProduct(productData) {
    return apiClient.post('/api/product', productData);
  },
  updateProduct(id, productData) {
    return apiClient.put(`/api/product/${id}`, productData);
  },
  deleteProduct(id) {
    return apiClient.delete(`/api/product/${id}`);
  }
};

// Order service
export const orderService = {
  getAllOrders() {
    return apiClient.get('/api/orders');
  },
  getOrderByID(id) {
    return apiClient.get(`/api/order/${id}`);
  },
  createOrder(orderData) {
    return apiClient.post('/api/order', orderData);
  },
  updateOrder(id, orderData) {
    return apiClient.put(`/api/order/${id}`, orderData);
  },
  deleteOrder(id) {
    return apiClient.delete(`/api/order/${id}`);
  }
};

// Payment service
export const paymentService = {
  processPayment(paymentData) {
    return apiClient.post('/api/payment', paymentData);
  },
  getPaymentByID(id) {
    return apiClient.get(`/api/payment/${id}`);
  }
};

// Report service
export const reportService = {
  getEndOfDayReport() {
    return apiClient.get('/endOfDayReport');
  }
};

// Invoice service
export const invoiceService = {
  generateInvoice(invoiceData) {
    return apiClient.post('/invoice', invoiceData);
  },
  getInvoiceByID(id) {
    return apiClient.get(`/invoice/${id}`);
  }
};

// Export the configured axios instance and all services
export default {
  apiClient,
  customerService,
  productService,
  orderService,
  paymentService,
  reportService,
  invoiceService

};