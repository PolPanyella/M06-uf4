
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
let viewers = [];


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
			
			
			info = {
				player_disconected_text:  ""
			};
			sendInfoViewers(info);
			if(player2 != null){
				
				let info = {
					player_disconected_text:  "player1 disconected"
				};
				sendInfoViewers(info);
			
				player2.send(JSON.stringify(info));
			}
		});

			if(player2 != null){
				
				let info = {
					player_disconected_text:  ""
				};
			
				player2.send(JSON.stringify(info));
			}


		player1.on('message', function (msg){
			if(player2 == null){
				return;
			}
			console.log("Jugador 1: "+msg);
			let info = JSON.parse(msg);

			sendInfoViewers(info);
			if(info.ps1y != null){	
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
					

					sendInfoViewers(data);

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
			
		player2 = conn;
		player2.on('close', function(){
			console.log("Player 2 disconnected");
			player2 = null;

			if(player1 != null){
				
				info = {
					player_disconected_text:  ""
				};
				sendInfoViewers(info);
			
				player1.send(JSON.stringify(info));
			}

		});

			if(player1 != null){
				
				let info = {
					player_disconected_text:  ""
				};
			
				player1.send(JSON.stringify(info));
			}
		setTimeout(function(){
		
			let info = {
				game_start : true
			}
			player1.send(JSON.stringify(info));
			player2.send(JSON.stringify(info));
		}, 500);

		
		player2.send(JSON.stringify(info));
		player2.on('message', function (msg){
			
			if(player1 == null){
				return;
			}
			
			console.log("Jugador 2: "+msg);
			let info = JSON.parse(msg);

			sendInfoViewers(info);
			


			if(info.ps2y != null){	
				player1.send(JSON.stringify(info));
			}
			info = {
				player_disconected_text:  ""
			};
			sendInfoViewers(info);
		});
	}
	else{
		viewers.push(conn);
		let info = {
			player_num: 3		
		}

		conn.send(JSON.stringify(info));

		info = {
			game_start : true
		}	
		conn.send(JSON.stringify(info));
		//sendInfoViewers();
	}

	
});
function sendInfoViewers(info){
	viewers.forEach(function sendViewer(viewer, index){

		
		//console.log(viewer);

		viewer.send(JSON.stringify(info));
					
		
	})

}





