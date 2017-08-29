var mongoose = require('mongoose');
var express = require('express');

// express router // used to define routes 

var auth = require("./../../middlewares/auth");
var path = require('path');


module.exports.controllerFunction = function(app) {

    app.get('/chat',auth.chatLogin, function(req, res){

      /*res.sendFile(path.resolve('app/views/chat.html'));*/
      res.render('chat',
                {
                  user:req.session.user,
                });

    });
}