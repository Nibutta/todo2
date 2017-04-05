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

var express = require('express');
var taskRouter = express.Router();

//******************************************************************
// SEND ALL ITEMS
taskRouter.get('/', function(req, res, next)
    {
        itemModel.find({}, function (err, items)
        {
            if (err) res.send(err);
            res.send(items);
            console.log("--> SEND ITEMS (ALL)");
        });
    });
//******************************************************************
// SEND PENDING ITEMS
taskRouter.get('/pending', function(req, res, next)
    {
        itemModel.find({state: "p"}, function (err, items)
        {
            if (err) res.send(err);
            res.send(items);
            console.log("--> SEND ITEMS (PENDING)");
        });
    });
//******************************************************************
// SEND COMPLETED ITEMS
taskRouter.get('/completed', function(req, res, next)
    {
        itemModel.find({state: "d"}, function (err, items)
        {
            if (err) res.send(err);
            res.send(items);
            console.log("--> SEND ITEMS (COMPLETED)");
        });
    });
//******************************************************************
// CREATE NEW ITEM
taskRouter.post('/create', function(req, res, next)
    {
        var item = new itemModel(req.body);

        item.save(function(saved_item)
        {
            res.send(saved_item);
            console.log("--> CREATED NEW ITEM");
        });
    });
//******************************************************************
// CLEAR DATABASE
taskRouter.get('/clear', function(req, res, next)
    {
        itemModel.remove({}, function (err, items)
        {
            if (err) res.send(err);
            res.send(items);  // send back empty array --- optional
            console.log("--> CLEARED DATABASE");
        });
    });

module.exports = taskRouter;