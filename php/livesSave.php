<?php
// Ruta del archivo JSON de puntuaciones
$filename = '../data/livesResults.json';


// Verifica si los datos necesarios están presentes en la solicitud
if (isset($_POST['player_name']) && isset($_POST['vidas'])) {
    $player_name = $_POST['player_name'];
    $vidas = (int)$_POST['vidas'];
    
    // Lee el archivo JSON existente o inicializa un array si el archivo no existe
    if (file_exists($filename)) {
        $scores = json_decode(file_get_contents($filename), true);
    } else {
        $scores = [];
    }

    // Agrega la nueva puntuación
    $scores[] = [
        'player' => $player_name,
        'lives' => $vidas // Asegúrate de usar 'lives' para ser consistente con el JS
    ];

    // Ordena las puntuaciones de mayor a menor
    usort($scores, function($a, $b) {
        return ($b['lives'] ?? 0) <=> ($a['lives'] ?? 0); // Utiliza el operador de nave espacial con valores predeterminados
    });

    // Guarda los datos actualizados en el archivo JSON
    file_put_contents($filename, json_encode($scores, JSON_PRETTY_PRINT));

    // Obtener los 5 mejores resultados
    $topScores = array_slice($scores, 0, 5);
    echo json_encode($topScores); // Devolver los mejores resultados en formato JSON
} else {
    // Respuesta en formato JSON en caso de error
    echo json_encode(["error" => "Datos incompletos."]);
}
?>
