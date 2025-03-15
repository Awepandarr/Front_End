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
  // Process payment with comprehensive error handling
  async processPayment(paymentData) {
    // Validate required fields
    const requiredFields = [
      'transactionId', 
      'orderId', 
      'amount', 
      'paymentMethod'
    ];

    for (const field of requiredFields) {
      if (!paymentData[field]) {
        throw new Error(`Missing required payment field: ${field}`);
      }
    }

    // Standardize payment method
    paymentData.paymentMethod = paymentData.paymentMethod.toUpperCase();

    // Specific validation for different payment methods
    if (paymentData.paymentMethod === 'CARD') {
      const cardValidation = this.validateCardDetails(paymentData);
      if (!cardValidation.valid) {
        throw new Error(cardValidation.error);
      }
    }

    try {
      const response = await apiClient.post('/api/payment', paymentData);
      return response.data;
    } catch (error) {
      // Enhanced error handling
      if (error.response) {
        switch (error.response.status) {
          case 400:
            throw new Error('Invalid payment details. Please check your input.');
          case 402:
            throw new Error('Payment was declined. Please try another payment method.');
          case 403:
            throw new Error('Insufficient funds or payment not authorized.');
          case 500:
            throw new Error('Payment processing temporarily unavailable. Please try again later.');
          default:
            throw new Error(error.response.data.message || 'Payment processing failed');
        }
      } else {
        throw new Error('Network error. Please check your connection.');
      }
    }
  },

  // Card details validation helper method
  validateCardDetails(paymentData) {
    const { cardDetails } = paymentData;
    const { cardNumber, expiryDate: cardExpiryDate, cvc } = cardDetails || {};

    // Basic card number validation (Luhn algorithm)
    const validateCardNumber = (number) => {
      const digits = number.replace(/\D/g, '');
      let sum = 0;
      let isEvenIndex = false;

      for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits.charAt(i), 10);

        if (isEvenIndex) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }

        sum += digit;
        isEvenIndex = !isEvenIndex;
      }

      return sum % 10 === 0;
    };

    // Validate card number
    if (!cardNumber || !validateCardNumber(cardNumber)) {
      return { valid: false, error: 'Invalid card number' };
    }

    // Validate expiry date
    const [month, year] = cardExpiryDate.split('/');
    const currentDate = new Date();
    const expiryDateObj = new Date(2000 + parseInt(year), parseInt(month) - 1);

    if (expiryDateObj <= currentDate) {
      return { valid: false, error: 'Card has expired' };
    }

    // Validate CVC
    if (!cvc || !/^\d{3,4}$/.test(cvc)) {
      return { valid: false, error: 'Invalid CVC' };
    }

    return { valid: true };
  },

  // Get payment status by transaction ID
  async getPaymentStatus(transactionId) {
    try {
      const response = await apiClient.get(`/api/payment/status/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      throw error;
    }
  },

  // Refund payment
  async refundPayment(transactionId, reason) {
    try {
      const response = await apiClient.post('/api/payment/refund', {
        transactionId,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
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
  transactionService,
  invoiceService,
  reportService,
  apiClient
};