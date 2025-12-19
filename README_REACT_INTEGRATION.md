# React + Laravel Integration Guide

This document explains how to run and test the React frontend integrated with the Laravel backend.

## Prerequisites

- PHP 8.0 or higher
- Composer
- Node.js 16 or higher
- npm 8 or higher

## Running the Application

### 1. Start the Laravel Backend

From the project root directory:

```bash
php artisan serve
```

This will start the Laravel development server on `https://api.shajara.tech`.

### 2. Access the Application

Visit `https://api.shajara.tech` in your browser. The React frontend will be served through Laravel.

## Building the React Frontend

### Automatic Build Scripts

We provide two build scripts for convenience:

**On Windows:**
```cmd
build-react.bat
```

**On Linux/Mac:**
```bash
chmod +x build-react.sh
./build-react.sh
```

### Manual Build Process

If you need to build manually:

1. Navigate to the React frontend directory:
   ```bash
   cd react-frontend
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Build the React application:
   ```bash
   npm run build
   ```

This will generate the production build in `../public/react` directory, which is served by Laravel.

## Development Workflow

### React Development Server

For development with hot reloading:

1. Navigate to the React frontend directory:
   ```bash
   cd react-frontend
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

This will start the Vite development server on `http://localhost:3000`.

### Laravel API Development

All API endpoints are defined in `routes/api.php`. The React frontend communicates with these endpoints through the API service layer.

## Testing the Integration

1. Ensure both Laravel and React are properly configured
2. Visit `https://api.shajara.tech` to see the React frontend served by Laravel
3. Use the TestComponent to verify API connectivity (available in development mode)

## File Structure

```
project-root/
├── app/                 # Laravel backend code
├── routes/              # Laravel routes
├── resources/views/     # Laravel Blade templates (fallback)
├── public/              # Laravel public directory
│   └── react/           # React build output (generated)
├── react-frontend/      # React frontend source code
│   ├── src/             # React components and pages
│   ├── public/          # Static assets
│   └── vite.config.ts   # Vite configuration
└── README_REACT_INTEGRATION.md  # This file
```

## Troubleshooting

### Common Issues

1. **404 Errors**: Ensure the React build has been generated and placed in `public/react`
2. **API Connection Failures**: Check that the Laravel server is running and CORS is properly configured
3. **Asset Loading Issues**: Verify that asset paths in CSS files are correct

### Clearing Cache

If you encounter issues, try clearing caches:

```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

## Environment Configuration

### Laravel (.env)

Ensure your Laravel `.env` file has the correct database and other configurations.

### React (.env)

Create a `.env` file in the `react-frontend` directory if needed:

```env
VITE_API_BASE_URL=https://api.shajara.tech/api
```

## Deployment

For production deployment:

1. Build the React frontend:
   ```bash
   cd react-frontend
   npm run build
   ```

2. Deploy the entire Laravel application, ensuring the `public/react` directory is included

3. Configure your web server to serve the Laravel application