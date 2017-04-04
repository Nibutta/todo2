// mongoose
var mongoose = require('mongoose');

// connect to db
    mongoose.connect('mongodb://localhost/data', function () {
    console.log('--> CONNECTED TO DATABASE');
});

// schema
var itemSchema = mongoose.Schema({
    id: Number
    , value: String
    , state: String

});

// model
var itemModel = mongoose.model('itemModel', itemSchema);

// item
var item = new itemModel({id: 0, value: "some text", state: "d"});

//item.save(function (err, data) {
//    if (err) return console.error(err);
//});


// query all the items and print them in console
//itemModel.find(function (err, items) {
//    if (err) return console.error(err);
//    console.log("-> ITEMS:" + items);
//});

var express = require('express');
var taskRouter = express.Router();

/* GET users listing. */
taskRouter.post('/create', function(req, res, next) {
    res.json(req.body);
    item.value = req.params('fake');
    item.id = 1;
    item.state = "p";
    item.save();
    console.log("--> CREATED NEW ITEM");
    });


taskRouter.get('/', function(req, res, next) {
    itemModel.find({}, function (err, items) {
        if (err) res.send(err);
        res.send(items);
        console.log("--> SHOW ITEMS (ALL)");
    });
});

taskRouter.get('/pending', function(req, res, next) {
    itemModel.find({state: "p"}, function (err, items) {
        if (err) res.send(err);
        res.send(items);
        console.log("--> SHOW ITEMS (PENDING)");
    });
});

taskRouter.get('/completed', function(req, res, next) {
    itemModel.find({state: "d"}, function (err, items) {
        if (err) res.send(err);
        res.send(items);
        console.log("--> SHOW ITEMS (COMPLETED)");
    });
});
module.exports = taskRouter;