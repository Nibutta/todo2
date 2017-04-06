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
var item = new itemModel({id: 0, value: "text", state: "p"});

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
// CREATE NEW ITEM
taskRouter.post('/create', function(req, res, next)
    {
        var item = new itemModel(req.body);

        item.save(function(saved_item)
        {
            res.send(saved_item);
            console.log("--> CREATED NEW ITEM, ID: ", req.body.id);
        });
    });
//******************************************************************
// UPDATE ITEM STATUS
taskRouter.post('/update', function(req, res, next)
{
    itemModel.findOneAndUpdate({id: req.body.id}, {state: req.body.state}, function(upd_item)
    {
        res.send(upd_item);
        console.log("--> ITEM STATUS UPDATED, ID: ", req.body.id);
        console.log("                 NEW STATUS: ", req.body.state);
    });
});
//******************************************************************
// DELETE ITEM
taskRouter.post('/delete', function(req, res, next)
{
    itemModel.remove({id: req.body.id}, function(del_item)
    {
        res.send(del_item);
        console.log("--> ITEM DELETED, ID: ", req.body.id);
    });
});
//******************************************************************
// EDIT ITEM VALUE
taskRouter.post('/edit', function(req, res, next)
{
    itemModel.findOneAndUpdate({id: req.body.id}, {value: req.body.value}, function(edit_item)
    {
        res.send(edit_item);
        console.log("--> ITEM VALUE UPDATED, ID: ", req.body.id);
        console.log("                 NEW VALUE: ", req.body.value);
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