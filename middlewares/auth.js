var mongoose = require('mongoose');
var userModel = mongoose.model('User')


// app level middleware to set request user 

exports.setLoggedInUser = function(req,res,next){

	if(req.session && req.session.user){
		userModel.findOne({'email':req.session.user.email},function(err,user){

			if(user){
				req.user = user;
				delete req.user.password; 
				req.session.user = user;
				delete req.session.user.password; 

				next()
			}
			else{
				// do nothing , because this is just to set the values
			}
		});
	}
	else{
		next();
	}


}//


exports.checkLogin = function(req,res,next){

	if(!req.user && !req.session.user){
	
		res.status(200).send({"loginStatus":false});

	}
	else{

		next();
	}

}// end checkLogin

exports.isVerifying = function(req,res,next){

	if(req.session.isUserVerifying!=true){
	
		res.status(200).send({'verifying':false});

	}
	else{

		next();
	}

}// end checking if user has actually requested otp before updating password by forgot password api

exports.chatLogin = function(req,res,next){

	if(!req.user && !req.session.user){
	
		res.redirect('/');

	}
	else{

		next();
	}

}// end checkLogin
