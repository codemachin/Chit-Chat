var express = require('express');
var app = express();
var server = require('http').createServer(app);
// initialize the socket.io library
var mongoose = require('mongoose');
// module for maintaining sessions
var session = require('express-session');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var responseGenerator = require('./libs/responseGenerator');
// path is used the get the path of our files on the computer
var path = require ('path');

require('./libs/chat.js').socketIo(server);

app.use(logger('dev'));
app.use(bodyParser.json({limit:'10mb',extended:true}));
app.use(bodyParser.urlencoded({limit:'10mb',extended:true}));
app.use(cookieParser());

// initialization of session middleware 

app.use(session({
  name :'myCustomCookie',
  secret: 'myAppSecret', // encryption key 
  resave: true,
  httpOnly : true,
  saveUninitialized: true,
  cookie: { secure: false },
  cookie:{maxAge:24*60*60*1000}
}));

// set the templating engine 


//set the views folder to html page in views folder


app.use('/',express.static(__dirname + '/app/views'));

app.set('views', path.resolve(__dirname,'./app/views'));
app.set('view engine', 'ejs');


var dbPath  = "mongodb://localhost/myChat";

// command to connect with database
db = mongoose.connect(dbPath);

mongoose.connection.once('open', function() {

	console.log("database connection open success");

});


// fs module, by default module for file management in nodejs
var fs = require('fs');

// include all our model files
fs.readdirSync('./app/models').forEach(function(file){
	// check if the file is js or not
	if(file.indexOf('.js'))
		// if it is js then include the file from that folder into our express app using require
		require('./app/models/'+file);

});// end for each

// include controllers
fs.readdirSync('./app/controllers').forEach(function(file){
	if(file.indexOf('.js')){
		// include a file as a route variable
		var route = require('./app/controllers/'+file);
		//call controller function of each file and pass your app instance to it
		route.controllerFunction(app)

	}

});//end for each

//////////////////////setting session of current logged in user////////////////////

var auth = require("./middlewares/auth");
app.use(function(err,res,next){
 auth.setLoggedInUser(err,res,next);
})

/////////////////////////error handling illegal routes/////////////////////////////

app.use(function(req, res) {
    if(res.status == 404){
    var myResponse = responseGenerator.generate(false,"You hit an incorrect path. Check again",404,null);
    res.send(myResponse);
    }else {
      var myResponse = responseGenerator.generate(true,"invalid request",500,null);
      res.send(myResponse);
    }
    
  });	


server.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});