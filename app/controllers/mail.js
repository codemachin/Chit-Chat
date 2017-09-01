var express=require('express');
var nodemailer = require("nodemailer");
var mongoose = require('mongoose');
var app=express();
var shortid = require("shortid");
var userModel = mongoose.model('User');
var auth = require("./../../middlewares/auth");
var responseGenerator = require('./../../libs/responseGenerator');
var crypto = require('./../../libs/crypto');
var key = "JAICRYPTO-AES256"
var async = require("async");


/*
  Here we are configuring our SMTP Server details.
  STMP is mail server which is responsible for sending and recieving email.
*/

var smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'viveksome2@gmail.com',
        pass: '*123#vivek'
    },
    tls: {rejectUnauthorized: false},
    debug:true
});


/*------------------SMTP Over-----------------------------*/

/*------------------Routing Started ------------------------*/
module.exports.controllerFunction = function(app) {
  var OTP="";
  var userName="";
  var user = {};

    app.get('/mail/requestPass/:id',function(req,res){
      OTP = shortid.generate();
      userName = req.params.id;
      
      var functionToFindUserByEmail = function(callback){
            
          userModel.findOne({'userName':req.params.id},function(err,foundUser){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                callback(myResponse);
            }
            else if(foundUser==null || foundUser==undefined || foundUser.userName==undefined){

                var myResponse = responseGenerator.generate(true,"user not found",404,null);
                callback(myResponse)
                

            }
            else{

                user = foundUser;
                callback(null, foundUser);

            }
          })
          
      };

      var functionToSendEmail = function(arg, callback){

          var mailOptions={
            to : arg.email,
            subject : "Enter OTP",
            text : "Follow this link : http://52.1.107.157/#/verifyOTP and enter OPT : "+OTP
          }
          console.log(mailOptions);
          smtpTransport.sendMail(mailOptions, function(error, response){
             if(error){
                console.log(error);
                var myResponse = responseGenerator.generate(true,"Mail sending failed "+err,403,null);
                callback(myResponse)
             }else{
                    console.log("Message sent: " + response.message);
                    req.session.isUserVerifying=true;
                    var myResponse = responseGenerator.generate(false,"Otp sent to "+arg.email+". Check and verify",200,null);
                    callback(null,myResponse);
                 }
          });
          
      }

      //used Async waterfall because needed to first get user info from database to update his password
      async.waterfall([
        // A list of functions
        functionToFindUserByEmail,
        functionToSendEmail
        
      ],    
      function(err, results){
         if(err){     
            res.send(err);
         }else {
            res.send(results)
         }
      });
      
      
    });
  //////////////////verifies otp/////////////////////////

    app.get('/otp/verify/:id',function(req,res){
        if(OTP==req.params.id){
          var myResponse = responseGenerator.generate(false,"OTP verified successfully",200,null);
                res.send(myResponse);
        }else{
          var myResponse = responseGenerator.generate(true,"error verifying otp, enter again",404,null);
                res.send(myResponse);
        }

    })

  //////////////////////////updates new password into database////////////////////////

    app.post('/account/update',auth.isVerifying,function(req,res){
     
            var passwordDb = crypto.encrypt(req.body.password,key);

            user.password=passwordDb;

            userModel.findOneAndUpdate({'userName': userName},user,function(err,result){
                if(err){
                  var myResponse = responseGenerator.generate(true,"some error"+err,404,null);
                  res.send(myResponse);
                }else{
                  
                  var myResponse = responseGenerator.generate(false,"pasword updated successfully",200,result);
                  res.send(myResponse);
                }
            })

     });
    
}


/*--------------------Routing Over----------------------------*/


