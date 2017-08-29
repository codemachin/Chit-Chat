// Setup basic express server
var express = require('express');
var mongoose = require('mongoose');
var app = express();
var events = require('events');
var eventEmitter = new events.EventEmitter();
require('../app/models/User.js');
require('../app/models/Room.js');
require('../app/models/Chat.js');

var userModel = mongoose.model('User');
var roomModel = mongoose.model('Room');
var chatModel = mongoose.model('Chat');
var responseGenerator = require('./responseGenerator');



module.exports.socketIo = function(server) {

var io = require('socket.io')(server);

// Chatroom
var numUsers = 0;
var users={};
var makeRoom,functionToSetOnline,sendChat;
var sockets = {};

io.on('connection', function (socket) {

  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    // event to store the chat
    eventEmitter.emit('storeChat', {
        sender: socket.username,
        message: data.message,
        room: socket.room,
        date: data.date
      });
    //broadcast the message to only the users in that room
    socket.broadcast.to(socket.room).emit('new message', {
      username: socket.username,
      message: data.message
    });
  });

  //listens from join event on client side 
  socket.on('join', function(room) {

        socket.leave(socket.room);
        // event to create the room or find the room if already present
        eventEmitter.emit('findRoom', room);
        //function creates room when called
        makeRoom = function(id) {
          socket.room = id;
          socket.join(socket.room);
          //emits create room so that client can initiate getchat event
          io.to(sockets[socket.username]).emit('createRoom', socket.room);
        };

    });

  //even to get user chats based on room id
  socket.on('getChat', function(room) {

      eventEmitter.emit('getChat',room);

  });
  // function sends old chats when called
  sendChat = function(result,user){
    io.to(sockets[user]).emit('sendChat',result);
  }
    
      
      
   


  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    eventEmitter.emit('userList');

    socket.username = username;
    sockets[socket.username] = socket.id;


    //compare all users with users that are in sockets
    functionToSetOnline = function(users) {
      for (x in sockets) {
        for (y in users) {
          if (y == x) {
            users[y] = true;
          }
        }
      }
    //emits online users to everyone
    io.emit('users',users)
    }

    // we store the username in the socket session for this client
    /*socket.username = username;*/
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });

  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.to(socket.room).emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.to(socket.room).emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {

    delete sockets[socket.username];
    users[socket.username] = false;

    io.emit('users', users);

    if (addedUser) {
      --numUsers;
      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
  //event listener to find list of all users
  eventEmitter.on('userList',function(){
    
   userModel.find({},function(err,allUsers){
            if(err){                
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                console.log(myResponse);
            }
            else{
                for(var i=0;i<allUsers.length;i++){
                  
                    users[allUsers[i].firstName] = false;
                  

                }
            
                /*console.log(users)*/
                functionToSetOnline(users);

            }

        });//end user model find 

  });
  // gets room or creates new if needed
  eventEmitter.on('findRoom',function(room){

    roomModel.find({ $or: [
     { "name": [ room[0], room[1] ] },
     { "name": [ room[1], room[0] ] }
    ]}, function(err,allRooms){
          if(err){                
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                console.log(myResponse);
        
          } else{
              
                if (allRooms == "" || allRooms == undefined || allRooms == null) {

                   createNewRoom(room);
                

                } else {
                    
                    makeRoom(allRooms[0]._id);

                  }

            }
       });

  })
  // creates new room when called
  var createNewRoom = function(room){
      newRoom = new roomModel({
        name: room,
        createdOn: Date.now()
      });

      newRoom.save(function(err, result) {

        if (err) {
          console.log(err);
        } else if (result == "" || result == undefined || result == null) {
          console.log("Error creating new Room");
        } else {
          makeRoom(result._id);

          }

      });
  }

  //saves all ongoing chat
  eventEmitter.on('storeChat', function(data) {

    

    var newChat = new chatModel({

      sender: data.sender,
      message: data.message,
      room: data.room,
      date: data.date

    });

    newChat.save(function(err, result) {
      if (err) {
        console.log("Error occurred "+err);
      } else if (result == undefined || result == null || result == "") {
        console.log("Error saving chat");
      } else {
        console.log("success");
        
      }
    });

  });
  //get all chats that are in same room
  eventEmitter.on('getChat',function(data){

      chatModel.find({'room':data.room},function(err,result){

          if (err) {
            console.log("Error : " + err);
          } else if (result == undefined || result == null || result == "") {

              console.log("no record");

            }  else {
           
                sendChat(result,data.user);

              }

      })

  })


}
