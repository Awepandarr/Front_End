// src/services/invoice.service.js
import axios from 'axios';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

export const invoiceService = {
  // Generate invoice
  generateInvoice(invoiceData) {
    // Ensure all required fields are present and in correct format
    const processedData = {
      orderId: invoiceData.orderId,
      customerId: invoiceData.customerId || 1,
      invoiceDate: invoiceData.invoiceDate || new Date().toISOString(),
      subtotal: invoiceData.subtotal.toString(),
      discount: (invoiceData.discount || 0).toString(),
      taxAmount: (invoiceData.taxAmount || 0).toString(),
      serviceCharge: (invoiceData.serviceCharge || 0).toString(),
      finalAmount: invoiceData.finalAmount.toString()
    };
    
    console.log('Sending invoice data:', processedData);
    
    return apiClient.post('/invoice', processedData);
  },
  
  // Get invoice by ID
  getInvoiceById(invoiceId) {
    return apiClient.get(`/invoice/${invoiceId}`);
  },
  
  // Print or download invoice
  downloadInvoice(invoiceId) {
    return apiClient.get(`/invoice/${invoiceId}/download`, {
      responseType: 'blob'
    });
  },
  
  // Email invoice
  emailInvoice(invoiceId, email) {
    return apiClient.post(`/invoice/${invoiceId}/email`, { email });
  }
};

export default {
  invoiceService
};