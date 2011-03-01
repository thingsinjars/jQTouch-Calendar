/*
	jQTouch Calendar Extension
	based on jQTouch iCal alpha by Bruno Alexandre
	
	Use this markup:
	<div id="any_id">
			<ul>
				<li><time datetime="2009-02-17T05:00Z">Task text here</time></li>
			</ul>
	</div>
	
	and this to initialise:
	<script type="text/javascript" charset="utf-8">
			var jQT = new $.jQTouch({});
		$(function() {
			$('#any_id').getCalendar();
		});
	</script>
	you can also call getCalendar with an options object
			$('#any_id').getCalendar({date:variable_x, weekstart:variable_y});
	Options:
	date: Date around which to render the initial calendar. Shows this date as selected (default: new Date())
	days: Array of titles for the columns (default: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'])
	months: Array of month names (default: ['January','February','March','April','May','June','July','August','September','October','November','December'])
	weekstart: index of the position in the days array the week is to start on (default: 1)

*/

(function($) {
		if ($.jQTouch) {
				$.jQTouch.addExtension(function Calendar(jQT){

					// Load the calendar for the given date
					jQuery.fn.getCalendar = function(options) {
						var defaults = {
										date	: new Date(),
										days	: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
										months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
										weekstart: 1,
										noEvents: 'No Events'
								}
						var settings = $.extend({}, defaults, options);

						return this.each(function(){
							var $el = $(this);

							//Add class for styling
							$el.addClass('jqt_calendar');

							//Save settings
							$el.data('settings', settings);

							//Read events from markup
							$el.loadEvents();

							// clear existing calendar
							$el.empty();

							// append generated calendar markup
							$el.append($el.generateCalendar(settings.date.getMonth(),settings.date.getFullYear()));

							//Run through dates and add a class to those with events
							$el.attachEvents();

							// set all clicks (don't use live or tap to avoid bugs)
							$el.setBindings();

							// Highlight today if we're on this month
							$el.setToday();

							// If the selected date has events, load them
							$el.setSelected(settings.date);

						});

					};

//Markup Reading
					jQuery.fn.loadEvents = function() {
						$el = $(this);
						if($el.data('events')) {
						 //We've already processed these.
						 //might look into merging arrays later
						} else {
							var events = {};

							$el.find('time').each(function(index) {
								var task_datetime = $(this).attr('datetime');
								var time_marker_index = task_datetime.indexOf('T');
								var task_day = task_datetime.substring(0, time_marker_index).replace(/-0/g,'-');
								var task_time = task_datetime.substring(time_marker_index+1,task_datetime.length-1);
								var task_text = $(this).html();
								if(!$.isArray(events[task_day])) {
									events[task_day] = []
								}
								events[task_day].push({time:task_time, text:task_text});
							});
							$el.data('events', events);
						}
					}


 //Markup Generation
					jQuery.fn.dayMarkup = function(format,day,month,year,column) {
						var this_day = $('<td/>');

						if ( format == 0 ) {
							this_day.addClass('prevmonth');
						} else if ( format == 9 ) {
							this_day.addClass('nextmonth');
						}
						if ( column==0 || column==6 ) {
							this_day.addClass('weekend');
						}
						this_day.attr('datetime',year+'-'+(month+1)+'-'+day);
						this_day.html(day);
						return this_day;
					 }
					jQuery.fn.monthLength = function(month, year) {
						var dd = new Date(year, month, 0);
						return dd.getDate();
					}
					jQuery.fn.monthMarkup= function(month, year) {
						var $el = $(this);
						var settings = $el.data('settings');
						var c = new Date();
						c.setDate(1);c.setMonth(month);c.setFullYear(year);

						var x = parseInt(settings.weekstart,10);
						var s = (c.getDay()-x)%7;
						if (s<0) {
							s+=7;
						}

						var dm = $el.monthLength(month,year);

						var this_month = $('<table/>');
						this_month.data('month',month+1);
						this_month.data('year',year);
						this_month.attr('cellspacing', 0);
						var table_head = $('<thead/>');
						var table_row = $('<tr/>');

						$('<th>' + settings.days[(0+x)%7]+'</th>').addClass('goto-prevmonth').appendTo(table_row);
						$('<th>' + settings.days[(1+x)%7]+'</th>').appendTo(table_row);
						$('<th>' + settings.days[(2+x)%7]+'</th>').appendTo(table_row);
						$('<th><span>' + settings.months[month] + ' ' + year + '</span>' + settings.days[(3+x)%7] + '</th>').appendTo(table_row);
						$('<th>' + settings.days[(4+x)%7]+'</th>').appendTo(table_row);
						$('<th>' + settings.days[(5+x)%7]+'</th>').appendTo(table_row);
						$('<th>' + settings.days[(6+x)%7]+'</th>').addClass('goto-nextmonth').appendTo(table_row);

						table_head.append(table_row);


						this_month.append(table_head);
						this_month.append('<tfoot><tr><th colspan="7">&nbsp;</th></tr></tfoot>');

						var table_body = $('<tbody/>');
						table_row = $('<tr/>');


						//Add remaining days from previous month
						for ( var i=s; i>0; i-- ) {

							var this_y = (month-1)<0?year-1:year;

							table_row.append($el.dayMarkup(0, dm-i+1 , (month+11)%12, this_y, (s-i+x)%7));

						}

						//Add this month
						dm = $el.monthLength(month+1,year);
						for(var i=1; i <= dm; i++) {
							if ( (s%7) == 0 ) {
								table_body.append(table_row.clone());
								table_row.empty();
								s = 0;
							}
							table_row.append($el.dayMarkup(1, i , month, year, (s+x)%7));
							s++;
						}

						//Add start of next month
						var j=1;
						for ( var i=s; i<7; i++ ) {

							 var this_y = (month+1)>11?year+1:year;

							 table_row.append($el.dayMarkup(9, j , (month+1)%12, this_y, (i+x)%7));

							 j++;
						 }

						table_body.append(table_row);
						this_month.append(table_body);
						return this_month;
					}
					jQuery.fn.generateCalendar = function(month, year) {
						var $el = $(this);
						var markup = $el.monthMarkup(month, year).after('<ul class="events"></ul>');
						return markup;
					}

//Tasks/Events
					jQuery.fn.attachEvents = function() {
						return this.each(function(){
							var $el = $(this);
							$el.find('td').each( function(index) {
								clickedDate = $el.getCellDate($(this));
								if($el.hasEvent(clickedDate)) {
									$(this).addClass('date_has_event');
								}
							});
						});
					}
					jQuery.fn.hasEvent = function(date) {
						//Before doing anything here, we need to parse the events from the code
						var $el = $(this);
						var key = $el.dateToString(date);
					  return $el.data('events') && $el.data('events')[key] && $el.data('events')[key].length;
					}
					jQuery.fn.getCellDate = function(dateCell) {
						var date = $(dateCell).attr('datetime');
						return $(this).stringToDate(date);
					}
					jQuery.fn.stringToDate = function(dateString) {
						var a = dateString.split('-');
						return new Date(a[0],(a[1]-1),a[2]);
					}
					jQuery.fn.dateToString = function(date) {
						return date.getFullYear()+"-"+(date.getMonth() + 1)+"-"+date.getDate();
					}
					jQuery.fn.getEvents = function(date) {
						var $el = $(this);
						var d = date.getDate();
  					var m = date.getMonth() + 1; // zero index based
  					var y = date.getFullYear();

  					$el.find('.events').empty().append($el.generateEvents(y, m, d));
					}
					jQuery.fn.getNoEvents = function() {
  					$(this).find('.events').empty();
  					$el.find('.events').empty().append("<li class='no-event'>"+$el.data('settings').noEvents+"</li>");
					}
					jQuery.fn.generateEvents = function(year, month, day) {

						var $el = $(this);
						
						var returnable = '';

						$.each($el.data('events')[""+year+"-"+month+"-"+day+""], function(index, value){
							returnable += '<li><span>' + value.time + '</span>'+value.text+'</li>';
						});
						return returnable;
					}
					

//DOM events & Calendar Manipulation
					jQuery.fn.setBindings = function() {
						var $el = $(this);

						// Days
						$el.find('td').bind("click", function() {
							$el.removeSelectedCell();
							$(this).addClass('selected');
							var clickedDate = $el.getCellDate($(this));
							$el.setToday();

							if( $(this).hasClass('date_has_event') ) {
								$el.getEvents(clickedDate);
							} else {
								$el.getNoEvents();
							}
							if(jQT.bars) {
								jQT.setPageHeight();
							}

							if( $(this).hasClass('prevmonth') || $(this).hasClass('nextmonth') ) {
								$el.getCalendar({date:clickedDate});
							}
						});

						// load previous Month
						$el.find(".goto-prevmonth").bind("click", function() {
							$el.loadMonthDelta(-1);
						});
						// load next Month
						$el.find(".goto-nextmonth").bind("click", function() {
							$el.loadMonthDelta(1);
						});
					}
					jQuery.fn.removeSelectedCell = function() {
							$(this).find('.selected').removeClass('selected');
					}

					jQuery.fn.setToday = function() {
						var $el = $(this);
//						var date = $el.data('settings').date;
						var date = new Date();
						$el.find('td[datetime='+date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+']').addClass('today');
					}

					jQuery.fn.setSelected = function(date) {
						$el = $(this);
						$el.removeSelectedCell();
						$el.find('td').each(function() {
							var clickedDate = $el.getCellDate($(this));
							if( !$(this).hasClass("prevmonth") && !$(this).hasClass("nextmonth") && ($el.sameDay(date, clickedDate)) ) {
								$(this).addClass('selected');
								if ( $(this).hasClass('date_has_event') ) {
									$el.getEvents(date);
								} else {
									$el.getNoEvents();
								}
							}
						});
						$el.setToday();
					}

					jQuery.fn.sameDay = function(date1, date2) {
						return (date1.getDate && date2.getDate) && date1.getDate() == date2.getDate() && date1.getMonth() == date2.getMonth() && date1.getFullYear() == date2.getFullYear()
					}

					jQuery.fn.loadMonthDelta = function(delta) {
						$el = $(this);

						if($el.find('.selected').length>=1) {
							var day = $(this).stringToDate($el.find('.selected').attr('datetime')).getDate();
						} else {
							var day = $(this).stringToDate($el.find('.today').attr('datetime')).getDate();
						}
						var month = $el.find('table').data('month');

						var year = $el.find('table').data('year');

						var newDay = new Date(year, (month-1)+delta, day);


						$el.getCalendar( $.extend({}, $el.data('settings'), {date:newDay}) );
					}


				});
		}
})(jQuery);