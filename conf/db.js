// mongoose
var mongoose = require('mongoose');

// connect to db
    mongoose.connect('mongodb://localhost/data', function () {
    console.log('-->   CONNECTED TO DATABASE!');
});

// schema
var messageSchema = mongoose.Schema({
      value:    String
    , state:    String });

var itemsPerPage = 5;   // number of items on page
var selectedPage = 1;   // selected page
var itemsNumber = 0;    // how many items to show

var whatToSend = {};
var messageO = { items: [], doneN: 0, pendN: 0 };

var startpoint = 0;

// model
var messageModel = mongoose.model('messageModel', messageSchema);

var express = require('express');
var taskRouter = express.Router();

function getStats(callback)
{
    messageModel.find({state: "pending"}).count(function (err, sPend)
    {
        console.log("-->         RECOUNT PENDING: ", sPend);
        messageModel.find({state: "completed"}).count(function (err, sDone)
        {
            callback({sPend: sPend, sDone: sDone});

            console.log("-->       RECOUNT COMPLETED: ", sDone);
        });
    });
}
//******************************************************************
// SENDING ITEMS
taskRouter.get('/', function(req, res, next)
    {
        selectedPage = +req.query.page;
        // set selected page
        if ((selectedPage === "") || (isNaN(selectedPage) === true))
        {
            console.log("--> PAGE = ?, SET PAGE TO 1...");
            selectedPage = 1;
        }
        else
        {
            selectedPage = req.query.page;
        }

        var state = "";
        // choose what to send
        if (req.query.status === "all")
        {
            whatToSend = {}; // send all
            state = "all";
        }
        else
        {
            if (req.query.status === "pending")
            {
                whatToSend = {state: "pending"}; // send pending
                state = "pending";
            }
            else
            {
                if (req.query.status === "completed")
                {
                    whatToSend = {state: "completed"}; // send completed
                    state = "completed";
                }
                else
                {
                    whatToSend = {}; // send all
                    state = "all";
                    console.log("--> STATUS = ?, SENDING ALL...")
                }
            }
        }

        startpoint = (selectedPage * itemsPerPage) - itemsPerPage;
        // get the number of items in db
        getStats(function(stats)
        {
            messageModel.find(whatToSend)
                .limit(itemsPerPage)
                .skip(startpoint)
                .sort({date: -1})
                .exec(function (err, found)
                {
                    if (err) res.send(err);
                    itemsNumber = stats.sPend + stats.sDone;
                    messageO.items = found;
                    messageO.pendN = stats.sPend;
                    messageO.doneN = stats.sDone;
                    console.log("--> SENDING ITEMS TO CLIENT: ", found.length);
                    console.log("                FOUND ITEMS: ", itemsNumber);
                    console.log("                SHOW STATUS: ", state);
                    console.log("                       PAGE: ", selectedPage);
                    console.log("    -----------------------");
                    console.log("                       PEND: ", stats.sPend);
                    console.log("                       DONE: ", stats.sDone);
                    // send items to the client
                    res.send(messageO);
                });
        });

    });
//******************************************************************
// CREATE NEW ITEM
taskRouter.post('/create', function(req, res, next)
{
    messageModel.create({ value: req.body.value, state: req.body.state }, function (err, item)
    {
        if (err) res.send(err);
        res.send(item);
        console.log("-->        CREATED NEW ITEM!");
        console.log("                      VALUE: ", req.body.value);
    });
});
//******************************************************************
// CHANGE ITEM STATUS
taskRouter.put('/check/:id', function(req, res, next)
{
    messageModel.findOneAndUpdate({_id: req.params.id}, {state: req.body.state}, {new: true}, function(err, item)
    {
        if (err) res.send(err);
        res.send(item);
        console.log("-->  ITEM STATE UPDATED, ID: ", req.params.id);
        console.log("                  NEW STATE: ", item.state);
    });
});
//******************************************************************
// EDIT ITEM
taskRouter.put('/edit/:id', function(req, res, next)
{
    messageModel.findOneAndUpdate({_id: req.params.id}, {value: req.body.value}, {new: true}, function(err, item)
    {
        if (err) res.send(err);
        res.send(item);
        console.log("-->  ITEM VALUE UPDATED, ID: ", req.params.id);
        console.log("                  NEW VALUE: ", item.value);
    });
});
//******************************************************************
// DELETE ITEM
taskRouter.delete('/delete/:id', function(req, res, next)
{
    messageModel.remove({_id: req.params.id}, function(err, del_item)
    {
        if (err) res.send(err);
        res.send(del_item);
        console.log("-->        ITEM DELETED, ID: ", req.params.id);
    });
});
//******************************************************************
// CLEAR DATABASE
taskRouter.get('/clear', function(req, res, next)
{
    messageModel.remove({}, function (err, items)
    {
        if (err) res.send(err);
        res.send(items);  // send back empty array --- optional
        console.log("-->        DATABASE CLEARED!");
    });
});

module.exports = taskRouter;