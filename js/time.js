$(document).ready(function () {
    let timer; // Temporizador
    let timeLimit = 45; // Tiempo en segundos igual a 1 min
    let timeLeft = timeLimit; // Tiempo que falta para terminar
    let player_name;

    // Arrancar la partida
    let user = userValid();
    if (user) {
        startGame();
    } else {
        userValid();
    }

    // Volver a jugar una partida nueva
    $(".restart").on("click", function () {
        clearInterval(timer); // Detener el temporizar anterior antes de reiniciar
        timeLimit = 45; // Tiempo en segundos igual a 1 min
        timeLeft = timeLimit; // Tiempo que falta para terminar
        startGame();
    });

    function startGame() {
        let letters = ["🔥", "🌿", "💧", "⚡", "❄", "🛫"];
        let couples = [];

        // Crear las parejas
        for (const letter of letters) {
            couples.push({ name: letter });
            couples.push({ name: letter });
        }

        shuffle(couples);
        renderCards(couples);

        startTimer(); // Iniciar temporizador

        play(couples);

    }

    function play(couples) {
        let discoverCount = 0;
        let coupleActual = [];
        let checking = false;

        $(".card").on("click", function () {
            if ($(this).hasClass("turned")) {
                // Si la carta ya está volteada, no hacer nada
                alert(`La carta ya esta volteada`);
                return;
            }

            // Si se está comprobando un pareja no permitir clicar otra carta
            if (checking) {
                return;
            }

            $(this).toggleClass("turned"); // Dar la vuelta a la carta
            let valor = $(this).find(".front").text(); // Obtener el valor de la carta
            coupleActual.push({ card: $(this), value: valor }); // Añadir la carta a la lista [DISCOVER DE MOMENTO NO ES NECESARIO]

            if (coupleActual.length === 2) {
                checking = true; // Bloqueo mientras se comprueba
                if (coupleActual[0].value === coupleActual[1].value) {
                    discoverCount += 2;
                    coupleActual = []; // Vaciar el array

                    // Comprobar si se descubrieron todas las partidas
                    if (discoverCount === couples.length) {
                        $(".card").off("click"); // No permitir poder interactuar con las cartas despues de que acabe el juego.
                        clearInterval(timer); // Detener contador
                        setTimeout(function () {
                            let timer = timeLimit - timeLeft;
                            alert(`VICTORIA, ${player_name} has completa el juego en ${timer} seg.`);
                            saveGame(player_name, timer);
                            saveDB(player_name,);
                        }, 500); // Esperar 0.5seg para mostrar la victorio
                    }
                    checking = false; // Desbloqueo
                } else {
                    // Si no coinciden
                    setTimeout(function () {
                        coupleActual[0].card.removeClass("turned"); // Volver a darle la vuelta
                        coupleActual[1].card.removeClass("turned"); // Volver a darle la vuelta
                        coupleActual = []; // Vaciar el array
                        checking = false; // Desbloqueo
                    }, 500); // Esperar 1seg para dejar un pequeño margen para memorizar
                }
            }
        });
    }

    // FUNCIÓN PARA INICIAR EL TEMPORIZADOR
    function startTimer() {
        $("#timer").val(timeLeft + "seg"); // Timepo inicial
        timer = setInterval(function () {
            timeLeft--; // Restar 1seg
            $("#timer").val(timeLeft + "seg"); // Mostra el tiempo restante

            if (timeLeft <= 0) {
                clearInterval(timer); // Detener contador
                alert("DERROTA, por tiempo cumplido.");
                $(".card").off("click"); // No permitir poder interactuar con las cartas despues de que acabe el juego.
            }
        }, 1000); // Que se actualize cada 1seg
    }

    function userValid() {
        // Pedir el nombre del jugador que va a jugar
        player_name = prompt("Ingrese el nombre del jugador");
        $("#player").val(player_name);

        if (player_name === "" || player_name.length > 10) {
            return false; // Nombre no valido
        } else {
            return true; // Nombre válido
        }
    }

    // Función para cargar las cartas en HTML despues de barajarlas
    function renderCards(couples) {
        $(".tablero").empty(); // Limpiar el tablero
        // Recorro la lista de las parejas
        for (let i = 0; i < couples.length; i++) {
            const card = couples[i];
            // Añadir las cartas al tablero
            $(".tablero").append(
                `<div class="card">
                         <div class="back">
                             <img src="../img/card-time.png" alt="Card" style="width:100%; height:100%; object.fit:cover;">
                         </div>
                         <div class="front">${card.name}</div>
                 </div>`
            );
        }
    }

    // Función para colocar las cartas en posiciones aleatorios [BAREJEAR]
    function shuffle(couples) {
        couples.sort(() => Math.random() - 0.5);
    }

    async function saveGame(player_name, timer) {
        try {
            const response = await fetch('../php/timeSave.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    player_name: player_name,
                    time_win: timer
                })
            });

            if (response.ok) {
                alert('Puntuación guardada, correctamente.');
                const topScores = await response.json(); // Obtener los 5 mejores resultados
                console.log('Mejores resultados:', topScores);

                // Crear el string de los mejores resultados
                let resultString = 'Las 5 mejores tiempos:\n';
                for (let i = 0; i < topScores.length; i++) {
                    resultString += `${i + 1}. ${topScores[i].player}: ${topScores[i].time_win} seg.\n`;
                }

                alert(resultString); // Mostrar los mejores resultados en un alert
            } else {
                const errorText = await response.text();
                console.error('Error en la respuesta del servidor:', errorText);
                alert('Error al guardar la puntuación.');
            }
        } catch (error) {
            console.error('Error de red o de servidor:', error);
            alert('Error al guardar el resultado.');
        }
    }

    async function saveDB(player_name, timer) {
        try {
            const response = await fetch('../database/saveTime.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    player_name: player_name,
                    time_win: parseInt(timer)
                })
            });
    
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    alert('Datos guardados en la base de datos.');
                } else {
                    alert('Error al guardar en la base de datos: ' + result.error);
                }
            } else {
                alert('Error en la respuesta del servidor.');
            }
        } catch (error) {
            console.error('Error de red o de servidor:', error);
            alert('Error al guardar el resultado.');
        }
    }
    
});
