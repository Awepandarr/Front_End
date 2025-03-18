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
    // Log detailed error information
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: error.config
    });

    // Customize error messages
    if (error.response) {
      // The request was made and the server responded with a status code
      switch (error.response.status) {
        case 400:
          error.message = 'Invalid request. Please check your input.';
          break;
        case 401:
          error.message = 'Unauthorized. Please log in again.';
          break;
        case 403:
          error.message = 'Access forbidden. You do not have permission.';
          break;
        case 404:
          error.message = 'Requested resource not found.';
          break;
        case 500:
          error.message = 'Server error. Please try again later.';
          break;
        default:
          error.message = error.response.data?.message || 'An unexpected error occurred.';
      }
    } else if (error.request) {
      // The request was made but no response was received
      error.message = 'No response received from the server. Please check your network connection.';
    } else {
      // Something happened in setting up the request
      error.message = 'Error setting up the request. Please try again.';
    }

    return Promise.reject(error);
  }
);

// Payment service with enhanced error handling
export const paymentService = {
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

    // Specific validation for card payments
    if (paymentData.paymentMethod === 'CARD') {
      const cardDetails = paymentData.cardDetails;
      if (!cardDetails) {
        throw new Error('Card details are required for card payment');
      }

      // Basic card number validation
      const validateCardNumber = (number) => {
        const cleanNumber = number.replace(/\s/g, '');
        return /^\d{16}$/.test(cleanNumber);
      };

      if (!validateCardNumber(cardDetails.cardNumber)) {
        throw new Error('Invalid card number');
      }

      // Validate expiry date
      const validateExpiryDate = (expiryDate) => {
        const [month, year] = expiryDate.split('/');
        const currentDate = new Date();
        const expiryDateObj = new Date(2000 + parseInt(year), parseInt(month) - 1);
        return expiryDateObj > currentDate;
      };

      if (!validateExpiryDate(cardDetails.expiryDate)) {
        throw new Error('Card has expired');
      }

      // CVV validation
      if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
        throw new Error('Invalid CVV');
      }
    }

    try {
      // Actual API call to process payment
      const response = await apiClient.post('/api/payment', paymentData);
      return response.data;
    } catch (error) {
      // Re-throw the error with a meaningful message
      throw error;
    }
  }
};

// Other service methods remain the same
export const orderService = {
  async createOrder(orderData) {
    try {
      const response = await apiClient.post('/api/order', orderData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export const invoiceService = {
  async generateInvoice(invoiceData) {
    try {
      const response = await apiClient.post('/invoice', invoiceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Export the configured axios instance and other services
export default {
  apiClient,
  paymentService,
  orderService,
  invoiceService
};