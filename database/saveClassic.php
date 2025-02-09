<?php

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "memory";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Error en la conexión: " . $conn->connect_error]);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $player_name = $_POST['player_name'];
    $score = $_POST['score'];

    $stmt = $conn->prepare("INSERT INTO classic_results (player, score) VALUES (?, ?)");
    $stmt->bind_param("si", $player_name, $score);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => "Error al guardar los datos"]);
    }

    $stmt->close();
}

$conn->close();
?>
