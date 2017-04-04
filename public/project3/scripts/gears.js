$(document).ready(
    function () {
        //*****************************************************************************************
        // VARS ON STARTUP
        //*****************************************************************************************
        var itemsArray = []; // array of items

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




        // "START UP" FUNCTION
        function start () {
            // show everything
            whatToShow = 0;

            /*
             connect to DB -> query everything -> write to itemsArray[] -> print out items OR show message "No entries"
             */
            if (itemsArray.length === 0)
            {
                $('#content_container').html('There are no tasks... Yet.');
            }

            // show stats
            stats();
        }

        start();

        //*****************************************************************************************
        // BUTTONS / INTERACTIONS
        //*****************************************************************************************
        $('#addButton').click(function () {
            itemValue = $('#item_value').val();

            // FORM POST EMULATOR 3000:
            $('#ghost').html('<form id="fakeForm" action="/project3/tasks/create/" method="post"><input id="fakeInput" name="fake" type="hidden" value="'+ itemValue + '"></form>');
            $('#fakeForm').submit();
        });



        $('#showAll').click(function () {
            $('#content_container').load('/project3/tasks/');
        });
        $('#showPending').click(function () {
            $('#content_container').load('/project3/tasks/pending/');
        });
        $('#showCompleted').click(function () {
            $('#content_container').load('/project3/tasks/completed/');
        });
    });