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
  food:        [],
  create_food: function(){
    if( this.food.length < 5 ){
      this.food.push({
        x: Math.round(Math.random()*this.board_x), 
        y: Math.round(Math.random()*this.board_y), 
      });
    }
  },
  create_snake: function(){
    var snake = { 
      cells:     [],
      direction: "right",
      colour:    "red",
    }
    for( var i = 4;  i >= 0; i-- ){
      snake.cells.push({x: i, y:0});
    }
    return snake;
  },
  update: function(){
    for( var i = 0; i < this.snakes.length; i++ ){
      var    snake = this.snakes[i];
      var     head = snake.cells[ snake.cells.length - 1 ];
      var new_head = {x: head.x, y: head.y };

           if(snake.direction == "right"){ new_head.x++; }
      else if(snake.direction == "left" ){ new_head.x--; }
      else if(snake.direction == "up"   ){ new_head.y++; }
      else if(snake.direction == "down" ){ new_head.y--; }
      snake.cells.push(new_head); 

      if( new_head.x >= this.board_x || new_head.x < 0 ||   
          new_head.y >= this.board_y || new_head.y < 0 ){
        this.snakes[i] = this.create_snake();
      }
    }


  },
  game_loop: function(){
    var t = this;
    setInterval(function(){t.update();}, 60);
    setInterval(function(){t.create_food();}, 1000);
  }
}

board.game_loop();

wss.on('connection', function(ws){
  ws.snake = board.create_snake();  
  board.snakes.push(ws.snake);
  

  var update_client = setInterval(function(){
    var message = JSON.stringify({ snakes: board.snakes, food: board.food });
    ws.send(message);
  }, 60);

  ws.on('close', function () {
    board.snakes.splice(board.snakes.indexOf(ws.snake),1);
    clearInterval(update_client);
  });
  ws.on('message', function(message){
      if( message == "left"  && ws.snake.direction == "right"){ return; }
      if( message == "right" && ws.snake.direction == "left" ){ return; }
      if( message == "down"  && ws.snake.direction == "up"   ){ return; }
      if( message == "up"    && ws.snake.direction == "down" ){ return; }
      ws.snake.direction = message;
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