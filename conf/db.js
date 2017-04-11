// mongoose
var mongoose = require('mongoose');

// connect to db
    mongoose.connect('mongodb://localhost/data', function () {
    console.log('--> CONNECTED TO DATABASE');
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
var sliced = [];

var sPend = 0;
var sDone = 0;

// model
var messageModel = mongoose.model('messageModel', messageSchema);

var express = require('express');
var taskRouter = express.Router();

// "TO SEND" FUNCTION
function toSend()
{
    // set point in array
    startpoint = (selectedPage * itemsPerPage) - itemsPerPage;

    // get the number of items in db
    itemsNumber = foundItemsArray.length;

    // get what to send
    sliced = foundItemsArray.slice(startpoint, startpoint + itemsPerPage);
    if (sliced.length !== 0)
    {
        sliced[0].pendN = sPend;     // set number of pending items
        sliced[0].doneN = sDone;     // set number of completed items
    }

    console.log("--> SENDING ITEMS TO CLIENT: ", sliced.length);
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
        messageModel.find({state: "pending"}).count(function (err, i)
        {
            sPend = i;
        });
        messageModel.find({state: "completed"}).count(function (err, i)
        {
            sDone = i;
        });

        foundItemsArray = [];
        sliced = [];
        var parseRes = [];

        selectedPage = +req.query.page;
        // set selected page
        if ((req.query.page === "") || (isNaN(req.query.page) === true))
        {
            console.log("--> PAGE = ?, SETTING PAGE TO 1...");
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

        if (whatToSend === "all")
        {
            messageModel.find({}, function (err, found)
            {
                if (err) res.send(err);
                foundItemsArray = found;
                // RECOUNT
                if (foundItemsArray.length === 0)
                {
                    sPend = 0;
                    sDone = 0;
                }
                else
                {
                    sPend = 0;
                    sDone = 0;
                    foundItemsArray.forEach(function (entry)
                    {
                        if (entry.state === "pending")
                        {
                            sPend++;
                        }
                        else
                        {
                            sDone++;
                        }
                    })
                }

                toSend();

                // send items to the client
                res.send(sliced);
            });
        }

        if (whatToSend === "pending")
        {
            messageModel.find({}, function (err, found)
            {
                if (err) res.send(err);
                parseRes = found;
                // RECOUNT
                if (parseRes.length === 0)
                {
                    sPend = 0;
                    sDone = 0;
                }
                else
                {
                    sPend = 0;
                    sDone = 0;
                    parseRes.forEach(function (entry)
                    {
                        if (entry.state === "pending")
                        {
                            sPend++;
                            foundItemsArray.push(entry);
                        }
                        else
                        {
                            sDone++;
                        }
                    })
                }

                toSend();

                // send items to the client
                res.send(sliced);
            });
        }

        if (whatToSend === "completed")
        {
            messageModel.find({}, function (err, found)
            {
                if (err) res.send(err);
                parseRes = found;
                // RECOUNT
                if (parseRes.length === 0)
                {
                    sPend = 0;
                    sDone = 0;
                }
                else
                {
                    sPend = 0;
                    sDone = 0;
                    parseRes.forEach(function (entry)
                    {
                        if (entry.state === "pending")
                        {
                            sPend++;
                        }
                        else
                        {
                            sDone++;
                            foundItemsArray.push(entry);
                        }
                    })
                }

                toSend();

                // send items to the client
                res.send(sliced);
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
    messageModel.remove({_id: req.params.id}, function(del_item)
    {
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
        foundItemsArray = [];
        sliced = [];
    });
});

module.exports = taskRouter;