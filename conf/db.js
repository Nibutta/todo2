// mongoose
var mongoose = require('mongoose');

// connect to db
    mongoose.connect('mongodb://localhost/data', function () {
    console.log('--> CONNECTED TO DATABASE');
});

// schema
var messageSchema = mongoose.Schema({
         id:    Number
    , value:    String
    , state:    String
     , page:    Number
     , qnty:    Number});

var itemsPerPage = 5;   // number of items on page
var selectedPage = 1;   // selected page
var pagesNumber = 1;    // number of pages on startup
var itemsNumber = 0;    // how many items to show

var whatToSend = 0;     // 0 == send all, 1 == send pending, 2 == send completed
var foundItemsArray = [];
var startpoint = 0;
var sliced = [];
// model
var messageModel = mongoose.model('messageModel', messageSchema);

// item
var message = new messageModel({id: 0, value: "text", state: "p", page: 1, qnty: 0});

var express = require('express');
var taskRouter = express.Router();

// "TO SEND" FUNCTION
function toSend()
{
    // set point in array
    startpoint = (selectedPage * itemsPerPage) - itemsPerPage;

    // get the number of items in db
    itemsNumber = foundItemsArray.length;

    // count how many pages
    pagesNumber = Math.ceil(itemsNumber / itemsPerPage);

    // get what to send
    sliced = foundItemsArray.slice(startpoint, startpoint + itemsPerPage);

    console.log("--> SENDING ITEMS TO CLIENT: ", + sliced.length);
    console.log("                FOUND ITEMS: ", + itemsNumber);
    console.log("                     STATUS: ", + whatToSend);
    console.log("                       PAGE: ", + selectedPage);
    console.log("                 STARTPOINT: ", + startpoint);
}
//******************************************************************
// SEND ALL ITEMS (when "Show all" is clicked)
taskRouter.get('/', function(req, res, next)
    {
        // localhost:3000/api/byid/:id
        // localhost:3000/api/todos?page=3&status=pennding
        // req.params.id = 123
        // req.query.page = '3'
        // req.query.status = 'pending'

        // set selected page
        if ((req.query.page === "") || (isNaN(req.query.page) === true))
        {
            console.log("--> WRONG PAGE, SET PAGE TO 1");
            selectedPage = 1;
        }
        else
        {
            selectedPage = +req.query.page;
        }

        // choose what to send
        if (req.query.status === "")
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
                    console.log("--> WRONG STATUS, SENDING ALL")
                }
            }
        }

        if (whatToSend === 0)
        {
            messageModel.find({}, function (err, found)
            {
                if (err) res.send(err);
                foundItemsArray = found;

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
    var item = new messageModel(req.body);

    item.save(function(saved_item)
    {
        res.send(saved_item);
        console.log("--> CREATED NEW ITEM, ID: ", req.body.id);
        console.log("                   VALUE: ", req.body.value);
    });
});
//******************************************************************
// SEND PENDING ITEMS (when "Show pending" is clicked)
taskRouter.get('/pending', function(req, res, next)
{
    itemModel.find({state: "p"}, function (err, foundItemsArray)
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
    itemModel.find({state: "d"}, function (err, foundItemsArray)
    {
        if (err) res.send(err);
        res.send(foundItemsArray);
        console.log("--> SEND ITEMS (COMPLETED)");
    });
});
//******************************************************************
// UPDATE ITEM STATUS
taskRouter.post('/update', function(req, res, next)
{
    messageModel.findOneAndUpdate({id: req.body.id}, {state: req.body.state}, function(upd_item)
    {
        res.send(upd_item);
        console.log("--> ITEM STATUS UPDATED, ID: ", req.body.id);
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
        messageModel.remove({}, function (err, items)
        {
            if (err) res.send(err);
            res.send(items);  // send back empty array --- optional
            console.log("--> DATABASE CLEARED!");
        });
    });

module.exports = taskRouter;