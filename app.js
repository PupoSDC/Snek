'use strict';

const session   = require('express-session');
const express   = require('express');
const http      = require('http');
const uuid      = require('uuid');
const WebSocket = require('ws');

const app = express();

// We need the same instance of the session parser in Express and WS server.
const sessionParser = session({
  saveUninitialized: false,
  secret: '$eCuRiTy',
  resave: false
});

// Serve static files from the 'public' folder.
app.use(express.static('public'));
app.use(sessionParser);

app.delete('/logout', function(req, res){
  console.log('Destroying session');
  req.session.destroy();
  res.send({ result: 'OK', message: 'Session destroyed' });
});

// Create HTTP server by ourselves.
const server = http.createServer(app);

const wss = new WebSocket.Server({server});

var board = {
  board_x:     40,
  board_y:     40, 
  snakes:      [],
  my_snake:    null,
  food:        [],
  create_food: function(){
    if( food.length < 5 ){
      this.food.push({
        x: Math.round(Math.random()*board_x), 
        y: Math.round(Math.random()*board_y), 
      });
    }
  },
  create_snake: function(){
    var snake = { 
      cells:     [],
      direction: "right",
      colour:    "red",
    }
    for( var i = 0;  i < 5; i++ ){
      snake.cells.push({x: i, y:0});
    }
    this.snakes.push(snake);
  },
  update: function(){

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
    //  //restart game
    //  //init();
    //  //Lets organize the code a bit now.
    //  return;
    //}
    
    //Lets write the code to make the snake eat the food
    //The logic is simple
    //If the new head position matches with that of the food,
    //Create a new head instead of moving the tail
    //if(nx == food.x && ny == food.y){
    //  var tail = {x: nx, y: ny};
    //  score++;
    //  //Create new food
    //  create_food();
    //}
    //else
    //{
    //  var tail = snake_array.pop(); //pops out the last cell
    //  tail.x = nx; tail.y = ny;
    //}
    //The snake can now eat the food.
    
    //snake_array.unshift(tail); //puts back the tail as the first cell
    
    //for(var i = 0; i < snake_array.length; i++)
    //{
    //  var c = snake_array[i];
    //  //Lets paint 10px wide cells
    //  paint_cell(c.x, c.y);
    //}
    
    //Lets paint the food
    
    //Lets paint the score
    //var score_text = "Score: " + score;
    //canvas.fillText(score_text, 5, h-5);
  },
  game_loop: function(){
    var t = this;
    setInterval(function(){t.update();}, 100);
  }
}


wss.on('connection', function(ws){
  board.create_snake();
  ws.snake = board.snakes[board.snakes.length];

  ws.on('close', function () {
    board.snakes.splice(board.snakes.indexOf(ws.snake),1);
  });
  ws.on('message', function(message){
    if( ws.snake.direction == "right" && message != "left" ){
      ws.snake.direction = "right";
    }
    else if( ws.snake.direction == "left" && message != "right" ){
      ws.snake.direction = "left";
    }
    else if( ws.snake.direction == "up" && message != "down" ){
      ws.snake.direction = "up";
    }
    else if( ws.snake.direction == "down" && message != "up" ){
      ws.snake.direction = "down";
    }
  });
});


server.listen(8080,function(){ 
  console.log('Listening on http://localhost:8080') 
});

function simpleStringify (object){
    var simpleObject = {};
    for (var prop in object ){
        if (!object.hasOwnProperty(prop)){
            continue;
        }
        if (typeof(object[prop]) == 'object'){
            continue;
        }
        if (typeof(object[prop]) == 'function'){
            continue;
        }
        simpleObject[prop] = object[prop];
    }
    return JSON.stringify(simpleObject); // returns cleaned up JSON
};