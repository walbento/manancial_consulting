<?php
require_once __DIR__ . '/../config/cnn.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, '/');

if ($uri === '/api/contact' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    require_once __DIR__ . '/../src/Controllers/ContactController.php';
    ContactController::store();
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Rota não encontrada.']);
}
