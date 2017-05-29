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
  colour_bank: ["red","green","purple","brown","orange"],
  create_food: function(){
    if( this.food.length < 5 ){
      this.food.push({
        x: Math.round(Math.random()*this.board_x), 
        y: Math.round(Math.random()*this.board_y), 
      });
    }
  },
  create_snake: function(index){
    var snake = { 
      cells:     [],
      direction: "right",
      colour:    this.colour_bank[ index ],
    }
    var random_y = Math.round(Math.random()*(this.board_y));
    var random_x = Math.round(Math.random()*(this.board_x)/2);
    for( var i = random_x;  i < random_x + 5; i++ ){
      snake.cells.push({x: i, y: random_y});
    }
    return snake;
  },
  update: function(){
    
    var death_row = [];

    // make snakes move
    for( var i = 0; i < this.snakes.length; i++ ){
      var    snake   = this.snakes[i];
      var     head   = snake.cells[ snake.cells.length - 1 ];
      var new_head   = {x: head.x, y: head.y };
      var snake_eats = false;

           if(snake.direction == "right"){ new_head.x++; }
      else if(snake.direction == "left" ){ new_head.x--; }
      else if(snake.direction == "up"   ){ new_head.y--; }
      else if(snake.direction == "down" ){ new_head.y++; }

      if( new_head.x == 40 ){ new_head.x =  0 }
      if( new_head.x == -1 ){ new_head.x = 39 }
      if( new_head.y == 40 ){ new_head.y =  0 }
      if( new_head.y == -1 ){ new_head.y = 39 } 
      snake.cells.push(new_head); 

      for( var j = 0; j < this.food.length; j++ ){
        if( this.do_cells_clash(this.food[j],new_head)){
          snake_eats = true;
          this.food.pop(j);
        }
      }
      if(snake_eats == false ){ snake.cells.shift(); }
    }

    // marks snakes for killing
    for( var i = 0; i < this.snakes.length; i++ ){

      var head = this.snakes[i].cells[ this.snakes[i].cells.length - 1 ];
      
      for( var j = 0; j < this.snakes.length; j++ ){
        for( var k = 0; k < this.snakes[j].cells.length; k++){
          if( i == j && k == this.snakes[i].cells.length - 1 ){ continue;}
          if( this.do_cells_clash(head, this.snakes[j].cells[k]) ){
            death_row.push(i);
          }
        }
      }
    }

    // kill of snakes
    for( var i = 0; i < death_row.length; i++ ){
      this.snakes[death_row[i]] = this.create_snake(death_row[i]);
    }
  },
  do_cells_clash: function(cell_1,cell_2){
    if( cell_1.x != cell_2.x ){ return false; }
    if( cell_1.y != cell_2.y ){ return false; }
    return true;
  },
  game_loop: function(){
    var t = this;
    setInterval(function(){t.update();}, 60);
    setInterval(function(){t.create_food();}, 2000);
  }
}

board.game_loop();

wss.on('connection', function(ws){
  ws.snake = board.snakes.length;  
  board.snakes.push(board.create_snake(ws.snake));

  var update_client = setInterval(function(){
    var message = JSON.stringify({ snakes: board.snakes, food: board.food });
    ws.send(message);
  }, 60);

  ws.on('close', function () {
    board.snakes.splice(board.snakes.indexOf(ws.snake),1);
    clearInterval(update_client);
  });
  ws.on('message', function(message){
      if( message == "left"  && board.snakes[ws.snake].direction == "right"){ return; }
      if( message == "right" && board.snakes[ws.snake].direction == "left" ){ return; }
      if( message == "down"  && board.snakes[ws.snake].direction == "up"   ){ return; }
      if( message == "up"    && board.snakes[ws.snake].direction == "down" ){ return; }
      board.snakes[ws.snake].direction = message;
      
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


