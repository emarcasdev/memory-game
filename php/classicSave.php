<?php
// Ruta del archivo JSON de puntuaciones
$filename = '../data/classicResults.json';

// Verifica si los datos necesarios están presentes en la solicitud
if (!empty($_POST['player_name']) && !empty($_POST['score'])) {
    $player_name = $_POST['player_name'];
    $score = $_POST['score'];

    // Lee el archivo JSON existente o inicializa un array si el archivo no existe
    if (file_exists($filename)) {
        $scores = json_decode(file_get_contents($filename), true);
    } else {
        $scores = [];
    }

    // Agrega la nueva puntuación
    $scores[] = [
        'player' => $player_name,
        'score' => $score
    ];

    // Ordenar el array por puntaje de mayor a menor
    usort($scores, function ($a, $b) {
        return $b['score'] <=> $a['score'];
    });

    // Guarda los datos actualizados en el archivo JSON
    file_put_contents($filename, json_encode($scores, JSON_PRETTY_PRINT));

    // Obtener los 5 mejores resultados
    $topScores = array_slice($scores, 0, 5);
    echo json_encode($topScores); // Devolver los mejores resultados en formato JSON
} else {
    echo "Error: Datos incompletos. Variables recibidas: " . print_r($_POST, true);
}
?>

