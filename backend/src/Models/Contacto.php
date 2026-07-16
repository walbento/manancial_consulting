<?php
class Contacto
{
    public static function guardar(array $dados): void
    {
        global $cnn;

        $sql = "
            INSERT INTO contactos
                (nome, email, empresa, nif, telefone, cargo, assunto, mensagem, tipo_empresa, criado_em)
            VALUES
                (:nome, :email, :empresa, :nif, :telefone, :cargo, :assunto, :mensagem, :tipo, NOW())
        ";

        $stmt = $cnn->prepare($sql);
        $stmt->execute([
            ':nome'     => $dados['nome'],
            ':email'    => $dados['email'],
            ':empresa'  => $dados['empresa'],
            ':nif'      => $dados['nif'],
            ':telefone' => $dados['telefone'],
            ':cargo'    => $dados['cargo'],
            ':assunto'  => $dados['assunto'],
            ':mensagem' => $dados['mensagem'],
            ':tipo'     => $dados['tipo'],
        ]);
    }
}
