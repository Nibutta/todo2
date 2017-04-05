$(document).ready(
    function () {
        //*****************************************************************************************
        // VARS ON STARTUP
        //*****************************************************************************************
        var responseArray = []; // array for items (response from db)

        var itemState = "p";    // default item state p = pending, d = done
        var itemID = 0;         // IDs start with 0 (also this is the number of overall added items)
        var itemValue = "";     // item value is empty on load

        var done = 0;           // done tasks
        var pend = 0;           // pending tasks
        var whatToShow = 0;     // what to show -> show status: 0 = all, 1 = pending, 2 = done

        var itemsPerPage = 3;   // number of items on page
        var selectedPage = 1;   // selected page
        var pagesNumber = 1;    // number of pages on startup
        var itemsNumber = 0;    // how many items to show

        //*****************************************************************************************
        // FUNCTIONS
        //*****************************************************************************************
        // "SHOW STATS" FUNCTION
        function stats () {
            $('#pending').html('Pending: ' + pend);
            $('#completed').html('Completed: ' + done);
        }



        // "SHOW ALL ITEMS" FUNCTION
        function showAll ()
        {
            // show everything
            whatToShow = 0;
            // clear html
            $('#content_container').html("");
            // send "GET" to DB, receive array of objects and save it to the local array
            $.ajax({
                url: "tasks/",
                method: "GET"
            }).then(function (res) {
                console.log("res", res);
                // write response to the array
                responseArray = res;
                if (responseArray.length === 0)
                {
                    $('#content_container').html('<div class="item"><div class="content">Nothing to show...</div></div>');
                }
                else
                {
                    responseArray.forEach(function (item)
                    {
                        $('#content_container').append('<div class="item" id="' + item.id
                            + '"><div class="checkbox" id="' + item.id + '"></div><div class="content" id="'
                            + item.id + '">ID: ' + item.id + ' VALUE: ' + item.value + ' STATE: ' + item.state
                            + '</div><div class="remove_item" id="' + item.id + '"></div></div>');
                    });
                }
            });
            // clear array
            responseArray = [];
            // show stats
            stats();
        }



        // "SHOW PENDING ITEMS" FUNCTION
        function showPending ()
        {
            // show pending
            whatToShow = 1;
            // clear html
            $('#content_container').html("");
            // send "GET" to DB, receive array of objects and save it to the local array
            $.ajax({
                url: "tasks/pending",
                method: "GET"
            }).then(function (res) {
                console.log("res", res);
                responseArray = res;
                pend = responseArray.length;
                if (responseArray.length === 0)
                {
                    $('#content_container').html('<div class="item"><div class="content">Nothing to show...</div></div>');
                }
                else
                {
                    responseArray.forEach(function (item)
                    {
                        $('#content_container').append('<div class="item" id="' + item.id
                            + '"><div class="checkbox" id="' + item.id + '"></div><div class="content" id="'
                            + item.id + '">ID: ' + item.id + ' VALUE: ' + item.value + ' STATE: ' + item.state
                            + '</div><div class="remove_item" id="' + item.id + '"></div></div>');
                    });
                }
            });
            // clear array
            responseArray = [];
            // show stats
            stats();
        }



        // "GET COMPLETED ITEMS" FUNCTION
        function showCompleted ()
        {
            // show completed
            whatToShow = 2;
            // clear html
            $('#content_container').html("");
            // send "GET" to DB, receive array of objects and save it to the local array
            $.ajax({
                url: "tasks/completed",
                method: "GET"
            }).then(function (res) {
                console.log("res", res);
                responseArray = res;
                done = responseArray.length;
                if (responseArray.length === 0)
                {
                    $('#content_container').html('<div class="item"><div class="content">Nothing to show...</div></div>');
                }
                else
                {
                    responseArray.forEach(function (item)
                    {
                        $('#content_container').append('<div class="item" id="' + item.id
                            + '"><div class="checkbox" id="' + item.id + '"></div><div class="content" id="'
                            + item.id + '">ID: ' + item.id + ' VALUE: ' + item.value + ' STATE: ' + item.state
                            + '</div><div class="remove_item" id="' + item.id + '"></div></div>');
                    });
                }
            });
            // clear array
            responseArray = [];
            // show stats
            stats();
        }



        // "CHANGE STATUS" FUNCTION
        function changeStatus ()
        {
            // get ID of the selected item
            var selectedID = $(this).attr('id');
        }



        // "REMOVE ITEM" FUNCTION
        function killItem ()
        {
            // get ID of the selected item
            var selectedID = $(this).attr('id');
        }



        // "CLEAR ALL" FUNCTION
        function clearAll ()
        {
            $('#content_container').html('<div class="item"><div class="content">All cleared!</div></div>');
            $.ajax({
                url     : "tasks/clear",
                method  : "GET"
            }).then(function(res) {
                console.log("res", res);
            });
            itemID = 0;
            pend = 0;
            done = 0;
            // clear array (just in case...)
            responseArray = [];
            // show stats
            stats();
        }



        // "ADD ITEM" FUNCTION
        function addItem () {
            itemValue = $('#item_value').val();

            // send item to the ARC
            $.ajax({
                url     : "tasks/create",
                method  : "POST",
                data    : { id: itemID, state: itemState, value: itemValue }
            }).then(function(res)
            {
                console.log("res", res)
            });

            showAll();

            $('#item_value').val("").focus();
            itemID++;

            stats();
        }



        // "START UP" FUNCTION
        function start () {
            // show mode: all
            whatToShow = 0;
            selectedPage = 1;
            // clear html
            $('#content_container').html("");
            // send "GET" to DB, receive array of objects and save it to the local array
            $.ajax({
                url: "tasks/",
                method: "GET"
            }).then(function (res) {
                console.log("res", res);
                // write response to the array
                responseArray = res;
                if (responseArray.length === 0)
                {
                    $('#content_container').html('<div class="item"><div class="content">Nothing to show...</div></div>');
                }
                else
                {
                    responseArray.forEach(function (item)
                    {
                        // draw this shi--
                        $('#content_container').append('<div class="item" id="' + item.id
                            + '"><div class="checkbox" id="' + item.id + '"></div><div class="content" id="'
                            + item.id + '">ID: ' + item.id + ' VALUE: ' + item.value + ' STATE: ' + item.state
                            + '</div><div class="remove_item" id="' + item.id + '"></div></div>');
                        // get pending / done numbers
                        if (item.state === "p")
                        {
                            pend++;
                        }
                        else
                        {
                            done++;
                        }
                    });
                }
            });
            // clear array
            responseArray = [];
            // show stats
            stats();
        }

        start();

        //*****************************************************************************************
        // BUTTONS / INTERACTIONS
        //*****************************************************************************************
        // add item to the list
        $('#addButton').click(addItem);
        $('#item_value').keyup(function (e)
        {
            if (e.keyCode === 13)
            {
                addItem();
            }
        });

        // show all items (entries)
        $('#showAll').click(showAll);

        // show pending items (entries)
        $('#showPending').click(showPending);

        // show completed items (entries)
        $('#showCompleted').click(showCompleted);

        // clear all items (entries)
        $('#clearButton').click(clearAll);

        // state change
        $('#content_container > .item > .checkbox').click(changeStatus);

        // remove item
        $('#content_container > .item > .remove_item').click(killItem);
    });