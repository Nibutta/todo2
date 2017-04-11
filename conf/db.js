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

var whatToSend = 0;     // 0 == send all, 1 == send pending, 2 == send completed
var foundItemsArray = [];

var startpoint = 0;
var sliced = [];

var ipend = 0;
var idone = 0;

// model
var messageModel = mongoose.model('messageModel', messageSchema);

// item
var message = new messageModel({value: "text", state: "p", pendN: 0, doneN: 0});

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
        sliced[0].pendN = ipend;     // set number of pending items
        sliced[0].doneN = idone;     // set number of completed items
    }

    console.log("--> SENDING ITEMS TO CLIENT: ", + sliced.length);
    console.log("                FOUND ITEMS: ", + itemsNumber);
    console.log("                     STATUS: ", + whatToSend);
    console.log("                       PAGE: ", + selectedPage);
    console.log("    -----------------------");
    console.log("                       PEND: ", + ipend);
    console.log("                       DONE: ", + idone);
}
//******************************************************************
// SENDING ITEMS
taskRouter.get('/', function(req, res, next)
    {
        foundItemsArray = [];
        sliced = [];
        var parseRes = [];

        // set selected page
        if ((req.query.page === "") || (isNaN(req.query.page) === true))
        {
            console.log("--> PAGE = ?, SETTING PAGE TO 1...");
            selectedPage = 1;
        }
        else
        {
            selectedPage = +req.query.page;
        }

        // choose what to send
        if (req.query.status === "all")
        {
            whatToSend = 0; // send all
        }
        else
        {
            if (req.query.status === "pending")
            {
                whatToSend = 1; // send pending
            }
            else
            {
                if (req.query.status === "completed")
                {
                    whatToSend = 2; // send completed
                }
                else
                {
                    whatToSend = 0; // send all
                    console.log("--> STATUS = ?, SENDING ALL...")
                }
            }
        }

        if (whatToSend === 0)
        {
            messageModel.find({}, function (err, found)
            {
                if (err) res.send(err);
                foundItemsArray = found;
                // RECOUNT
                if (foundItemsArray.length === 0)
                {
                    ipend = 0;
                    idone = 0;
                }
                else
                {
                    ipend = 0;
                    idone = 0;
                    foundItemsArray.forEach(function (entry)
                    {
                        if (entry.state === "p")
                        {
                            ipend++;
                        }
                        else
                        {
                            idone++;
                        }
                    })
                }

                toSend();

                // send items to the client
                res.send(sliced);
            });
        }

        if (whatToSend === 1)
        {
            messageModel.find({}, function (err, found)
            {
                if (err) res.send(err);
                parseRes = found;
                // RECOUNT
                if (parseRes.length === 0)
                {
                    ipend = 0;
                    idone = 0;
                }
                else
                {
                    ipend = 0;
                    idone = 0;
                    parseRes.forEach(function (entry)
                    {
                        if (entry.state === "p")
                        {
                            ipend++;
                            foundItemsArray.push(entry);
                        }
                        else
                        {
                            idone++;
                        }
                    })
                }

                toSend();

                // send items to the client
                res.send(sliced);
            });
        }

        if (whatToSend === 2)
        {
            messageModel.find({}, function (err, found)
            {
                if (err) res.send(err);
                parseRes = found;
                // RECOUNT
                if (parseRes.length === 0)
                {
                    ipend = 0;
                    idone = 0;
                }
                else
                {
                    ipend = 0;
                    idone = 0;
                    parseRes.forEach(function (entry)
                    {
                        if (entry.state === "p")
                        {
                            ipend++;
                        }
                        else
                        {
                            idone++;
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
    var itemValue = req.body.value;
    var itemState = req.body.state;

    var item = new messageModel({value: itemValue, state: itemState});

    item.save(function(saved_item)
    {
        res.send(saved_item);
        console.log("--> CREATED NEW ITEM!");
        console.log("               VALUE: ", itemValue);
    });
});
//******************************************************************
// CHANGE ITEM STATUS
taskRouter.put('/check/:id', function(req, res, next)
{
    messageModel.findById(req.params.id, function(err, item)
    {
        if (err) res.send(err);
        item.state = req.body.state;
        item.save(function (err, saved)
        {
            if (err) res.send(err);
            res.send(saved);
        });

        console.log("--> ITEM STATE UPDATED, ID: ", req.params.id);
        console.log("                 NEW STATE: ", item.state);
    });
});
//******************************************************************
// EDIT ITEM
taskRouter.put('/edit/:id', function(req, res, next)
{
    messageModel.findById(req.params.id, function(err, item)
    {
        if (err) res.send(err);
        item.value = req.body.value;
        item.save(function (err, saved)
        {
            if (err) res.send(err);
        });
        res.send(item);
        console.log("--> ITEM VALUE UPDATED, ID: ", req.params.id);
        console.log("                 NEW VALUE: ", req.body.value);
    });
});
//******************************************************************
// DELETE ITEM
taskRouter.delete('/delete/:id', function(req, res, next)
{
    messageModel.remove({_id: req.params.id}, function(del_item)
    {
        res.send(del_item);
        console.log("--> ITEM DELETED, ID: ", req.params.id);
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
        console.log("--> DATABASE CLEARED!");
        foundItemsArray = [];
        sliced = [];
    });
});

module.exports = taskRouter;