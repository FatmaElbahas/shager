<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>ShajaraTech - Family Tree Builder</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    <!-- Styles -->
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
            color: #333;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            text-align: center;
        }
        
        .logo {
            max-width: 200px;
            margin-bottom: 2rem;
        }
        
        h1 {
            color: #2c3e50;
            margin-bottom: 1rem;
        }
        
        p {
            font-size: 1.1rem;
            line-height: 1.6;
            color: #555;
        }
        
        .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 1rem;
            transition: background-color 0.3s;
        }
        
        .btn:hover {
            background-color: #0056b3;
        }
        
        .note {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 4px;
            padding: 1rem;
            margin-top: 2rem;
            text-align: left;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="/images/logo.svg" alt="ShajaraTech Logo" class="logo">
        <h1>Welcome to ShajaraTech</h1>
        <p>Your family tree building platform is almost ready!</p>
        <p>We're currently setting up the React frontend. Please check back in a moment.</p>
        
        <div class="note">
            <h3>Note for Developers:</h3>
            <p>To build the React frontend:</p>
            <ol>
                <li>Navigate to the <code>react-frontend</code> directory</li>
                <li>Run <code>npm install</code> to install dependencies</li>
                <li>Run <code>npm run build</code> to build the production version</li>
                <li>The built files will be placed in <code>public/react</code></li>
            </ol>
            <p>Or simply run the build script: <code>./build-react.sh</code> (Linux/Mac) or <code>build-react.bat</code> (Windows)</p>
        </div>
    </div>
</body>
</html>