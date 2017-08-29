var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var roomSchema = new Schema({

  name: { type:[String], required:true},
  created : {type:Date,default:Date.now},
  updated : {type:Date,default:Date.now}

});

mongoose.model('Room',roomSchema);