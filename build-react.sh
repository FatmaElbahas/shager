#!/bin/bash

# Navigate to the React frontend directory
cd ./frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  npm install
fi

# Build the React app
npm run build

# The build output will be in ../public/react due to our Vite config
echo "React app built successfully!"