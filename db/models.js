// mongoose
var mongoose = require('mongoose');

// schema
var itemSchema = mongoose.Schema({
      value:    String
    , state:    String});

// model
var itemModel = mongoose.model('itemModel', itemSchema);
console.log('-->          MODEL LOADED...');

module.exports = { itemModel: itemModel };