#!/bin/bash

echo "Starting Laravel + React Development Environment..."
echo ""

# Function to clean up background processes on exit
cleanup() {
    echo ""
    echo "Stopping development servers..."
    kill $LARAVEL_PID $REACT_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C to clean up
trap cleanup INT TERM

# Start Laravel server in background
cd /d D:\NIXTZONE\shagertech-1.0
php artisan serve &
LARAVEL_PID=$!

# Wait a moment for Laravel to start
sleep 3

# Start React development server
cd /d D:\NIXTZONE\shagertech-1.0/react-frontend
npm run dev &
REACT_PID=$!

echo ""
echo "Development servers started!"
echo "Laravel: https://api.shajara.tech"
echo "React: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $LARAVEL_PID $REACT_PID