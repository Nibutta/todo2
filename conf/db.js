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

    if (foundItemsArray.length !== 0)
    {
        // get what to send
        sliced = foundItemsArray.slice(startpoint, startpoint + itemsPerPage);
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
        // localhost:3000/api/byid/:id
        // localhost:3000/api/todos?page=3&status=pennding
        // req.params.id = 123
        // req.query.page = '3'
        // req.query.status = 'pending'

        foundItemsArray = [];
        sliced = [];

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
            messageModel.find({state: "p"}, function (err, found)
            {
                if (err) res.send(err);
                foundItemsArray = found;
                // RECOUNT
                if (foundItemsArray.length === 0)
                {
                    ipend = 0;
                }
                else
                {
                    ipend = foundItemsArray.length;
                }

                toSend();

                // send items to the client
                res.send(sliced);
            });
        }

        if (whatToSend === 2)
        {
            messageModel.find({state: "d"}, function (err, found)
            {
                if (err) res.send(err);
                foundItemsArray = found;
                // RECOUNT
                if (foundItemsArray.length === 0)
                {
                    idone = 0;
                }
                else
                {
                    idone = foundItemsArray.length;
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
//******************************************************************
// UPDATE ITEM STATUS
taskRouter.post('/update', function(req, res, next)
{
    messageModel.findOneAndUpdate({_id: req.body._id}, {state: req.body.state}, function(upd_item)
    {
        res.send(upd_item);
        console.log("--> ITEM STATUS UPDATED, ID: ", req.body._id);
        console.log("                 NEW STATUS: ", req.body.state);
    });
});
//******************************************************************
// DELETE ITEM
taskRouter.post('/delete/:id', function(req, res, next)
{
    itemModel.remove({id: req.params.id}, function(del_item)
    {
        res.send(del_item);
        console.log("--> ITEM DELETED, ID: ", req.params.id);
    });
});
//******************************************************************
// SEND PENDING ITEMS (when "Show pending" is clicked)
taskRouter.get('/pending', function(req, res, next)
{
    messageModel.find({state: "p"}, function (err, foundItemsArray)
    {
        if (err) res.send(err);
        res.send(foundItemsArray);
        console.log("--> SEND ITEMS (PENDING)");
    });
});
//******************************************************************
// SEND COMPLETED ITEMS (when "Show pending" is clicked)
taskRouter.get('/completed', function(req, res, next)
{
    messageModel.find({state: "d"}, function (err, foundItemsArray)
    {
        if (err) res.send(err);
        res.send(foundItemsArray);
        console.log("--> SEND ITEMS (COMPLETED)");
    });
});

module.exports = taskRouter;