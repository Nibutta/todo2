$(document).ready(
    function () {
        //*****************************************************************************************
        // VARS ON STARTUP
        //*****************************************************************************************
        var responseArray = []; // array for items (response from db)

        var itemState = "pending";    // default item state p = pending, d = done
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


        // "SHOW"
        function show ()
        {
            // form link
            switch (whatToShow)
            {
                case 0:
                    link = "tasks?page=" + String(selectedPage);
                    break;
                case 1:
                    link = "tasks?status=pending&page=" + String(selectedPage);
                    break;
                case 2:
                    link = "tasks?status=completed&page=" + String(selectedPage);
                    break;
                default:
                    link = "tasks?page=" + String(selectedPage);
            }

            // send "GET" to DB, receive an object
            $.ajax({
                url: link,
                method: "GET"
            }).then(function (res) {
                console.log("res", res);
                // write response to the array
                responseArray = res.items;
                pend = res.pendN;
                done = res.doneN;
                if (whatToShow === 0) itemsNumber = pend + done;
                if (whatToShow === 1) itemsNumber = pend;
                if (whatToShow === 2) itemsNumber = done;
                pagesNumber = Math.ceil(itemsNumber / itemsPerPage);
                if ((responseArray.length === 0) && (selectedPage !== 1))
                {
                    selectedPage--;
                    show();
                }
                // clear html
                $('#content_container').html("");
                // draw
                if (responseArray.length === 0)
                {
                    $('#content_container').html('<div class="message"><div class="mt">Nothing to show...</div></div>');
                }
                else
                {
                    // show itemsPerPage items on a page, depending on the selected page
                    responseArray.forEach(function (item)
                    {
                        if (item.state === "pending")
                        {
                            $('#content_container').append('<div class="item" id="' + item._id
                                + '"><div class="checkbox" id="' + item._id + '"></div><div class="content" id="'
                                + item._id + '">' + item.value + '</div><div class="remove_item" id="'
                                + item._id + '"></div></div>');
                        }
                        else
                        {
                            $('#content_container').append('<div class="item done" id="' + item._id
                                + '"><div class="checkbox checked" id="' + item._id + '"></div><div class="content" id="'
                                + item._id + '">' + item.value + '</div><div class="remove_item" id="'
                                + item._id + '"></div></div>');
                        }
                    });
                }
                navigation();
                stats();
            });
        }


        // "CHANGE STATUS" FUNCTION
        function changeStatus ()
        {
            var newState = "";
            // get ID of the selected item
            var selectedID = String($(this).attr('id'));
            responseArray.forEach(function (item)
            {
                if (item._id === selectedID)
                {
                    if (item.state === "pending")
                    {
                        newState = "completed";
                    }
                    else
                    {
                        newState = "pending";
                    }
                }
            });
            // update database
            $.ajax({
                url     : "tasks/check/" + String(selectedID),
                method  : "PUT",
                data    : { state: newState }
            }).then(function(res)
            {
                console.log("res", res);
                show();
            });
        }


        // "EDIT ITEM" FUNCTION
        function editValue ()
        {
            var thisData = $(this).html(), $el = $('<input type="text" class="editItem"/>');
            $(this).replaceWith($el);
            $el.val(thisData).focus();
        }


        // "APPLY NEW VALUE" FUNCTION, WORKS WHILE "EDIT ITEM" IS ACTIVE
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
                    // update database
                    $.ajax({
                        url     : "tasks/edit/" + String(selectedID),
                        method  : "PUT",
                        data    : { value: newValue }
                    }).then(function(res)
                    {
                        console.log("res", res);
                        show(); // this is optional
                    });
                }
            }
        }


        // "REMOVE ITEM" FUNCTION
        function killItem ()
        {
            // get ID of the selected item
            var selectedID = String($(this).attr('id'));
            // update database
            $.ajax({
                url     : "tasks/delete/" + String(selectedID),
                method  : "DELETE"
            }).then(function(res)
            {
                console.log("res", res);
            });
            show();
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
                    show();
                });
                $('#item_value').val("").focus();
            }
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
            show();
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

        // "SHOW ALL" CLiCK
        $('#showAll').click(function ()
        {
            // show everything
            whatToShow = 0;
            // select page 1
            selectedPage = 1;
            show();
            $('#showAll').addClass('control_selected');
            $('#showPending').removeClass('control_selected');
            $('#showCompleted').removeClass('control_selected');
        });

        // "SHOW PENDING" CLiCK
        $('#showPending').click(function ()
        {
            // show everything
            whatToShow = 1;
            // select page 1
            selectedPage = 1;
            show();
            $('#showAll').removeClass('control_selected');
            $('#showPending').addClass('control_selected');
            $('#showCompleted').removeClass('control_selected');
        });

        // "SHOW COMPLETED" CLiCK
        $('#showCompleted').click(function()
        {
            // show everything
            whatToShow = 2;
            // select page 1
            selectedPage = 1;
            show();
            $('#showAll').removeClass('control_selected');
            $('#showPending').removeClass('control_selected');
            $('#showCompleted').addClass('control_selected');
        });

        // clear all items (entries)
        $('#clearButton').click(clearAll);

        // page number click
        $('#navigation_block').on('click', '.pageN', function ()
        {
            // get ID of the selected page
            selectedPage = $(this).attr('id');
            show();
        });

        // state change
        $('#content_container').on('click', '.item > .checkbox', changeStatus);

        // edit item value
        $('#content_container').on('dblclick', '.item > .content', editValue);

        // apply item value changes on ENTER
        $('#content_container').on('keydown', '.item > .editItem', applyValue);

        // remove item
        $('#content_container').on('click', '.item > .remove_item', killItem);
    });