<template>
  <div class="bg-white shadow-lg rounded-lg overflow-hidden">
    <div class="p-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
      <h1 class="text-3xl font-bold mb-2">End of Day Report</h1>
      <p class="text-lg">{{ currentDate }}</p>
    </div>
  
    <div class="p-8">
      <div v-if="loading" class="py-16 text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-xl text-gray-500">Generating report...</p>
      </div>
  
      <div v-else-if="error" class="py-16 text-center">
        <div class="text-red-500 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p class="text-2xl text-red-600">{{ error }}</p>
        <button 
          @click="fetchReport" 
          class="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300"
        >
          Try Again
        </button>
      </div>
  
      <div v-else>
        <!-- Sales Summary -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div class="bg-green-500 text-white p-8 rounded-lg shadow-lg">
            <div class="text-lg font-semibold uppercase tracking-wide">Total Sales</div>
            <div class="mt-4 text-4xl font-bold">${{ formatCurrency(report.total_sales) }}</div>
          </div>
          
          <div class="bg-blue-500 text-white p-8 rounded-lg shadow-lg">
            <div class="text-lg font-semibold uppercase tracking-wide">Total Payments</div>
            <div class="mt-4 text-4xl font-bold">${{ formatCurrency(report.total_payments) }}</div>
          </div>
          
          <div class="bg-purple-500 text-white p-8 rounded-lg shadow-lg">
            <div class="text-lg font-semibold uppercase tracking-wide">Total Discounts</div>
            <div class="mt-4 text-4xl font-bold">${{ formatCurrency(report.total_discounts) }}</div>
          </div>
        </div>
  
        <!-- Payment Breakdown -->
        <div class="mb-12">
          <h2 class="text-2xl font-bold mb-6">Payment Method Breakdown</h2>
          <div class="bg-gray-100 rounded-lg shadow-lg p-8">
            <div class="flex flex-col md:flex-row">
              <div class="flex-1 mb-8 md:mb-0 md:mr-12">
                <div v-if="paymentBreakdown.length > 0">
                  <div 
                    v-for="(item, index) in paymentBreakdown" 
                    :key="index"
                    class="mb-6 last:mb-0"
                  >
                    <div class="flex justify-between items-center mb-2">
                      <span class="text-xl font-semibold">{{ item.method }}</span>
                      <span class="text-2xl font-bold">${{ formatCurrency(item.amount) }}</span>
                    </div>
                    <div class="w-full bg-gray-300 rounded-full h-4">
                      <div 
                        class="h-4 rounded-full transition-all duration-500 ease-out" 
                        :class="getPaymentMethodColor(item.method)"
                        :style="`width: ${getPercentage(item.amount, report.total_payments)}%`"
                      ></div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-xl text-gray-500 text-center py-8">
                  No payment data available
                </div>
              </div>
              
              <div class="flex-1">
                <!-- Chart container -->
                <div id="payment-chart" class="h-64 bg-white rounded-lg shadow-inner">
                  <!-- SVG chart will be inserted here -->
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Action Buttons -->
        <div class="mb-6">
          <router-link 
            to="/reports/history" 
            class="flex items-center space-x-3 bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>View Report History</span>
          </router-link>
        </div>

        <div class="flex flex-wrap gap-6">
          <button 
            @click="printReport" 
            class="flex items-center space-x-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print Report</span>
          </button>
          
          <button 
            @click="exportReportCSV" 
            class="flex items-center space-x-3 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export CSV</span>
          </button>
          
          <button 
            @click="exportReportPDF" 
            class="flex items-center space-x-3 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export PDF</span>
          </button>
          
          <button 
            @click="sendReportEmail" 
            class="flex items-center space-x-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { reportService } from '../services/api.service';
import * as d3 from 'd3';

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
      console.log("Raw payment breakdown:", report.value.payment_breakdown);
      
      if (!report.value.payment_breakdown || 
          report.value.payment_breakdown === 'No payment data available') {
        console.log("No payment data available");
        return [];
      }
      
      // Parse the payment breakdown string (format: "Cash: 500, Card: 900")
      const result = [];
      const parts = report.value.payment_breakdown.split(', ');
      
      parts.forEach(part => {
        console.log("Processing part:", part);
        const [method, amountStr] = part.split(': ');
        if (method && amountStr) {
          result.push({
            method: method.trim(),
            amount: parseFloat(amountStr.trim())
          });
        }
      });
      
      console.log("Parsed payment breakdown:", result);
      return result;
    });
    
    // Create the D3 chart
    const createD3Chart = () => {
      // Clear any existing chart first
      d3.select("#payment-chart").selectAll("*").remove();
      
      // Exit if no data
      if (paymentBreakdown.value.length === 0) {
        d3.select("#payment-chart")
          .append("div")
          .attr("class", "flex items-center justify-center h-full w-full")
          .append("p")
          .attr("class", "text-gray-500 text-lg")
          .text("No chart data available");
        return;
      }
      
      // Get the container dimensions
      const container = document.getElementById('payment-chart');
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      // Create SVG
      const svg = d3.select("#payment-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);
        
      // Color scale
      const color = d3.scaleOrdinal()
        .domain(paymentBreakdown.value.map(d => d.method))
        .range(['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444']);
      
      // Compute position of each group on the pie
      const pie = d3.pie()
        .value(d => d.amount);
      
      const data_ready = pie(paymentBreakdown.value);
      
      // The arc generator
      const arc = d3.arc()
        .innerRadius(Math.min(width, height) / 4)  // This is the size of the donut hole
        .outerRadius(Math.min(width, height) / 2 - 10);
      
      // Another arc for the labels
      const labelArc = d3.arc()
        .innerRadius(Math.min(width, height) / 2 * 0.7)
        .outerRadius(Math.min(width, height) / 2 * 0.7);
      
      // Build the pie chart
      svg.selectAll('allSlices')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.method))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7);
      
      // Add labels
      svg.selectAll('allLabels')
        .data(data_ready)
        .enter()
        .append('text')
        .text(d => {
          const percent = ((d.data.amount / d3.sum(paymentBreakdown.value, d => d.amount)) * 100).toFixed(0);
          return `${d.data.method} (${percent}%)`;
        })
        .attr('transform', d => `translate(${labelArc.centroid(d)})`)
        .style('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', 'white')
        .style('font-weight', 'bold');
      
      // Add the center text
      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(`$${d3.sum(paymentBreakdown.value, d => d.amount).toFixed(2)}`);
          
      console.log("D3 chart created successfully");
    };
    
    const fetchReport = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        const response = await reportService.getEndOfDayReport();
        console.log("Report data:", response.data);
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
        
        // Creating chart after loading is complete and data is ready
        nextTick(() => {
          setTimeout(() => {
            createD3Chart();
          }, 100); // Small timeout to ensure DOM is ready
        });
      }
    };
    
    // Watch for changes in payment breakdown data
    watch(paymentBreakdown, () => {
      nextTick(() => {
        createD3Chart();
      });
    });
    
    const formatCurrency = (value) => {
      // Check if value is undefined, null or not a number
      if (value === undefined || value === null || isNaN(parseFloat(value))) {
        return '0.00';
      }
      return parseFloat(value).toFixed(2);
    };
    
    const getPercentage = (value, total) => {
      if (!total || parseFloat(total) === 0) return 0;
      return (parseFloat(value) / parseFloat(total)) * 100;
    };
    
    const getPaymentMethodColor = (method) => {
      const methodMap = {
        'Cash': 'bg-green-500',
        'CASH': 'bg-green-500',
        'Card': 'bg-blue-500',
        'CARD': 'bg-blue-500',
        'Mobile': 'bg-purple-500',
        'Other': 'bg-gray-500'
      };
      
      return methodMap[method] || 'bg-gray-500';
    };
    
    const printReport = () => {
      window.print();
    };
    
    const exportReportCSV = () => {
      // Generate CSV content
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Add headers
      csvContent += "Category,Amount\n";
      
      // Add total sales
      csvContent += `Total Sales,$${formatCurrency(report.value.total_sales)}\n`;
      
      // Add total payments
      csvContent += `Total Payments,$${formatCurrency(report.value.total_payments)}\n`;
      
      // Add total discounts
      csvContent += `Total Discounts,$${formatCurrency(report.value.total_discounts)}\n\n`;
      
      // Add payment breakdown
      csvContent += "Payment Method,Amount\n";
      if (paymentBreakdown.value.length > 0) {
        paymentBreakdown.value.forEach(item => {
          csvContent += `${item.method},$${formatCurrency(item.amount)}\n`;
        });
      } else {
        csvContent += "No payment data available,0.00\n";
      }
      
      // Create download link and trigger download
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `end_of_day_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    const exportReportPDF = () => {
      alert('PDF export functionality would be implemented here');
      // In a real implementation, you would use a library like jsPDF
    };
    
    const sendReportEmail = () => {
      const email = prompt("Enter email address to send report to:");
      if (email) {
        // In a real implementation, you would send the report via API
        alert(`Report would be sent to ${email}`);
      }
    };
    
    onMounted(() => {
      fetchReport();
      
      // Handle window resize
      window.addEventListener('resize', () => {
        createD3Chart();
      });
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