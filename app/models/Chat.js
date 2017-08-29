var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var chatSchema = new Schema({

  sender: {type:String,default:"",required:true},
  message: {type:String,default:"",required:true},
  room: {type:String,default:"",required:true},
  date: {type:Date,default:"",required:true},

});

mongoose.model('Chat',chatSchema);