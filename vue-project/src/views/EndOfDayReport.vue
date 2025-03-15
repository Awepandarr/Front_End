<!-- src/views/EndOfDayReport.vue -->
<template>
    <div class="bg-white shadow-lg rounded-lg overflow-hidden">
      <div class="p-6 bg-blue-600 text-white">
        <h1 class="text-2xl font-bold">End of Day Report</h1>
        <p class="text-sm mt-1">{{ currentDate }}</p>
      </div>
  
      <div class="p-6">
        <div v-if="loading" class="py-12 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-500">Generating report...</p>
        </div>
  
        <div v-else-if="error" class="py-8 text-center">
          <div class="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p class="text-lg text-red-600">{{ error }}</p>
          <button 
            @click="fetchReport" 
            class="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
  
        <div v-else>
          <!-- Sales Summary -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-gradient-to-br from-green-100 to-green-50 p-5 rounded-lg border border-green-200">
              <div class="text-xs font-semibold text-green-600 uppercase tracking-wide">Total Sales</div>
              <div class="mt-2 flex items-baseline">
                <div class="text-3xl font-extrabold text-gray-900">${{ formatCurrency(report.total_sales) }}</div>
              </div>
            </div>
            
            <div class="bg-gradient-to-br from-blue-100 to-blue-50 p-5 rounded-lg border border-blue-200">
              <div class="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Payments</div>
              <div class="mt-2 flex items-baseline">
                <div class="text-3xl font-extrabold text-gray-900">${{ formatCurrency(report.total_payments) }}</div>
              </div>
            </div>
            
            <div class="bg-gradient-to-br from-purple-100 to-purple-50 p-5 rounded-lg border border-purple-200">
              <div class="text-xs font-semibold text-purple-600 uppercase tracking-wide">Total Discounts</div>
              <div class="mt-2 flex items-baseline">
                <div class="text-3xl font-extrabold text-gray-900">${{ formatCurrency(report.total_discounts) }}</div>
              </div>
            </div>
          </div>
  
          <!-- Payment Breakdown -->
          <div class="mb-8">
            <h2 class="text-lg font-bold mb-4">Payment Method Breakdown</h2>
            <div class="bg-gray-50 rounded-lg p-6">
              <div class="flex flex-col md:flex-row">
                <div class="flex-1 mb-6 md:mb-0 md:mr-8">
                  <div v-if="paymentBreakdown.length > 0">
                    <div 
                      v-for="(item, index) in paymentBreakdown" 
                      :key="index"
                      class="mb-4 last:mb-0"
                    >
                      <div class="flex justify-between items-center mb-1">
                        <span class="font-medium">{{ item.method }}</span>
                        <span class="font-bold">${{ formatCurrency(item.amount) }}</span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          class="h-2 rounded-full" 
                          :class="getPaymentMethodColor(item.method)"
                          :style="`width: ${getPercentage(item.amount, report.total_payments)}%`"
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-gray-500 text-center py-4">
                    No payment data available
                  </div>
                </div>
                
                <div class="flex-1">
                  <div class="h-52 bg-gray-100 rounded flex items-center justify-center">
                    <!-- This would be where you'd integrate a chart -->
                    <div class="text-gray-400">Payment distribution chart placeholder</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-4">
            <button 
              @click="printReport" 
              class="flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print Report</span>
            </button>
            
            <button 
              @click="exportReportCSV" 
              class="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-md hover:bg-green-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export CSV</span>
            </button>
            
            <button 
              @click="exportReportPDF" 
              class="flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export PDF</span>
            </button>
            
            <button 
              @click="sendReportEmail" 
              class="flex items-center space-x-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-md hover:bg-yellow-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Email Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue';
  import { reportService } from '../services/api.service';
  
  export default {
    setup() {
      const report = ref({
        total_sales: 0,
        total_payments: 0,
        total_discounts: 0,
        payment_breakdown: ''
      });
      const loading = ref(true);
      const error = ref('');
      
      const currentDate = computed(() => {
        const now = new Date();
        return now.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      });
      
      const paymentBreakdown = computed(() => {
        if (!report.value.payment_breakdown) return [];
        
        // Parse the payment breakdown string (format: "Cash: 500, Card: 900")
        const result = [];
        const parts = report.value.payment_breakdown.split(', ');
        
        parts.forEach(part => {
          const [method, amountStr] = part.split(': ');
          if (method && amountStr) {
            result.push({
              method: method.trim(),
              amount: parseFloat(amountStr.trim())
            });
          }
        });
        
        return result;
      });
      
      const fetchReport = async () => {
        loading.value = true;
        error.value = '';
        
        try {
          const response = await reportService.getEndOfDayReport();
          report.value = response.data;
        } catch (err) {
          console.error('Error fetching end of day report:', err);
          error.value = 'Failed to generate the end of day report. Please try again.';
          
          // For demo purposes, provide sample data if API fails
          report.value = {
            total_sales: 1250.75,
            total_payments: 1250.75,
            total_discounts: 125.50,
            payment_breakdown: 'Cash: 450.25, Card: 800.50'
          };
        } finally {
          loading.value = false;
        }
      };
      
      const formatCurrency = (value) => {
        return parseFloat(value).toFixed(2);
      };
      
      const getPercentage = (value, total) => {
        if (!total) return 0;
        return (value / total) * 100;
      };
      
      const getPaymentMethodColor = (method) => {
        const methodMap = {
          'Cash': 'bg-green-500',
          'Card': 'bg-blue-500',
          'Mobile': 'bg-purple-500',
          'Other': 'bg-gray-500'
        };
        
        return methodMap[method] || 'bg-gray-500';
      };
      
      const printReport = () => {
        window.print();
      };
      
      const exportReportCSV = () => {
        // In a real implementation, you would generate a CSV file
        alert('CSV export functionality would be implemented here');
      };
      
      const exportReportPDF = () => {
        // In a real implementation, you would generate a PDF file
        alert('PDF export functionality would be implemented here');
      };
      
      const sendReportEmail = () => {
        // In a real implementation, you would send the report via email
        alert('Email functionality would be implemented here');
      };
      
      onMounted(() => {
        fetchReport();
      });
      
      return {
        report,
        loading,
        error,
        currentDate,
        paymentBreakdown,
        fetchReport,
        formatCurrency,
        getPercentage,
        getPaymentMethodColor,
        printReport,
        exportReportCSV,
        exportReportPDF,
        sendReportEmail
      };
    }
  };
  </script>
  
  <style>
  @media print {
    body * {
      visibility: hidden;
    }
    .bg-blue-600 {
      background-color: #2563eb !important;
      color: white !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    #app, #app * {
      visibility: visible;
    }
    #app {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
  }
  </style>