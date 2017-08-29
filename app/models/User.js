var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new Schema({

  firstName : {type:String,default:"",required:true},
  lastName : {type:String,default:"",required:true},
  email : {type:String,default:"",required:true,unique:true},
  password : {type:String,default:"",required:true},
  created : {type:Date,default:Date.now},
  updated : {type:Date,default:Date.now}

});

mongoose.model('User',userSchema);