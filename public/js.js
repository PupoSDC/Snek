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

ws.onmessage = function(event){ showMessage(event.data);                    };
ws.onerror   = function(){ showMessage('WebSocket error');                  }; 
ws.onopen    = function(){ showMessage('WebSocket connection established'); };
ws.onclose   = function(){ showMessage('WebSocket connection closed');      };

var board = {
	area:        document.querySelector('#canvas').getContext("2d"),
	cell_width:  10,
	snakes:      [],
	my_snake:    null,
	food:        [],
	width:       document.querySelector('#canvas').width,
	height:      document.querySelector('#canvas').height,

	update: function(){

		this.area.fillStyle   = "white";
		this.area.strokeStyle = "black";
		this.area.fillRect(0, 0,   this.width, this.height);
		this.area.strokeRect(0, 0, this.width, this.height);
		
		for( var i = 0; i < this.food.length; i++ ){
			this.paint_food( this.food[i] );
		}

		for( var i = 0; i < this.snakes.length; i++ ){
			this.paint_snake( this.snakes[i] );
		}
		//The movement code for the snake to come here.
		//The logic is simple
		//Pop out the tail cell and place it infront of the head cell
		//var nx = snake_array[0].x;
		//var ny = snake_array[0].y;
		//These were the position of the head cell.
		//We will increment it to get the new head position
		//Lets add proper direction based movement now
		//if(d == "right") nx++;
		//else if(d == "left") nx--;
		//else if(d == "up") ny--;
		//else if(d == "down") ny++;
		
		//Lets add the game over clauses now
		//This will restart the game if the snake hits the wall
		//Lets add the code for body collision
		//Now if the head of the snake bumps into its body, the game will restart
		//if(nx == -1 || nx == w/cw || ny == -1 || ny == h/cw || check_collision(nx, ny, snake_array))
		//{
		//	//restart game
		//	//init();
		//	//Lets organize the code a bit now.
		//	return;
		//}
		
		//Lets write the code to make the snake eat the food
		//The logic is simple
		//If the new head position matches with that of the food,
		//Create a new head instead of moving the tail
		//if(nx == food.x && ny == food.y){
		//	var tail = {x: nx, y: ny};
		//	score++;
		//	//Create new food
		//	create_food();
		//}
		//else
		//{
		//	var tail = snake_array.pop(); //pops out the last cell
		//	tail.x = nx; tail.y = ny;
		//}
		//The snake can now eat the food.
		
		//snake_array.unshift(tail); //puts back the tail as the first cell
		
		//for(var i = 0; i < snake_array.length; i++)
		//{
		//	var c = snake_array[i];
		//	//Lets paint 10px wide cells
		//	paint_cell(c.x, c.y);
		//}
		
		//Lets paint the food
		
		//Lets paint the score
		//var score_text = "Score: " + score;
		//canvas.fillText(score_text, 5, h-5);
	},
	paint_food: function(food){
		this.area.fillStyle   = "blue";
		this.area.strokeStyle = "white";
		this.area.fillRect( 
			food.x*this.cell_width, 
			food.y*this.cell_width, 
			this.cell_width, 
			this.cell_width
		);
		this.area.strokeRect( 
			food.x*this.cell_width, 
			food.y*this.cell_width, 
			this.cell_width, 
			this.cell_width
		);
	},
	paint_snake: function(snake){
		this.area.fillStyle   = "red";
		this.area.strokeStyle = "white";
		for( var i = 0; i < snake.cells.length; i++ ){
			this.area.fillRect( 
				snake.cells[i].x * this.cell_width, 
				snake.cells[i].y * this.cell_width, 
				this.cell_width, 
				this.cell_width
			);
			this.area.strokeRect( 
				snake.cells[i].x * this.cell_width, 
				snake.cells[i].y * this.cell_width, 
				this.cell_width, 
				this.cell_width
			);			
		}

	},
	game_loop: function(){
		var t = this;
 		setInterval(function(){t.update();}, 100);
 		setInterval(function(){t.create_food();}, 1000);
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


/*
//Lets paint the snake now
function 

//Lets first create a generic function to paint cells


function check_collision(x, y, array){
	//This function will check if the provided x/y coordinates exist
	//in an array of cells or not
	for(var i = 0; i < array.length; i++)
	{
		if(array[i].x == x && array[i].y == y)
		 return true;
	}
	return false;
}

*/