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
    return new Promise((resolve, reject) => {
      apiClient.get('/api/products')
        .then(response => {
          console.log('Products API Response:', response.data);
          resolve(response);
        })
        .catch(error => {
          console.error('API Error in getAllProducts:', error.message);
          
          // Check if this is a local development environment
          if (process.env.NODE_ENV === 'development') {
            // Return mock data for development/testing
            console.log('Using mock product data in development');
            const mockData = getMockProducts();
            resolve({ data: mockData });
          } else {
            reject(error);
          }
        });
    });
  },
  
  // Get product by ID
  getProductById(productId) {
    return apiClient.get(`/api/product/id/${productId}`);
  },
  
  // Get product by barcode
  getProductByBarcode(barcode) {
    return apiClient.get(`/api/product/barcode/${barcode}`);
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

// Helper function to generate mock products for development
function getMockProducts() {
  return [
    { productId: 1, name: 'Laptop', price: 999.99, categoryId: 1, stockQuantity: 10, barcode: '123456789' },
    { productId: 2, name: 'Smartphone', price: 499.99, categoryId: 1, stockQuantity: 15, barcode: '234567890' },
    { productId: 3, name: 'T-Shirt', price: 19.99, categoryId: 2, stockQuantity: 50, barcode: '345678901' },
    { productId: 4, name: 'Coffee Maker', price: 89.99, categoryId: 3, stockQuantity: 8, barcode: '456789012' },
    { productId: 5, name: 'Novel', price: 12.99, categoryId: 4, stockQuantity: 30, barcode: '567890123' },
    { productId: 6, name: 'Headphones', price: 159.99, categoryId: 1, stockQuantity: 12, barcode: '678901234' },
    { productId: 7, name: 'Jeans', price: 45.99, categoryId: 2, stockQuantity: 25, barcode: '789012345' },
    { productId: 8, name: 'Blender', price: 69.99, categoryId: 3, stockQuantity: 10, barcode: '890123456' },
    { productId: 9, name: 'Cookbook', price: 24.99, categoryId: 4, stockQuantity: 15, barcode: '901234567' }
  ];
}

// Order API endpoints
export const orderService = {
  // Create new order
  createOrder(orderData) {
    return new Promise((resolve, reject) => {
      apiClient.post('/api/order', orderData)
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          console.error('API Error in createOrder:', error.message);
          
          // For development: mock a successful order creation
          if (process.env.NODE_ENV === 'development') {
            console.log('Creating mock order response for development');
            
            const mockOrder = {
              orderId: 'ORD' + Math.floor(Math.random() * 10000),
              ...orderData,
              orderDate: new Date().toISOString()
            };
            
            resolve({ data: mockOrder });
          } else {
            reject(error);
          }
        });
    });
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
  // Process payment with comprehensive error handling
  processPayment(paymentData) {
    return new Promise((resolve, reject) => {
      // Validate required fields
      const requiredFields = [
        'transactionId', 
        'orderId', 
        'amount', 
        'paymentMethod'
      ];

      for (const field of requiredFields) {
        if (!paymentData[field]) {
          reject(new Error(`Missing required payment field: ${field}`));
          return;
        }
      }

      // Standardize payment method
      paymentData.paymentMethod = paymentData.paymentMethod.toUpperCase();

      apiClient.post('/api/payment', paymentData)
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          console.error('API Error in processPayment:', error.message);
          
          // For development: mock a successful payment
          if (process.env.NODE_ENV === 'development') {
            console.log('Creating mock payment response for development');
            
            const mockPaymentResponse = {
              status: 'success',
              transactionId: paymentData.transactionId,
              paymentMethod: paymentData.paymentMethod,
              amount: paymentData.amount,
              timestamp: new Date().toISOString()
            };
            
            resolve({ data: mockPaymentResponse });
          } else {
            // Enhanced error handling
            if (error.response) {
              switch (error.response.status) {
                case 400:
                  reject(new Error('Invalid payment details. Please check your input.'));
                  break;
                case 402:
                  reject(new Error('Payment was declined. Please try another payment method.'));
                  break;
                case 403:
                  reject(new Error('Insufficient funds or payment not authorized.'));
                  break;
                case 500:
                  reject(new Error('Payment processing temporarily unavailable. Please try again later.'));
                  break;
                default:
                  reject(new Error(error.response.data?.message || 'Payment processing failed'));
                  break;
              }
            } else if (error.code === 'ECONNABORTED') {
              reject(new Error('Request timed out. Please check your connection.'));
            } else if (!error.response) {
              reject(new Error('Network error. Please check your connection.'));
            } else {
              reject(error);
            }
          }
        });
    });
  },

  // Get payment status by transaction ID
  getPaymentStatus(transactionId) {
    return apiClient.get(`/api/payment/status/${transactionId}`);
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

// Invoice API endpoints
export const invoiceService = {
  // Create new invoice
  createInvoice(invoiceData) {
    return new Promise((resolve, reject) => {
      apiClient.post('/invoice', invoiceData)
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          console.error('API Error in createInvoice:', error.message);
          
          // For development: mock a successful invoice creation
          if (process.env.NODE_ENV === 'development') {
            console.log('Creating mock invoice response for development');
            
            const mockInvoice = {
              invoiceId: 'INV' + Math.floor(Math.random() * 10000),
              ...invoiceData,
              createdAt: new Date().toISOString()
            };
            
            resolve({ data: mockInvoice });
          } else {
            reject(error);
          }
        });
    });
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
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          error.message = `Bad request: ${errorData}`;
        } else if (errorData && errorData.message) {
          error.message = `Bad request: ${errorData.message}`;
        } else {
          error.message = 'Bad request: Please check your input.';
        }
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
  invoiceService,
  reportService,
  apiClient
};