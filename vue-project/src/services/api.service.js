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

// Request interceptor to log requests in development
apiClient.interceptors.request.use(config => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, 
      config.data ? config.data : '');
  }
  return config;
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
    // Ensure we have all required fields
    const requiredFields = ['orderId', 'amount', 'paymentMethod', 'transactionId'];
    for (const field of requiredFields) {
      if (!paymentData[field]) {
        return Promise.reject(new Error(`Missing required field: ${field}`));
      }
    }
    
    // Standardize payment type field to match backend expectation
    const standardizedData = {
      ...paymentData,
      // Convert payment method to enum format if needed
      paymentType: paymentData.paymentMethod === 'CARD' ? 'CARD' : 'CASH'
    };
    
    // Log the data being sent in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Sending payment data:', standardizedData);
    }
    
    return apiClient.post('/api/payment', standardizedData);
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
    // Validate the basic transaction data
    if (!transactionData.orderId || !transactionData.totalAmount) {
      return Promise.reject(new Error('Missing required transaction fields'));
    }
    
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
    // Log detailed error information
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error.config?.url);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
    }
    
    // Customize the error message based on status code
    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        error.message = 'The requested resource was not found.';
      } else if (status === 401) {
        error.message = 'Unauthorized access. Please log in again.';
      } else if (status === 400) {
        error.message = `Bad request: ${error.response.data || 'Please check your input.'}`;
      } else if (status >= 500) {
        error.message = 'Server error. Please try again later.';
      }
    } else if (error.code === 'ECONNABORTED') {
      error.message = 'Request timed out. Please check your connection.';
    } else if (!error.response) {
      error.message = 'Network error. Please check your connection.';
    }
    
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