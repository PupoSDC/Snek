var board = {
	area:          document.querySelector('#canvas').getContext("2d"),
	snakes:        [],
	food:          [],
	canvas_width:  document.querySelector('body').getBoundingClientRect().width,
	canvas_height: document.querySelector('body').getBoundingClientRect().height,
	width:         40,
	height:        40,

	update: function(){

		this.area.fillStyle     = "white";
		this.area.strokeStyle   = "black";
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
	},
	resize: function(){
		var d = document.querySelector('body').getBoundingClientRect();
		this.area.canvas.width  = d.width;
		this.area.canvas.height = d.height;

		var size = d.width <= d.height ? d.width : size = d.height;

		this.canvas_width       = size;
		this.canvas_height      = size;
		this.area.canvas.width  = size; 
		this.area.canvas.height = size;
	}
}

window.onresize = function(event) { board.resize(); };

document.addEventListener("keydown",function(e){
	if(ws) {
		var key = e.which;
		     if(key == "37"){ ws.send("left");  }
		else if(key == "38"){ ws.send("up");    }  
		else if(key == "39"){ ws.send("right"); }
		else if(key == "40"){ ws.send("down");	}
	}	
});

var ws = new WebSocket(`ws://${location.host}`);

ws.onerror   = function(){ console.log('WebSocket error');                  }; 
ws.onopen    = function(){ console.log('WebSocket connection established'); };
ws.onclose   = function(){ console.log('WebSocket connection closed');      };
ws.onmessage = function(event){ 
	var obj = JSON.parse(event.data);
	board.snakes = obj.snakes;
	board.food   = obj.food;
	board.update();               
};

// start game
board.resize();
board.game_loop();

// Set up touch events for mobile, etc
document.querySelector('#canvas').addEventListener("touchstart", function(e){
    mousePos = getTouchPos(canvas, e);
	var touch      = e.touches[0];
	var mouseEvent = new MouseEvent("mousedown", {
	clientX: touch.clientX,
	clientY: touch.clientY
	});
	canvas.dispatchEvent(mouseEvent);
}, false);


document.querySelector('#canvas').addEventListener("touchend", function (e) {
	var pos = getTouchPos( document.querySelector('#canvas'), e);
	console.log(pos);
}, false);


canvas.addEventListener("touchmove", function (e) {
  var touch = e.touches[0];
  var mouseEvent = new MouseEvent("mousemove", {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas.dispatchEvent(mouseEvent);
}, false);

// Get the position of a touch relative to the canvas
function getTouchPos(canvasDom, touchEvent) {
  var rect = canvasDom.getBoundingClientRect();
  return {
    x: touchEvent.touches[0].clientX - rect.left,
    y: touchEvent.touches[0].clientY - rect.top
  };
}