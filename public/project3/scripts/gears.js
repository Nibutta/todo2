$(document).ready(
    function () {
        //*****************************************************************************************
        // VARS ON STARTUP
        //*****************************************************************************************
        var responseArray = []; // array for items (response from db)

        var itemState = "p";    // default item state p = pending, d = done
        var itemValue = "";     // item value is empty on load

        var done = 0;           // done tasks
        var pend = 0;           // pending tasks
        var whatToShow = 0;     // what to show -> show status: 0 = all, 1 = pending, 2 = done

        var itemsPerPage = 5;   // number of items on page
        var selectedPage = 1;   // selected page
        var pagesNumber = 1;    // number of pages on startup
        var itemsNumber = 0;    // how many items to show

        var link = "";          // set url link for AJAX GET
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
            // send "GET" to DB, receive array of objects
            $.ajax({
                url: link,
                method: "GET"
            }).then(function (res) {
                console.log("res", res);
                // write response to the array
                responseArray = res;
                if (responseArray.length !== 0)
                {
                    pend = responseArray[0].pendN;
                    done = responseArray[0].doneN;
                    // how many items in DB
                    itemsNumber = pend + done;
                    // how many pages?
                    pagesNumber = Math.ceil(itemsNumber / itemsPerPage);
                }
                else
                {
                    pend = 0;
                    done = 0;
                    // how many items in DB
                    itemsNumber = 0;
                    // how many pages?
                    pagesNumber = 1;
                }
                draw();
            });
            $('#showAll').addClass('control_selected');
            $('#showPending').removeClass('control_selected');
            $('#showCompleted').removeClass('control_selected');
        }
        // "SHOW PENDING ITEMS" FUNCTION
        function showPending ()
        {
            // show pending
            whatToShow = 1;
            // send "GET" to DB, receive array of objects
            $.ajax({
                url: link,
                method: "GET"
            }).then(function (res) {
                console.log("res", res);
                // write response to the array
                responseArray = res;
                if (responseArray.length !== 0)
                {
                    pend = responseArray[0].pendN;
                    done = responseArray[0].doneN;
                    // how many pages?
                    pagesNumber = Math.ceil(pend / itemsPerPage);
                }
                else
                {
                    pend = 0;
                    // how many items in DB
                    itemsNumber = 0;
                    // how many pages?
                    pagesNumber = 1;
                }
                draw();
            });
            $('#showAll').removeClass('control_selected');
            $('#showPending').addClass('control_selected');
            $('#showCompleted').removeClass('control_selected');
        }
        // "SHOW COMPLETED ITEMS" FUNCTION
        function showCompleted ()
        {
            // show completed items
            whatToShow = 2;
            // send "GET" to DB, receive array of objects
            $.ajax({
                url: link,
                method: "GET"
            }).then(function (res) {
                console.log("res", res);
                // write response to the array
                responseArray = res;
                if (responseArray.length !== 0)
                {
                    pend = responseArray[0].pendN;
                    done = responseArray[0].doneN;
                    // how many pages?
                    pagesNumber = Math.ceil(done / itemsPerPage);
                }
                else
                {
                    done = 0;
                    // how many items in DB
                    itemsNumber = 0;
                    // how many pages?
                    pagesNumber = 1;
                }
                draw();
            });
            $('#showAll').removeClass('control_selected');
            $('#showPending').removeClass('control_selected');
            $('#showCompleted').addClass('control_selected');
        }



        // "DRAW" FUNCTION: DRAW ITEMS DEPENDING ON WHAT TO DRAW
        function draw ()
        {
            // clear html
            $('#content_container').html("");
            // show
            if (responseArray.length === 0)
            {
                $('#content_container').html('<div class="message"><div class="mt">Nothing to show...</div></div>');
            }
            else
            {
                // show itemsPerPage items on a page, depending on the selected page
                for (var i = 0; i < responseArray.length; i++)  // [*FOR*]
                {
                    if (responseArray[i].state === "p")
                    {
                        $('#content_container').append('<div class="item" id="' + responseArray[i]._id
                            + '"><div class="checkbox" id="' + responseArray[i]._id + '"></div><div class="content" id="'
                            + responseArray[i]._id + '">' + responseArray[i].value + '</div><div class="remove_item" id="'
                            + responseArray[i]._id + '"></div></div>');
                    }
                    else
                    {
                        $('#content_container').append('<div class="item done" id="' + responseArray[i]._id
                            + '"><div class="checkbox checked" id="' + responseArray[i]._id + '"></div><div class="content" id="'
                            + responseArray[i]._id + '">' + responseArray[i].value + '</div><div class="remove_item" id="'
                            + responseArray[i]._id + '"></div></div>');
                    }
                }
            }
            navigation();
            stats();
        }



        // "SHOW"
        function show ()
        {
            switch (whatToShow)
            {
                case 0:
                    link = "tasks?page=" + String(selectedPage);
                    showAll();
                    break;
                case 1:
                    link = "tasks?status=pending&page=" + String(selectedPage);
                    showPending();
                    break;
                case 2:
                    link = "tasks?status=completed&page=" + String(selectedPage);
                    showCompleted();
                    break;
                default:
                    link = "tasks?page=" + String(selectedPage);
                    showAll();
            }
        }



        // "CHANGE STATUS" FUNCTION // todo
        function changeStatus ()
        {
            // get ID of the selected item
            var selectedID = String($(this).attr('id'));
            var newState = "";
            responseArray.forEach(function (item)
            {
                if(item._id === selectedID)
                {
                    if (item.state === "d")
                    {
                        newState = "p";
                    }
                    else
                    {
                        newState = "d";
                    }
                }
            });
            // update database
            $.ajax({
                url     : "tasks/update",
                method  : "POST",
                data    : { _id: selectedID, state: newState }
            }).then(function(res)
            {
                console.log("res", res)
            });
            // redraw
            show();
        }



        // "EDIT ITEM" FUNCTION // todo
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
                    var selectedID = String($(this).parent('div').attr('id'));
                    // changing html
                    $(this).replaceWith($('<div class="content" id="' + selectedID + '">' + $(this).val() + '</div>'));
                    newValue = $(this).val();
                    // applying new value to the array
                    responseArray.forEach(function (item, i)
                    {
                        if (item._id === selectedID)
                        {
                            responseArray[i].value = newValue;
                        }
                    });
                    // update database
                    $.ajax({
                        url     : "tasks/edit",
                        method  : "POST",
                        data    : { _id: selectedID, value: newValue }
                    }).then(function(res)
                    {
                        console.log("res", res)
                    });
                }
                // redraw
                draw();
            }
        }



        // "REMOVE ITEM" FUNCTION // todo
        function killItem ()
        {
            // get ID of the selected item
            var selectedID = String($(this).attr('id'));
            responseArray.forEach(function (item, i)
            {
                if (item._id === selectedID)
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
                data    : { _id: selectedID }
            }).then(function(res)
            {
                console.log("res", res)
            });
            // redraw
            draw();
        }



        // "CLEAR ALL" FUNCTION
        function clearAll ()
        {
            $.ajax({
                url     : "tasks/clear",
                method  : "GET"
            }).then(function(res) {
                console.log("res", res);
                pend = 0;
                done = 0;
                selectedPage = 1;
                // clear array
                responseArray = [];
                // redraw
                show();
            });
        }



        // "ADD ITEM" FUNCTION
        function addItem ()
        {
            if ($('#item_value').val() !== "")
            {
                // get value
                itemValue = $('#item_value').val();
                // send item to the ARC
                $.ajax({
                    url: "tasks/create",
                    method: "POST",
                    data: {state: itemState, value: itemValue}
                }).then(function (res)
                {
                    console.log("res", res);
                    pend++;
                    // redraw
                    show();
                });
                $('#item_value').val("").focus();
                //pend++;
            }
        }



        // "PAGINATION" FUNCTION (PAGE NUMBER CLICK)
        function pagination ()
        {
            // get ID of the selected page
            selectedPage = $(this).attr('id');

            show();
        }
        // "NAVIGATION" FUNCTION (SHOWS NAVIGATION PANEL)
        function navigation ()
        {
            switch (whatToShow)
            {
                case 0:
                    itemsNumber = pend + done;
                    break;
                case 1:
                    itemsNumber = pend;
                    break;
                case 2:
                    itemsNumber = done;
                    break;
                default:
                    itemsNumber = pend + done;
            }
            pagesNumber = Math.ceil(itemsNumber / itemsPerPage);

            if (pagesNumber < 1)
            {
                pagesNumber = 1;
                $('#navigation_block').html('<div class="pageN" id="1">' + pagesNumber + '</div>');
            }
            else
            {
                $('#navigation_block').html("");
                for (var i = 1; i <= pagesNumber; i++)
                {
                    $('#navigation_block').append('<div class="pageN" id="' + i + '">' + i + '</div>');
                }
            }
            $('#navigation_block > div.pageN').removeClass('selectedN');
            $('#navigation_block').find('div').eq(selectedPage - 1).addClass('selectedN');
        }



        // "START UP" FUNCTION
        function start ()
        {
            // show everything
            whatToShow = 0;
            // select page 1
            selectedPage = 1;
            // form link
            link = "tasks?page=1";
            show();
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

        // "SHOW ALL" CLiCK
        $('#showAll').click(function ()
        {
            // show everything
            whatToShow = 0;
            // select page 1
            selectedPage = 1;
            // form link
            link = "tasks?page=1";
            showAll();
        });

        // "SHOW PENDING" CLiCK
        $('#showPending').click(function ()
        {
            // show everything
            whatToShow = 1;
            // select page 1
            selectedPage = 1;
            // form link
            link = "tasks?page=1&status=pending";
            showPending();
        });

        // "SHOW COMPLETED" CLiCK
        $('#showCompleted').click(function()
        {
            // show everything
            whatToShow = 2;
            // select page 1
            selectedPage = 1;
            // form link
            link = "tasks?page=1&status=completed";
            showCompleted();
        });

        // clear all items (entries)
        $('#clearButton').click(clearAll);

        // page number click
        $('#navigation_block').on('click', '.pageN', pagination);

        // state change
        $('#content_container').on('click', '.item > .checkbox', changeStatus);

        // edit item value
        $('#content_container').on('dblclick', '.item > .content', editValue);

        // apply item value changes on ENTER
        $('#content_container').on('keydown', '.item > .editItem', applyValue);

        // remove item
        $('#content_container').on('click', '.item > .remove_item', killItem);
    });