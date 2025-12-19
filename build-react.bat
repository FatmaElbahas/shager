@echo off

REM Navigate to the React frontend directory
cd frontend

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
  npm install
)

REM Build the React app
npm run build

REM The build output will be in ../public/react due to our Vite config
echo React app built successfully!

REM Go back to the root directory
cd ..