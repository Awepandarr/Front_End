// src/services/api.service.js

import axios from 'axios';

// Create an Axios instance with default config
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Product API endpoints
export const productService = {
  // Get all products
  getAllProducts() {
    return apiClient.get('/api/products');
  },
  
  // Get product by ID
  getProductById(productId) {
    return apiClient.get(`/api/product/id/${productId}`);
  },
  
  // Get product by barcode
  getProductByBarcode(barcode) {
    return apiClient.get(`/product?barcode=${barcode}`);
  },
  
  // Create new product
  createProduct(productData) {
    return apiClient.post('/api/product', productData);
  },
  
  // Update product
  updateProduct(productId, productData) {
    return apiClient.put(`/api/product/${productId}`, productData);
  },
  
  // Delete product
  deleteProduct(productId) {
    return apiClient.delete(`/api/product/${productId}`);
  }
};

// Order API endpoints
export const orderService = {
  // Create new order
  createOrder(orderData) {
    return apiClient.post('/api/order', orderData);
  },
  
  // Get order by ID
  getOrderById(orderId) {
    return apiClient.get(`/api/order/${orderId}`);
  },
  
  // Update order
  updateOrder(orderId, orderData) {
    return apiClient.put(`/api/order/${orderId}`, orderData);
  },
  
  // Delete order
  deleteOrder(orderId) {
    return apiClient.delete(`/api/order/${orderId}`);
  }
};

// Payment API endpoints
export const paymentService = {
  // Process payment
  processPayment(paymentData) {
    return apiClient.post('/api/payment', paymentData);
  },
  
  // Get payment by transaction ID
  getPaymentByTransactionId(transactionId) {
    return apiClient.get(`/api/transaction/${transactionId}`);
  }
};

// Customer API endpoints
export const customerService = {
  // Get all customers
  getAllCustomers() {
    return apiClient.get('/api/customers');
  },
  
  // Get customer by ID
  getCustomerById(customerId) {
    return apiClient.get(`/api/customer/${customerId}`);
  },
  
  // Create new customer
  createCustomer(customerData) {
    return apiClient.post('/api/customer', customerData);
  },
  
  // Update customer
  updateCustomer(customerId, customerData) {
    return apiClient.put(`/api/customer/${customerId}`, customerData);
  },
  
  // Delete customer
  deleteCustomer(customerId) {
    return apiClient.delete(`/api/customer/${customerId}`);
  }
};

// Transaction API endpoints
export const transactionService = {
  // Create new transaction
  createTransaction(transactionData) {
    return apiClient.post('/api/transaction', transactionData);
  },
  
  // Get transaction by ID
  getTransactionById(transactionId) {
    return apiClient.get(`/api/transaction/${transactionId}`);
  },
  
  // Update transaction
  updateTransaction(transactionId, transactionData) {
    return apiClient.put(`/api/transaction/${transactionId}`, transactionData);
  },
  
  // Delete transaction
  deleteTransaction(transactionId) {
    return apiClient.delete(`/api/transaction/${transactionId}`);
  }
};

// Invoice API endpoints
export const invoiceService = {
  // Create new invoice
  createInvoice(invoiceData) {
    return apiClient.post('/invoice', invoiceData);
  },
  
  // Get invoice by ID
  getInvoiceById(invoiceId) {
    return apiClient.get(`/invoice/${invoiceId}`);
  }
};

// End of day report
export const reportService = {
  // Get end of day report
  getEndOfDayReport() {
    return apiClient.get('/endOfDayReport');
  }
};

// Error handling interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response);
    return Promise.reject(error);
  }
);

export default {
  productService,
  orderService,
  paymentService,
  customerService,
  transactionService,
  invoiceService,
  reportService
};