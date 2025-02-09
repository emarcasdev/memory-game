<?php
// Ruta del archivo JSON de puntuaciones
$filename = '../data/timeResults.json';

// Verifica si los datos necesarios están presentes en la solicitud
if (!empty($_POST['player_name']) && !empty($_POST['time_win'])) {
    $player_name = $_POST['player_name'];
    $timeleft = ($_POST['time_win']);

    // Lee el archivo JSON existente o inicializa un array si el archivo no existe
    if (file_exists($filename)) {
        $scores = json_decode(file_get_contents($filename), true);
    } else {
        $scores = [];
    }

    // Agrega la nueva puntuación
    $scores[] = [
        'player' => $player_name,
        'time_win' => $timeleft
    ];

    // Ordenar el array por puntaje de menor a mayor
    usort($scores, function ($a, $b) {
        return $a['time_win'] <=> $b['time_win'];
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
