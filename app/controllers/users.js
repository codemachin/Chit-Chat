var mongoose = require('mongoose');
var express = require('express');

// express router // used to define routes 
var userRouter  = express.Router();
var userModel = mongoose.model('User')
var responseGenerator = require('./../../libs/responseGenerator');
var crypto = require('./../../libs/crypto');
var chat = require('./../../libs/chat');
var key = "JAICRYPTO-AES256"
var auth = require("./../../middlewares/auth");
var path = require('path');


module.exports.controllerFunction = function(app) {


    userRouter.get('/logout',function(req,res){
      
      req.session.destroy(function(err) {

        res.redirect('/');

      })  

    });//end logout
    
//////////////////////////api to get all user details//////////////////////////

    userRouter.get('/all',function(req,res){
        userModel.find({},function(err,allUsers){
            if(err){                
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                res.send(myResponse);
            }
            else{

                var myResponse = responseGenerator.generate(false,"retrieved successfully",200,allUsers);
                res.send(myResponse);

            }

        });//end user model find 

    });//end get all users
////////////////////////////////////////get user by email//////////////////////////////

    userRouter.get('/:email/info',function(req,res){

        userModel.findOne({'email':req.params.email},function(err,foundUser){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                res.send(myResponse);
            }
            else if(foundUser==null || foundUser==undefined || foundUser.email==undefined){

                var myResponse = responseGenerator.generate(true,"user not found",404,null);
                res.send(myResponse);

            }
            else{

                var myResponse = responseGenerator.generate(false,"user found",200,foundUser);
                res.send(myResponse);

            }

        });// end find
      

    });//end get all users

    ////////////////////////////////api to signup new user and enryping password with aes algorithm///////////

    userRouter.post('/signup',function(req,res){

        if(req.body.firstName!=undefined && req.body.lastName!=undefined && req.body.email!=undefined && req.body.password!=undefined){

            var passwordDb = crypto.encrypt(req.body.password,key);

            var newUser = new userModel({

                userName            : req.body.userName,
                firstName           : req.body.firstName,
                lastName            : req.body.lastName,
                email               : req.body.email,
                password            : passwordDb


            });// end new user 

            newUser.save(function(err){
                if(err){

                    var myResponse = responseGenerator.generate(true,"username already taken",500,null);
                    res.send(myResponse);
                   

                }
                else{

                   var myResponse = responseGenerator.generate(false,"successfully signup user",200,newUser);
                   
                   req.session.user = newUser;
                   delete req.session.user.password;
                   
                   res.send(myResponse);
                  
                }

            });//end new user save


        }
        else{

            var myResponse = {
                error: true,
                message: "Some body parameter is missing",
                status: 403,
                data: null
            };

            res.send(myResponse);

            

        }
        

    });//end get all users

//////////////////////////////////////////api to log in user///////////////////////////////////////

    userRouter.post('/login',function(req,res){

        var passwordDb = crypto.encrypt(req.body.password,key);

        userModel.findOne({$and:[{'userName':req.body.username},{'password':passwordDb}]},function(err,foundUser){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                res.send(myResponse);
            }
            else if(foundUser==null || foundUser==undefined || foundUser._id==undefined){

                var myResponse = responseGenerator.generate(true,"user not found. Check your username and password",404,null);
                res.send(myResponse);

            }
            else{

                  
                  req.session.user = foundUser;
                  delete req.session.user.password;
                  
                  var myResponse = responseGenerator.generate(false,"success",200,foundUser);
                  res.send(myResponse);

            }

        });// end find


    });//end get signup screen




    // this should be the last line
    // now making it global to app using a middleware
    // think of this as naming your api 
    app.use('/api/v1/users', userRouter);

    



 
} //end contoller code
