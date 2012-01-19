jQTouch Calendar Extension
==========================

This is a jQTouch extension to generate an iCal-like interface from basic HTML markup.

Based on [jQTouch iCal by Bruno Alexandre](http://code.google.com/p/jqtouch-ical/)

HTML
----
Create a list of calendar entries like so:

    <div id="any_id">
      <ul>
        <li><time datetime="2011-01-25T21:20Z">Task text here</time></li>
        <li><time datetime="2011-01-25T23:00Z">More task text here</time></li>
        <li><time datetime="2011-03-02T09:30Z">Another task here</time></li>
      </ul>
    </div>

Script
------
Use this to initialise:

    <script type="text/javascript" charset="utf-8">
      var jQT = new $.jQTouch({});
      $(function() {
        $('#any_id').getCalendar(); //This is the important bit
      });
    </script>

Options
-------
You can also call getCalendar with an options object e.g.
    $('#any_id').getCalendar({date:variable_x, weekstart:variable_y});

 * date: Date around which to render the initial calendar. At start, this date is selected 
   * _(default: new Date())_
 * days: Array of titles for the columns 
   * _(default: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])_
 * months: Array of month names 
   * _(default: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'])_
 * weekstart: index of the position in the days array on which the week is to start
   * _(default: 1)_
 * noEvents: text to show at days with no events
   * _(default: 'No Events')_
