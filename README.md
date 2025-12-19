# Shager Project

## Prerequisites
- PHP >= 8.1
- Composer
- Node.js & NPM
- MySQL

## Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/FatmaElbahas/shager.git
   cd shager
   ```

2. **Install Backend Dependencies**
   ```bash
   composer install
   ```

3. **Setup Environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   *Configure your database settings in the `.env` file.*

4. **Run Migrations**
   ```bash
   php artisan migrate
   ```

5. **Install & Build Frontend (React)**
   You can use the provided helper script:
   ```bash
   # Windows
   .\build-react.bat
   
   # Linux/Mac
   ./build-react.sh
   ```
   
   Or manually:
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

6. **Run the Application**
   ```bash
   php artisan serve
   ```
   The application will be available at `http://localhost:8000`.

## Directory Structure
- `app/`, `resources/`, etc.: Standard Laravel structure.
- `frontend/`: React application source code.
- `public/`: Publicly accessible assets.
