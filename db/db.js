// mongoose
var mongoose = require('mongoose');

// connect to db
mongoose.connect('mongodb://localhost/data', function ()
{
    console.log('-->       DATABASE LOADED...');
});

var models = require('./models');