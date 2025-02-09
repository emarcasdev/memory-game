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
      $("#mark").val(5); // Reiniciar el marcador del html
    });
  
    function startGame() {
      let letters = ["🌕", "🐒", "🟠", "🐢", "🐉", "⏳"];
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
      let vidas = 5;
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
          checking = true; // Bloquear mientras se comprueba
          if (coupleActual[0].value === coupleActual[1].value) {
            $("#mark").val(vidas); // El marcador
            discoverCount += 2; // AUmentar las pareja destubirtas
            coupleActual = []; // Vaciar el array
  
            // Comprobar si se descubrieron todas las partidas
            if (discoverCount === couples.length) {
              $(".card").off("click"); // No permitir poder interactuar con las cartas despues de que acabe el juego.
              setTimeout(function () {
                alert(`VICTORIA, ${player_name} ha mantenido ${vidas} ❤.`);
                saveGame(player_name, vidas);
                saveDB(player_name, vidas);
              }, 500); // Esperar 2seg
            }
            checking = false; // Desbloqueo
          } else {
            // Si no coinciden 
            setTimeout(function () {
              vidas -= 1; // Restar 1 vida por fallo
              $("#mark").val(vidas); // Actualizar el marcador del html
              coupleActual[0].card.removeClass("turned"); // Volver a darle la vuelta
              coupleActual[1].card.removeClass("turned"); // Volver a darle la vuelta
              coupleActual = []; // Vaciar el array
              checking = false; // Desbloqueo
  
              if (vidas === 0) {
                $(".card").off("click"); // No permitir poder interactuar con las cartas despues de que acabe el juego.
                setTimeout(function () {
                  alert(`DERROTA, ${player_name} has perdido todas tus vidas.`);
                }, 500);
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
                               <img src="../img/card-lives.png" alt="Card" style="width:100%; height:100%; object.fit:cover;">
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

    async function saveGame(player_name, vidas) {
      try {
        const response = await fetch('../php/livesSave.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                player_name: player_name,
                vidas: vidas
            })
        });
    
        const responseData = await response.json(); // Solo lee la respuesta JSON una vez
    
        if (response.ok) {
            alert('Puntuación guardada correctamente.');
            let resultString = 'Las 5 mejores con más vidas:\n';
            for (let i = 0; i < responseData.length; i++) {
                resultString += `${i + 1}. ${responseData[i].player}: ${responseData[i].lives} ❤️\n`;
            }
            alert(resultString);
        } else {
            console.error('Error en la respuesta del servidor:', responseData);
            alert('Error al guardar la puntuación.');
        }
      } catch (error) {
          console.error('Error de red o de servidor:', error);
          alert('Error al guardar el resultado.');
      }
      
    }
    
    async function saveDB(player_name, vidas) {
      try {
          const response = await fetch('../database/saveLives.php', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                player_name: player_name,
                vidas: vidas
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
  