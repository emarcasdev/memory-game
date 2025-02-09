$(document).ready(function () {
    // Pedir el nombre del jugador que va a jugar
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
      startGame();
      $("#mark").val(50); // El marcador
    });
  
    function startGame() {
      let letters = ["💥", "💤", "💯", "💫", "🕐", "💌"];
      let couples = [];
  
      // Crear las parejas
      for (const letter of letters) {
        couples.push({ name: letter });
        couples.push({ name: letter });
      }
  
      shuffle(couples);
      renderCards(couples);
  
      play(couples);
    }
  
    function play(couples) {
      let score = 50;
      $("#mark").val(50); // El marcador
      let discoverCount = 0;
      let coupleActual = [];
      let checking = false;
  
      $(".card").on("click", function () {
        if ($(this).hasClass("turned")) {
          // Si la carta ya está volteada, no hacer nada
          alert(`La carta ya esta volteada`)
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
            score += 5; // Sumar 1pt por acierto
            $("#mark").val(score); // El marcador
            discoverCount += 2; // Añadir 2 [pareja] cartas al contador de descubiertas
            coupleActual = []; // Vaciar el array
  
            // Comprobar si se descubrieron todas las partidas
            if (discoverCount === couples.length) {
              $(".card").off("click"); // No permitir poder interactuar con las cartas despues de que acabe el juego.
              setTimeout(function () {
                alert(`VICTORIA, ${player_name} has obtenido ${score}`);
                saveGame(player_name, score);
                saveDB(player_name, score)
              }, 500); // Esperar 0.5seg
            }
            checking = false; // Desbloqueo
          } else {
            // Si no coinciden 
            setTimeout(function () {
              score -= 10;
              $("#mark").val(score); // El marcador
              coupleActual[0].card.removeClass("turned"); // Volver a darle la vuelta
              coupleActual[1].card.removeClass("turned"); // Volver a darle la vuelta
              coupleActual = []; // Vaciar el array
              checking = false; // Desbloqueo
  
              if (score === 0 || score < 0) {
                $(".card").off("click"); // No permitir poder interactuar con las cartas despues de que acabe el juego.
                setTimeout(function () {
                  alert(`DERROTA, ${player_name} tu puntuación a quedado en 0.`);
                }, 500); // Esperar 0.5seg
              }
            }, 1000); // Esperar 1seg para dejar un pequeño margen para memorizar
          }
        }
  
      });
    }
  
    // Funcion para saber si el usuario es válido
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
                             <img src="../img/card-cero.png" alt="Card" style="width:100%; height:100%; object.fit:cover;">
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

    async function saveGame(player_name, score) {
      try {
          const response = await fetch('../php/ceroSave.php', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                  player_name: player_name,
                  score: score
              })
          });
  
          if (response.ok) {
            alert('Puntuación guardada, correctamente.');
            const topScores = await response.json(); // Obtener los 5 mejores resultados
            console.log('Mejores resultados:', topScores);
            
            // Crear el string de los mejores resultados
            let resultString = 'Las 5 mejores puntuaciones:\n';
            for (let i = 0; i < topScores.length; i++) {
                resultString += `${i + 1}. ${topScores[i].player}: ${topScores[i].score}\n`;
            }
            
            alert(resultString); // Mostrar los mejores resultados en un alert
          } else {
            const errorText = await response.text();
            console.error('Error en la respuesta del servidor:', errorText);
            alert('Error al guardar la puntuación.');
          }
      } catch (error) {
          console.error('Al parecer hay un error:', error);
          alert('Error al guardar la puntuación.');
      }
  }

  async function saveDB(player_name, score) {
    try {
        const response = await fetch('../database/saveCero.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                player_name: player_name,
                score: score
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
  