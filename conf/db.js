// mongoose
var mongoose = require('mongoose');

// connect to db
    mongoose.connect('mongodb://localhost/data', function () {
    console.log('-->   CONNECTED TO DATABASE!');
});

// schema
var messageSchema = mongoose.Schema({
      value:    String
    , state:    String
    , pendN:    Number
    , doneN:    Number});

var itemsPerPage = 5;   // number of items on page
var selectedPage = 1;   // selected page
var itemsNumber = 0;    // how many items to show

var whatToSend = "all";
var foundItemsArray = [];

var startpoint = 0;

var sPend = 0;
var sDone = 0;

// model
var messageModel = mongoose.model('messageModel', messageSchema);

var express = require('express');
var taskRouter = express.Router();

function getStats()
{
    messageModel.find({state: "pending"}).count(function (err, i)
    {
        sPend = i;
        console.log("-->         RECOUNT PENDING: ", sPend);
    });
    messageModel.find({state: "completed"}).count(function (err, i)
    {
        sDone = i;
        console.log("-->       RECOUNT COMPLETED: ", sDone);
    });
}

getStats();

// "TO SEND" FUNCTION
function toSend()
{
    // get the number of items in db
    itemsNumber = sPend + sDone;

    if (foundItemsArray.length !== 0)
    {
        foundItemsArray[0].pendN = sPend;     // set number of pending items
        foundItemsArray[0].doneN = sDone;     // set number of completed items
    }

    console.log("--> SENDING ITEMS TO CLIENT: ", foundItemsArray.length);
    console.log("                FOUND ITEMS: ", itemsNumber);
    console.log("                     STATUS: ", whatToSend);
    console.log("                       PAGE: ", selectedPage);
    console.log("    -----------------------");
    console.log("                       PEND: ", sPend);
    console.log("                       DONE: ", sDone);
}
//******************************************************************
// SENDING ITEMS
taskRouter.get('/', function(req, res, next)
    {
        foundItemsArray = [];

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

        // choose what to send
        if (req.query.status === "all")
        {
            whatToSend = "all"; // send all
        }
        else
        {
            if (req.query.status === "pending")
            {
                whatToSend = "pending"; // send pending
            }
            else
            {
                if (req.query.status === "completed")
                {
                    whatToSend = "completed"; // send completed
                }
                else
                {
                    whatToSend = "all"; // send all
                    console.log("--> STATUS = ?, SENDING ALL...")
                }
            }
        }

        startpoint = (selectedPage * itemsPerPage) - itemsPerPage;
        getStats();

        if (whatToSend === "all")
        {
            messageModel.find({})
                        .limit(itemsPerPage)
                        .skip(startpoint)
                        .sort({date: -1})
                        .exec(function (err, found)
            {
                if (err) res.send(err);
                foundItemsArray = found;
                if (foundItemsArray.length === 0)
                {
                    sPend = 0;
                    sDone = 0;
                }
                toSend();
                // send items to the client
                res.send(foundItemsArray);
            });
        }

        if (whatToSend === "pending")
        {
            messageModel.find({state: "pending"})
                        .limit(itemsPerPage)
                        .skip(startpoint)
                        .sort({date: -1})
                        .exec(function (err, found)
                {
                    if (err) res.send(err);
                    foundItemsArray = found;
                    if (foundItemsArray.length === 0)
                    {
                        sPend = 0;
                    }
                    toSend();
                    // send items to the client
                    res.send(foundItemsArray);
                });
        }

        if (whatToSend === "completed")
        {
            messageModel.find({state: "completed"})
                        .limit(itemsPerPage)
                        .skip(startpoint)
                        .sort({date: -1})
                        .exec(function (err, found)
                {
                    if (err) res.send(err);
                    foundItemsArray = found;
                    if (foundItemsArray.length === 0)
                    {
                        sDone = 0;
                    }
                    toSend();
                    // send items to the client
                    res.send(foundItemsArray);
                });
        }
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
        //getStats();
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
        //getStats();
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
        //getStats();
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
        foundItemsArray = [];
        //getStats();
    });
});

module.exports = taskRouter;