$(document).ready(
    function () {
        //*****************************************************************************************
        // VARS ON STARTUP
        //*****************************************************************************************
        var itemsArray = [];    // array for items (local)
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


        // "CHANGE ITEM STATUS" FUNCTION
        function changeStatus () {
            // get ID of the selected item
            var selectedID = $(this).parent('div').attr('id');
            itemsArray.forEach(function (item)
            {
                if(item.idn === +selectedID)
                {
                    if (item.istate === "d")
                    {
                        item.istate = "p";
                        $(this).parent('div').removeClass('done');
                        $(this).removeClass('checked');
                        pend++;
                        done--;

                        /* change DB */

                        // remove from html if show status is wrong
                        if (whatToShow === 2)
                        {
                            $(this).parent('div').remove();
                        }
                        draw();
                    }
                    else
                    {
                        item.istate = "d";
                        $(this).parent('div').addClass('done');
                        $(this).addClass('checked');
                        pend--;
                        done++;

                        /* change DB */

                        // remove from html if show status is wrong
                        if (whatToShow === 1)
                        {
                            $(this).parent('div').remove();
                        }
                        draw();
                    }
                }
            });
            stats();
        }


        // "DRAW" FUNCTION
        function draw () {

            $('.item').remove();                        // clear html
            var counter = 0;                            // counter for drawn items
            var foundItemsArray = [];                   // array for found items

            // if it is needed to show all items
            if (whatToShow === 0)
            {
                // how many items to show?
                // itemsNumber = pend + done;

                // how many pages?
                pagesNumber = Math.ceil(itemsNumber / itemsPerPage);

                // show itemsPerPage items on a page, depending on the selected page
                for (var i = (selectedPage * itemsPerPage) - itemsPerPage; i < itemsArray.length; i++)  // [*FOR*]
                {
                    if (counter < itemsPerPage)
                    {
                        if (responseArray[i].state === "p")
                        {
                            $('#content_container').append("<div class='item' id='" + responseArray[i].id
                                + "'><div class='checkBox' id='checkBox-" + responseArray[i].id
                                + "'></div><div id='content'>" + responseArray[i].value
                                + "</div><div class='killItem' id='killItem-" + responseArray[i].id + "'></div></div>");
                            counter++;
                        }
                        else
                        {
                            $('#content_container').append("<div class='item done' id='" + responseArray[i].id
                                + "'><div class='checkBox checked' id='checkBox-" + responseArray[i].id
                                + "'></div><div id='content'>" + responseArray[i].value
                                + "</div><div class='killItem' id='killItem-" + responseArray[i].id + "'></div></div>");
                            counter++;
                        }
                    }
                    else
                    {
                        break;
                    }
                }
            }

            // if it is needed to show pending items
            if (whatToShow === 1)
            {
                // how many items to show?
                itemsNumber = pend;

                // how many pages?
                pagesNumber = Math.ceil(itemsNumber / itemsPerPage);

                // GET ALL OF THE "p" STATE ITEMS IN A NEW ARRAY
                foundItemsArray = [];                       // array for items
                itemsArray.forEach(function (item)          // loop
                {
                    if (item.istate === "p")
                    {
                        foundItemsArray.push(item);         // push results into the array
                    }
                });

                // show itemsPerPage items on a page, depending on the selected page
                for (var i = selectedPage * itemsPerPage - itemsPerPage; i < foundItemsArray.length; i++)    // [*FOR*]
                {
                    if (counter < itemsPerPage)
                    {
                        $('#items_wrap').append("<div class='item' id='" + foundItemsArray[i].idn
                            + "'><div class='checkBox' id='checkBox-" + foundItemsArray[i].idn
                            + "'></div><div id='content'>" + foundItemsArray[i].ivalue
                            + "</div><div class='killItem' id='killItem-" + foundItemsArray[i].idn + "'></div></div>");
                        counter++;
                    }
                    else
                    {
                        break;
                    }
                }
            }

            // if it is needed to show done items
            if (whatToShow === 2)
            {
                // how many items to show?
                itemsNumber = done;

                // how many pages?
                pagesNumber = Math.ceil(itemsNumber / itemsPerPage);

                // GET ALL OF THE "d" STATE ITEMS IN A NEW ARRAY
                foundItemsArray = [];                       // array for items
                itemsArray.forEach(function (item)          // parse array
                {
                    if (item.istate === "d")
                    {
                        foundItemsArray.push(item);         // push results into the array
                    }
                });

                // show itemsPerPage items on a page, depending on the selected page
                for (var i = selectedPage * itemsPerPage - itemsPerPage; i < foundItemsArray.length; i++)   // [*FOR*]
                {
                    if (counter < itemsPerPage)
                    {
                        $('#items_wrap').append("<div class='item done' id='" + foundItemsArray[i].idn
                            + "'><div class='checkBox checked' id='checkBox-" + foundItemsArray[i].idn
                            + "'></div><div id='content'>" + foundItemsArray[i].ivalue
                            + "</div><div class='killItem' id='killItem-" + foundItemsArray[i].idn + "'></div></div>");
                        counter++;
                    }
                    else
                    {
                        break;
                    }
                }
            }
            navigation();
        }


        // "SHOW ALL" FUNCTION
        function showAll ()
        {
            // show everything
            whatToShow = 0;

            // array for the results
            responseArray = [];


            $('#content_container').html("");

            $.ajax({
                url     : "tasks/",
                method  : "GET"
            }).then(function(res) {
                console.log("res", res);
                responseArray = res;
                if (responseArray.length === 0)
                {
                    $('#content_container').html("Nothing to show.");
                }
                else
                {
                    //itemsNumber = responseArray.length;
                    //draw();
                    for (var i = 0; i < responseArray.length; i++)
                    {
                        $('#content_container').append('<div>ID: ' + responseArray[i].id + ' VALUE: '
                            + responseArray[i].value + ' STATE: ' + responseArray[i].state + '</div>');
                    }
                }
            });
            stats();
        }


        // "CLEAR ALL" FUNCTION
        function clearAll ()
        {
            $.ajax({
                url     : "tasks/clear",
                method  : "GET"
            }).then(function(res)
            {
                console.log("res", res)
            });

            itemID = 0;
            pend = 0;
            done = 0;
            $('#content_container').html("Nothing to show.");
        }


        // "ADD ITEM" FUNCTION
        function addItem () {
            itemValue = $('#item_value').val();

            /*
            // FORM POST EMULATOR 3000:
            $('#ghost').html('<form id="fakeForm" action="/project3/tasks/create/" ' +
                'method="post"><input id="id" name="name" type="hidden" value="'+ itemValue + '"></form>');
            $('#fakeForm').submit();
             $('#ghost').html("");
            */

            $.ajax({
                url     : "tasks/create",
                method  : "POST",
                data    : { id: itemID, state: itemState, value: itemValue }
            }).then(function(res)
            {
                console.log("res", res)
            });

            $('#item_value').val("");
            itemID++;
            pend++;

            stats();
        }


        // "PAGINATION" FUNCTION (ON PAGE NUMBER CLICK)
        function pagination ()
        {
            // get ID of the selected page
            selectedPage = $(this).attr('id');
            draw();
            stats();
        }


        // "NAVIGATION" FUNCTION (SHOWS NAVIGATION PANEL)
        function navigation () {
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
            // highlight
            $('#navigation_block > div.pageN').removeClass('selectedN');
            $('#navigation_block').find('div').eq(selectedPage - 1).addClass('selectedN');
        }


        // "START UP" FUNCTION
        function start () {
            // show everything
            whatToShow = 0;

            /*
             connect to DB -> query everything -> write to itemsArray[] -> print out items OR show message "No entries"
             */
            //if (itemsArray.length === 0)
            showAll();

            //$('#content_container').html('There are no tasks... Yet.');

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
    });