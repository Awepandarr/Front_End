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
// Add these methods to your existing reportService in services/api.service.js

// Add these methods to your existing reportService in src/services/api.service.js

// Report service
export const reportService = {
  // Get the current end of day report
  getEndOfDayReport() {
    return apiClient.get('/endOfDayReport');
  },
  
  // Get reports within a date range
  getReportHistory(startDate, endDate) {
    return apiClient.get(`/endOfDayReport/history?startDate=${startDate}&endDate=${endDate}`);
  },
  
  // Get a report for a specific date
  getReportByDate(date) {
    return apiClient.get(`/endOfDayReport/date/${date}`);
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
  },
  // New method to get product image URL
  getProductImageUrl(id) {
    return apiClient.get(`/api/product/image/${id}`);
  },
  // New method to update product image URL
  updateProductImageUrl(id, imageUrl) {
    return apiClient.patch(`/api/product/image/${id}`, { image_url: imageUrl });
  }
}

// Order service
export const orderService = {
  getAllOrders() {
    return apiClient.get('/api/orders');
  },
  
  getOrderByID(id) {
    return apiClient.get(`/api/order/${id}`);
  },
  
  createOrder(orderData) {
    // Validate and format order data before sending
    const validatedOrder = {
      customerId: orderData.customerId || 1,
      orderDate: orderData.orderDate || new Date().toISOString(),
      
      // Ensure items is an array with required fields
      items: Array.isArray(orderData.items) ? orderData.items.map(item => ({
        productId: item.productId,
        quantity: parseInt(item.quantity) || 1,
        price: parseFloat(item.price) || 0
      })) : [],
      
      // Ensure all amounts are numbers
      totalAmount: parseFloat(orderData.totalAmount) || 0,
      discountAmount: parseFloat(orderData.discountAmount || 0),
      taxAmount: parseFloat(orderData.taxAmount) || 0,
      finalAmount: parseFloat(orderData.finalAmount) || 0
    };
    
    console.log('Creating order with validated data:', validatedOrder);
    return apiClient.post('/api/order', validatedOrder);
  },
  
  updateOrder(id, orderData) {
    return apiClient.put(`/api/order/${id}`, orderData);
  },
  
  deleteOrder(id) {
    return apiClient.delete(`/api/order/${id}`);
  }
};

// Payment service
// src/services/api.service.js
// Update your payment service implementation to match your Java backend

export const paymentService = {
  processPayment(paymentData) {
    console.log('Processing payment with data:', {
      ...paymentData,
      cardDetails: paymentData.cardDetails ? '(sensitive data hidden)' : undefined
    });

    // Format the payment data to match exactly what your Java backend expects
    const formattedPaymentData = {
      transactionId: paymentData.transactionId,
      orderId: paymentData.orderId,
      amount: typeof paymentData.amount === 'number' ? 
        paymentData.amount : parseFloat(paymentData.amount) || 0,
      paymentMethod: paymentData.paymentMethod
    };

    // Add payment method specific details
    if (paymentData.paymentMethod === 'CARD' && paymentData.cardDetails) {
      // Format card details correctly
      formattedPaymentData.cardDetails = {
        cardNumber: paymentData.cardDetails.cardNumber.replace(/\s+/g, ''),
        expiryDate: paymentData.cardDetails.expiryDate,
        cvv: paymentData.cardDetails.cvv,
        cardholderName: paymentData.cardDetails.cardholderName
      };
    } else if (paymentData.paymentMethod === 'CASH') {
      // For cash payments, just pass the cash amount
      formattedPaymentData.cashAmount = paymentData.cashAmount;
    }

    // Make the API call with properly formatted data
    return apiClient.post('/api/payment', formattedPaymentData);
  },
  
  getPaymentByID(id) {
    return apiClient.get(`/api/payment/${id}`);
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