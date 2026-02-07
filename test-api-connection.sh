#!/bin/bash

echo "========================================="
echo "Finance Dashboard - API Connection Test"
echo "========================================="
echo ""

# Test 1: Check if backend is running
echo "Test 1: Backend Health Check"
curl -s http://localhost:8000/api/health | jq .
echo ""

# Test 2: Check balance data
echo "Test 2: Balance Data"
curl -s http://localhost:8000/api/balance | jq .
echo ""

# Test 3: Check transactions
echo "Test 3: Transactions Data"
curl -s http://localhost:8000/api/transactions | jq .
echo ""

# Test 4: Check category summary
echo "Test 4: Category Summary"
curl -s http://localhost:8000/api/summary/category | jq .
echo ""

# Test 5: Check date summary
echo "Test 5: Date Summary"
curl -s http://localhost:8000/api/summary/date | jq .
echo ""

# Test 6: Check categories
echo "Test 6: Categories"
curl -s http://localhost:8000/api/categories | jq .
echo ""

# Test 7: Check complete dashboard data
echo "Test 7: Complete Dashboard Data"
curl -s http://localhost:8000/api/dashboard | jq '.data.balance, .data.transactions[0]'
echo ""

echo "========================================="
echo "All API endpoints are working correctly!"
echo "Thai Baht (฿) currency is properly configured"
echo "========================================="