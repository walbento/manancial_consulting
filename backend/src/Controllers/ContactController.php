<?php
require_once __DIR__ . '../../config/cnn.php';
require_once __DIR__ . '/../Models/Contacto.php';

class ContactController
{
    public static function store(): void
    {
        $raw   = file_get_contents('php://input');
        $input = json_decode($raw, true);

        if (!is_array($input)) {
            http_response_code(400);
            echo json_encode(['error' => 'Corpo do pedido inválido.']);
            return;
        }

        $nome      = trim($input['nome']         ?? '');
        $email     = trim($input['email']        ?? '');
        $empresa   = trim($input['empresa']      ?? '');
        $nif       = trim($input['nif']          ?? '');
        $telefone  = trim($input['telefone']     ?? '');
        $cargo     = trim($input['cargo']        ?? '');
        $assunto   = trim($input['assunto']      ?? '');
        $mensagem  = trim($input['mensagem']     ?? '');
        $tipo      = trim($input['tipo_empresa'] ?? '');

        $erros = [];

        if ($nome === '')     $erros[] = 'Nome é obrigatório.';
        if ($email === '')    $erros[] = 'Email é obrigatório.';
        if ($empresa === '')  $erros[] = 'Empresa é obrigatória.';
        if ($nif === '')      $erros[] = 'NIF é obrigatório.';
        if ($mensagem === '') $erros[] = 'Mensagem é obrigatória.';

        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $erros[] = 'Email inválido.';
        }

        if (!empty($erros)) {
            http_response_code(422);
            echo json_encode(['error' => implode(' ', $erros)]);
            return;
        }

        try {
            Contacto::guardar(compact(
                'nome', 'email', 'empresa', 'nif',
                'telefone', 'cargo', 'assunto', 'mensagem', 'tipo'
            ));
            http_response_code(201);
            echo json_encode(['ok' => true, 'mensagem' => 'Contacto guardado com sucesso.']);
        } catch (Exception $e) {
            error_log('[ContactController] ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Erro interno. Tente novamente mais tarde.']);
        }
    }
}
