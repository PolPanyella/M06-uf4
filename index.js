
const PORT = 7777;

let http = require('http');
let static = require('node-static');
let ws = require('ws');

//
// Create a node-static server instance to serve the './public' folder
//
let file = new static.Server('./public');
 
let http_server = http.createServer(function (request, response) {
    request.addListener('end', function () {
        //
        // Serve files!
        //
        file.serve(request, response);
    }).resume();
}).listen(PORT);

let ws_server = new ws.Server({server: http_server});

let player1, player2;
let gameOver = false;
let maxScore = 3;

ws_server.on('connection', function (conn){
	console.log("Usuaario conectado");
	if(player1 == null){
		player1 = conn;
		
		let info = {
			player_num: 1
		};

		player1.send(JSON.stringify(info));
		
		player1.on('close', function(){
			console.log("Player 1 disconnected");
			player1 = null;

			let info = {
				player_disconected_text:  "player1 disconected"
			};
			
				player2.send(JSON.stringify(info));
		});



		player1.on('message', function (msg){
			if(player2 == null){
				return;
			}
			console.log("Jugador 1: "+msg);
			let info = JSON.parse(msg);

			if(info.y != null){	
				player2.send(JSON.stringify(info));
			}
			else if(info.by != null){
				player2.send(JSON.stringify(info));
			}
			else if (info.ps1 != null){
				player2.send(JSON.stringify(info));
				if(info.ps1 >= maxScore || info.ps2 >= maxScore){
					gameOver = true;
					let data = {
						game_over : true,
						winner: 0

					}
					
					if(info.ps1 >= maxScore){
						data.winner = 1;
					}
					else if (info.ps2 >= maxScore){
						data.winner = 2;
					}
					let data_json = JSON.stringify(data);
					

					player1.send(data_json);
					player2.send(data_json);
					return;
				}


			}

		});

	}
	else if(player2 == null){
		let info = {
			player_num: 2
		};
			
		player2.on('close', function(){
			console.log("Player 1 disconnected");
			player2 = null;

		});

		setTimeout(function(){
		
			let info = {
				game_start : true
			}
			player1.send(JSON.stringify(info));
			player2.send(JSON.stringify(info));
		}, 500);

		player2 = conn;
		
		player2.send(JSON.stringify(info));
		player2.on('message', function (msg){
			if(player1 == null){
				return;
			}
			console.log("Jugador 2: "+msg);
			let info = JSON.parse(msg);

			if(info.y != null){	
				player1.send(JSON.stringify(info));
			}
		});
	}

	
});






