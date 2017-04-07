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
            // select page 1
            selectedPage = 1;
            draw();
            $('#showAll').addClass('control_selected');
            $('#showPending').removeClass('control_selected');
            $('#showCompleted').removeClass('control_selected');
        }



        // "SHOW PENDING ITEMS" FUNCTION
        function showPending ()
        {
            // show pending
            whatToShow = 1;
            // select page 1
            selectedPage = 1;
            draw();
            $('#showAll').removeClass('control_selected');
            $('#showPending').addClass('control_selected');
            $('#showCompleted').removeClass('control_selected');
        }



        // "SHOW COMPLETED ITEMS" FUNCTION
        function showCompleted ()
        {
            // show completed items
            whatToShow = 2;
            // select page 1
            selectedPage = 1;
            draw();
            $('#showAll').removeClass('control_selected');
            $('#showPending').removeClass('control_selected');
            $('#showCompleted').addClass('control_selected');
        }



        // "DRAW" FUNCTION: DRAW ITEMS DEPENDING ON WHAT TO DRAW
        function draw ()
        {
            // clear html
            $('#content_container').html("");

            // this array is used to store items with the right status
            var foundItemsArray = [];

            // count how many items are drawn
            var counter = 0;

            // show all items
            if (whatToShow === 0)
            {
                // how many items to show?
                itemsNumber = responseArray.length;
                // how many pages?
                pagesNumber = Math.ceil(itemsNumber / itemsPerPage);
                // show
                if (responseArray.length === 0)
                {
                    $('#content_container').html('<div class="message"><div class="mt">Nothing to show...</div></div>');
                }
                else
                {
                    // show itemsPerPage items on a page, depending on the selected page
                    for (var i = (selectedPage * itemsPerPage) - itemsPerPage; i < responseArray.length; i++)  // [*FOR*]
                    {
                        if (counter < itemsPerPage)
                        {
                            if (responseArray[i].state === "p")
                            {
                                $('#content_container').append('<div class="item" id="' + responseArray[i].id
                                    + '"><div class="checkbox" id="' + responseArray[i].id + '"></div><div class="content" id="'
                                    + responseArray[i].id + '">' + responseArray[i].value + '</div><div class="remove_item" id="'
                                    + responseArray[i].id + '"></div></div>');
                                counter++;
                            }
                            else
                            {
                                $('#content_container').append('<div class="item done" id="' + responseArray[i].id
                                    + '"><div class="checkbox checked" id="' + responseArray[i].id + '"></div><div class="content" id="'
                                    + responseArray[i].id + '">' + responseArray[i].value + '</div><div class="remove_item" id="'
                                    + responseArray[i].id + '"></div></div>');
                                counter++;
                            }
                        }
                        else
                        {
                            break;
                        }
                    }
                }
            }


            // show pending items
            if (whatToShow === 1)
            {
                // get items with the right status
                responseArray.forEach(function (item)
                {
                    if (item.state === "p")
                    {
                        foundItemsArray.push(item);
                    }
                });
                // how many items to show?
                itemsNumber = foundItemsArray.length;
                // just in case...
                pend = foundItemsArray.length;
                // how many pages?
                pagesNumber = Math.ceil(itemsNumber / itemsPerPage);
                // show
                if (foundItemsArray.length === 0)
                {
                    $('#content_container').html('<div class="message"><div class="mt">Nothing to show...</div></div>');
                }
                else
                {
                    // show itemsPerPage items on a page, depending on the selected page
                    for (var i = (selectedPage * itemsPerPage) - itemsPerPage; i < foundItemsArray.length; i++)  // [*FOR*]
                    {
                        if (counter < itemsPerPage)
                        {
                            $('#content_container').append('<div class="item" id="' + foundItemsArray[i].id
                                + '"><div class="checkbox" id="' + foundItemsArray[i].id + '"></div><div class="content" id="'
                                + foundItemsArray[i].id + '">' + foundItemsArray[i].value + '</div><div class="remove_item" id="'
                                + foundItemsArray[i].id + '"></div></div>');
                            counter++;
                        }
                        else
                        {
                            break;
                        }
                    }
                }
            }

            // show completed items
            if (whatToShow === 2)
            {
                // get items with the right status
                responseArray.forEach(function (item)
                {
                    if (item.state === "d")
                    {
                        foundItemsArray.push(item);
                    }
                });
                // how many items to show?
                itemsNumber = foundItemsArray.length;
                // just in case...
                done = foundItemsArray.length;
                // how many pages?
                pagesNumber = Math.ceil(itemsNumber / itemsPerPage);
                // show
                if (foundItemsArray.length === 0)
                {
                    $('#content_container').html('<div class="message"><div class="mt">Nothing to show...</div></div>');
                }
                else
                {
                    // show itemsPerPage items on a page, depending on the selected page
                    for (var i = (selectedPage * itemsPerPage) - itemsPerPage; i < foundItemsArray.length; i++)  // [*FOR*]
                    {
                        if (counter < itemsPerPage)
                        {
                            $('#content_container').append('<div class="item done" id="' + foundItemsArray[i].id
                                + '"><div class="checkbox checked" id="' + foundItemsArray[i].id + '"></div><div class="content" id="'
                                + foundItemsArray[i].id + '">' + foundItemsArray[i].value + '</div><div class="remove_item" id="'
                                + foundItemsArray[i].id + '"></div></div>');
                            counter++;
                        }
                        else
                        {
                            break;
                        }
                    }
                }
            }
            navigation();
            stats();
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
                    }
                    else
                    {
                        item.state = "d";
                        newState = "d";
                        $(this).parent('div').addClass('done');
                        $(this).addClass('checked');
                        pend--;
                        done++;
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
            // redraw
            draw();
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
                // redraw
                draw();
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
            // redraw
            draw();
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
            // clear array
            responseArray = [];
            // redraw
            draw();
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

                $('#item_value').val("").focus();
                itemID++;
                pend++;

                // redraw
                draw();
            }
        }



        // "PAGINATION" FUNCTION (PAGE NUMBER CLICK)
        function pagination ()
        {
            // get ID of the selected page
            selectedPage = $(this).attr('id');

            draw();
        }
        // "NAVIGATION" FUNCTION (SHOWS NAVIGATION PANEL)
        function navigation ()
        {
            // re-count items / pages in case of deletion / status change
            switch (whatToShow)
            {
                case 0:
                    itemsNumber = pend + done;
                    pagesNumber = Math.ceil(itemsNumber / itemsPerPage);
                    break;
                case 1:
                    itemsNumber = pend;
                    pagesNumber = Math.ceil(itemsNumber / itemsPerPage);
                    break;
                case 2:
                    itemsNumber = done;
                    pagesNumber = Math.ceil(itemsNumber / itemsPerPage);
                    break;
                default:
                    alert("Something's wrong... I can feel it!")
            }
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
                    showAll()
                }
                else
                {
                    // set itemID
                    itemID = Math.max.apply(Math,responseArray.map(function(o){return o.id;})) + 1;
                    // count pending / done
                    responseArray.forEach(function (item)
                    {
                        if (item.state === "p")
                        {
                            pend++;
                        }
                        else
                        {
                            done++;
                        }
                    });
                    showAll()
                }
            });
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