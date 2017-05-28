const messages = document.querySelector('#messages');

var ws = new WebSocket(`ws://${location.host}`);

function showMessage(message){
	messages.textContent += `\n${message}`;
	messages.scrollTop = messages.scrollHeight;
};

function handleResponse(response){
	return response.ok
	  ? response.json().then( (data) => JSON.stringify(data, null, 2))
	  : Promise.reject(new Error('Unexpected response'));
};

ws.onerror   = function(){ showMessage('WebSocket error');                  }; 
ws.onopen    = function(){ showMessage('WebSocket connection established'); };
ws.onclose   = function(){ showMessage('WebSocket connection closed');      };

var board = {
	area:          document.querySelector('#canvas').getContext("2d"),
	snakes:        [],
	food:          [],
	canvas_width:  document.querySelector('#canvas').width,
	canvas_height: document.querySelector('#canvas').height,
	width:         40,
	height:        40,

	update: function(){

		this.area.fillStyle   = "white";
		this.area.strokeStyle = "black";
		this.area.fillRect(0, 0,   this.canvas_width, this.canvas_height);
		this.area.strokeRect(0, 0, this.canvas_width, this.canvas_height);
		
		for( var i = 0; i < this.food.length; i++ ){
			this.paint_food( this.food[i] );
		}

		for( var i = 0; i < this.snakes.length; i++ ){
			this.paint_snake( this.snakes[i] );
		}
	},
	paint_food: function(food){
		this.area.fillStyle   = "blue";
		this.area.strokeStyle = "white";
		this.area.fillRect( 
			food.x*this.canvas_width  / this.width , 
			food.y*this.canvas_width  / this.width , 
			this.canvas_width  / this.width,
			this.canvas_height / this.height
		);
		this.area.strokeRect( 
			food.x*this.canvas_width  / this.width , 
			food.y*this.canvas_height / this.height, 
			this.canvas_width  / this.width,
			this.canvas_height / this.height
		);
	},
	paint_snake: function(snake){
		this.area.fillStyle   = snake.colour;
		this.area.strokeStyle = "white";
		for( var i = 0; i < snake.cells.length; i++ ){
			this.area.fillRect( 
				snake.cells[i].x * this.canvas_width  / this.width ,  
				snake.cells[i].y * this.canvas_width  / this.width , 
				this.canvas_width  / this.width,
				this.canvas_width  / this.width
			);
			this.area.strokeRect( 
				snake.cells[i].x * this.canvas_width  / this.width ,  
				snake.cells[i].y * this.canvas_width  / this.width , 
				this.canvas_width  / this.width,
				this.canvas_width  / this.width
			);			
		}

	},
	game_loop: function(){
		var t = this;
 		setInterval(function(){t.update();}, 100);
	}
}

board.game_loop();

document.addEventListener("keydown",function(e){
	if(ws) {
		var key = e.which;
		     if(key == "37"){ ws.send("left");  }
		else if(key == "38"){ ws.send("up");    }  
		else if(key == "39"){ ws.send("right"); }
		else if(key == "40"){ ws.send("down");	}
	}	
});

ws.onmessage = function(event){ 
	var obj = JSON.parse(event.data);
	board.snakes = obj.snakes;
	board.food   = obj.food;
	board.update();
	console.log(event.data)                   
};