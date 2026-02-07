// Test the formatCurrency function
function formatCurrency(amount) {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2
  }).format(amount);
}

// Test with different amounts
console.log("Test 1 - Balance:", formatCurrency(46500.0));
console.log("Test 2 - Income:", formatCurrency(50000.0));
console.log("Test 3 - Expense:", formatCurrency(3500.0));
console.log("Test 4 - Small amount:", formatCurrency(85.40));
console.log("Test 5 - Transaction:", formatCurrency(1500.0));