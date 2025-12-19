<?php
require __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable( __DIR__ . '/../' );
$dotenv->safeLoad();
$host = getenv( 'DB_HOST' ) ?: '127.0.0.1';
$port = getenv( 'DB_PORT' ) ?: '3306';
$user = getenv( 'DB_USERNAME' ) ?: 'root';
$pass = getenv( 'DB_PASSWORD' ) ?: '';
$db = getenv( 'DB_DATABASE' ) ?: 'laravel';
$dsn = "mysql:host={$host};port={$port};charset=utf8mb4";
try {
    $pdo = new PDO( $dsn, $user, $pass, [ PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION ] );
    $pdo->exec( "CREATE DATABASE IF NOT EXISTS `{$db}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci" );
    echo "SUCCESS: Database '{$db}' created or already exists.\n";
    exit( 0 );
} catch ( PDOException $e ) {
    echo 'ERROR: ' . $e->getMessage() . '\n';
    exit( 1 );
}