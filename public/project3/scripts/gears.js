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

        var itemsPerPage = 5;   // number of items on page
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

            if (responseArray.length === 0)
            {
                $('#content_container').html('<div class="message"><div class="mt">Nothing to show...</div></div>');
            }
            else
            {
                responseArray.forEach(function (item)
                {
                    if (item.state === "p")
                    {
                        $('#content_container').append('<div class="item" id="' + item.id
                            + '"><div class="checkbox" id="' + item.id + '"></div><div class="content" id="'
                            + item.id + '">' + item.value + '</div><div class="remove_item" id="' + item.id
                            + '"></div></div>');
                    }
                    else
                    {
                        $('#content_container').append('<div class="item done" id="' + item.id
                            + '"><div class="checkbox checked" id="' + item.id + '"></div><div class="content" id="'
                            + item.id + '">' + item.value + '</div><div class="remove_item" id="' + item.id
                            + '"></div></div>');
                    }
                });
                // show stats
                stats();
            }
            $('#showAll').addClass('control_selected');
            $('#showPending').removeClass('control_selected');
            $('#showCompleted').removeClass('control_selected');
        }



        // "SHOW PENDING ITEMS" FUNCTION
        function showPending ()
        {
            // show pending
            whatToShow = 1;
            // clear html
            $('#content_container').html("");
            // this array is used to store items with the right status
            var foundItemsArray = [];
            // get items with the right status
            responseArray.forEach(function (item)
            {
                if (item.state === "p")
                {
                    foundItemsArray.push(item);
                }
            });
            if (foundItemsArray.length === 0)
            {
                $('#content_container').html('<div class="message"><div class="mt">Nothing to show...</div></div>');
            }
            else
            {
                foundItemsArray.forEach(function (item)
                {
                    $('#content_container').append('<div class="item" id="' + item.id
                        + '"><div class="checkbox" id="' + item.id + '"></div><div class="content" id="'
                        + item.id + '">' + item.value + '</div><div class="remove_item" id="' + item.id
                        + '"></div></div>');
                });
                // show stats
                stats();
            }
            $('#showAll').removeClass('control_selected');
            $('#showPending').addClass('control_selected');
            $('#showCompleted').removeClass('control_selected');
        }



        // "SHOW COMPLETED ITEMS" FUNCTION
        function showCompleted ()
        {
            // show completed
            whatToShow = 2;
            // clear html
            $('#content_container').html("");
            // this array is used to store items with the right status
            var foundItemsArray = [];
            // get items with the right status
            responseArray.forEach(function (item)
            {
                if (item.state === "d")
                {
                    foundItemsArray.push(item);
                }
            });
            if (foundItemsArray.length === 0)
            {
                $('#content_container').html('<div class="message"><div class="mt">Nothing to show...</div></div>');
            }
            else
            {
                foundItemsArray.forEach(function (item)
                {
                    $('#content_container').append('<div class="item done" id="' + item.id
                        + '"><div class="checkbox checked" id="' + item.id + '"></div><div class="content" id="'
                        + item.id + '">' + item.value + '</div><div class="remove_item" id="' + item.id
                        + '"></div></div>');
                });
                // show stats
                stats();
            }
            $('#showAll').removeClass('control_selected');
            $('#showPending').removeClass('control_selected');
            $('#showCompleted').addClass('control_selected');
        }



        // "DRAW" FUNCTION: DRAW ITEMS DEPENDING ON WHAT TO DRAW
        function draw ()
        {
            switch (whatToShow)
            {
                case 0:
                    showAll();
                    break;
                case 1:
                    showPending();
                    break;
                case 2:
                    showCompleted();
                    break;
                default:
                    alert("Something's wrong... I can feel it!")
            }
        }



        // "CHANGE STATUS" FUNCTION
        function changeStatus ()
        {
            // get ID of the selected item
            var selectedID = $(this).attr('id');
            var newState = "";
            responseArray.forEach(function (item)
            {
                if(item.id === +selectedID)
                {
                    if (item.state === "d")
                    {
                        item.state = "p";
                        newState = "p";
                        $(this).parent('div').removeClass('done');
                        $(this).removeClass('checked');
                        pend++;
                        done--;
                        // remove from html if show status is wrong
                        if (whatToShow === 2)
                        {
                            $(this).parent('div').remove();
                        }
                        draw();
                    }
                    else
                    {
                        item.state = "d";
                        newState = "d";
                        $(this).parent('div').addClass('done');
                        $(this).addClass('checked');
                        pend--;
                        done++;
                        // remove from html if show status is wrong
                        if (whatToShow === 1)
                        {
                            $(this).parent('div').remove();
                        }
                        draw();
                    }
                }
            });
            // update database
            $.ajax({
                url     : "tasks/update",
                method  : "POST",
                data    : { id: selectedID, state: newState }
            }).then(function(res)
            {
                console.log("res", res)
            });
            // show stats
            stats();
        }



        // "EDIT ITEM" FUNCTION
        function editValue ()
        {
            var thisData = $(this).html(), $el = $('<input type="text" class="editItem"/>');
            $(this).replaceWith($el);
            $el.val(thisData).focus();
        }
        // "APPLY NEW VALUE" FUNCTION, WORKS WHILE "EDIT ITEM" IS ACTIVE [***]
        function applyValue (e)
        {
            var newValue = "";
            // if ENTER is pressed
            if (e.keyCode === 13)
            {
                if ($(this).val() !== "")
                {
                    //get ID of the selected item
                    var selectedID = $(this).parent('div').attr('id');
                    // changing html
                    $(this).replaceWith($('<div class="content" id="' + selectedID + '">' + $(this).val() + '</div>'));
                    newValue = $(this).val();
                    // applying new value to the array
                    responseArray.forEach(function (item, i)
                    {
                        if (item.id === +selectedID)
                        {
                            responseArray[i].value = newValue;
                        }
                    });
                    // update database
                    $.ajax({
                        url     : "tasks/edit",
                        method  : "POST",
                        data    : { id: selectedID, value: newValue }
                    }).then(function(res)
                    {
                        console.log("res", res)
                    });
                }
            }
        }



        // "REMOVE ITEM" FUNCTION
        function killItem ()
        {
            // get ID of the selected item
            var selectedID = $(this).attr('id');
            responseArray.forEach(function (item, i)
            {
                if (item.id === +selectedID)
                {
                    if (item.state === "p")
                    {
                        pend--;
                        responseArray.splice(i, 1);
                    }
                    if (item.state === "d")
                    {
                        done--;
                        responseArray.splice(i, 1);
                    }
                }
            });
            // update database
            $.ajax({
                url     : "tasks/delete",
                method  : "POST",
                data    : { id: selectedID }
            }).then(function(res)
            {
                console.log("res", res)
            });
            // remove from html
            //$(this).parent('div').remove();
            draw();
            // show stats
            stats();
        }



        // "CLEAR ALL" FUNCTION
        function clearAll ()
        {
            $('#content_container').html('<div class="message"><div class="mt">All cleared!</div></div>');
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
        function addItem ()
        {
            if ($('#item_value').val() !== "")
            {
                itemValue = $('#item_value').val();

                var task = {id: itemID, state: itemState, value: itemValue};

                // push item to the array of objects
                responseArray.push(task);

                // send item to the ARC
                $.ajax({
                    url: "tasks/create",
                    method: "POST",
                    data: {id: itemID, state: itemState, value: itemValue}
                }).then(function (res) {
                    console.log("res", res)
                });

                draw();

                $('#item_value').val("").focus();
                itemID++;
                pend++;
                stats();
            }
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
                    $('#content_container').html('<div class="message"><div class="mt">Nothing to show...</div></div>');
                    stats();
                }
                else
                {
                    // set itemID
                    itemID = Math.max.apply(Math,responseArray.map(function(o){return o.id;})) + 1;
                    responseArray.forEach(function (item)
                    {
                        if (item.state === "p")
                        {
                            // draw this shi--
                            $('#content_container').append('<div class="item" id="' + item.id
                                + '"><div class="checkbox" id="' + item.id + '"></div><div class="content" id="'
                                + item.id + '">' + item.value + '</div><div class="remove_item" id="' + item.id
                                + '"></div></div>');
                            pend++;
                        }
                        else
                        {
                            $('#content_container').append('<div class="item done" id="' + item.id
                                + '"><div class="checkbox checked" id="' + item.id + '"></div><div class="content" id="'
                                + item.id + '">' + item.value + '</div><div class="remove_item" id="' + item.id
                                + '"></div></div>');
                            done++;
                        }
                    });
                    // show stats
                    stats();
                }
            });
            $('#showAll').addClass('control_selected');
            $('#showPending').removeClass('control_selected');
            $('#showCompleted').removeClass('control_selected');
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
        $('#content_container').on('click', '.item > .checkbox', changeStatus);

        // edit item value
        $('#content_container').on('click', '.item > .content', editValue);

        // apply item value changes on ENTER
        $('#content_container').on('keydown', '.item > .editItem', applyValue);

        // remove item
        $('#content_container').on('click', '.item > .remove_item', killItem);
    });