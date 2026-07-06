<?php
//Credenciais
$servidor='manancialconsulting.ao'; 
$banco="m_consulting";
$porta="5432";
$user="consulting";
$pass="2026mConsulting@Angola"; 
// Instância da classe de conexão
$cnn=new PDO("pgsql:host=$servidor;dbname=$banco", $user, $pass);
// Setar PDO "error mode" para exception
$cnn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
?>
