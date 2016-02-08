var debug = false;                      //debug flag for showing dummy events
var attachedResource;                   //resource attached to the calendar
var activeListener;                     //the current meteor collection listener

var dummyEvents = [
  {
    title : 'dummy event',
    start : moment()
  },
  {
    title : 'dummy event',
    start : '2016-01-26T12:30:00'
  },
  {
    title : 'dummy event',
    start : '2016-02-04T12:30:00'
  }
]

var events = debug ? dummyEvents : getCalendarEvents

var defaultView = daysToDisplay() == 7 ? 'agendaWeek' : 'agendaXDay'

Template.calendar.helpers({
  options: function() {
    return {
      defaultView: defaultView,
      header: {
        left:     'agendaDay,agendaWeek',
        center:   'title',
        right:    'today prev,next'
      },
      views: {
        agendaXDay: {
          type: 'agenda',
          duration: { days: daysToDisplay() }
        }
      },
      firstDay: 1,
      selectable: true,
      editable: true,
      select: didMakeSelection,
      eventClick: didClickEvent,
      eventDrop: didMoveEvent,
      eventResize: didResizeEvent,
      eventColor: COLOR_PALETTE.SECONDARY_THEME_COLOR_HEX_STRING,
      //TODO: dummy static events!
      events: events
    }
  }
});


Template.calendar.rendered = function(){
  $('#resourceCalendar').fullCalendar({
    defaultView: defaultView,
    header: {
      left:     'agendaDay,agendaWeek',
      center:   'title',
      right:    'today prev,next'
    },
    views: {
      agendaXDay: {
        type: 'agenda',
        duration: { days: daysToDisplay() }
      }
    },
    firstDay: 1,
    selectable: true,
    editable: true,
    select: didMakeSelection,
    eventClick: didClickEvent,
    eventDrop: didMoveEvent,
    eventResize: didResizeEvent,
    eventRender: calendarEventRendered,
    viewRender: viewRendered,
    eventColor: COLOR_PALETTE.SECONDARY_THEME_COLOR_HEX_STRING,
    timezone: 'UTC',
    //TODO: dummy static events!
    events: events
  })
  attachedResource = this.data
  refetchEvents();
  var view = getCalendarView();
  listenForChanges(view.intervalStart, view.intervalEnd);

  Meteor.subscribe("reservations");
}


/****
*
* Calendar Data Source
*
****/

/**
Listen to the Reservations collection for changes
**/
function listenForChanges(startDate, endDate){

  //don't run the reactive updates on initial load
  var initializing = true;

  if (activeListener){
    activeListener.stop();
  }

  //we need to find the query paramaters, which we'll be observing for changes
  Meteor.call('queryReservations', attachedResource, startDate.toDate(), endDate.toDate(), true, function(error, result){
    errorHandle(error);
    var params = result;
    activeListener = Reservations.find(params).observeChanges({
      added: function(id, fields) {
        if (!initializing){
          refetchEvents();
        }
      },
      changed: function(id, fields) {
        if (!initializing){
          refetchEvents();
        }
      },
      removed: function(id) {
        if (!initializing){
          refetchEvents();
        }
      }
    });
    initializing = false;
  });

}

/**
Tell the calendar to refetch its events.
**/
function refetchEvents(){
  $('#resourceCalendar').fullCalendar('refetchEvents');
}

/**
The function that is called by full calendar when it needs events for a certain time period.

@param start
  A moment.js object indicating the beginning of a selection
@param end
  A moment.js object indicating the end of a selection
@param timezone
  A string/boolean describing the calendar's current timezone
@param callback
  A function that must be called when the function has generated events
**/
function getCalendarEvents(start, end, timezone, callback){
  var events = []
  //are we linked to a resource?
  if (attachedResource){
    Meteor.call('queryReservations', attachedResource, start.toDate(), end.toDate(), false, function(error, result){
      for (var i = 0; i < result.length; i++) {
        var reservation = result[i];
        events.push(buildCalObject(reservation))
      };
      callback(events)
    });
  }
}

/**
Build a calendar object for use with full calendar.

@param reservation
  Reservations collection object
**/

function buildCalObject(reservation){
  var calObject = {}
  var labelString = "Owner:\n" + reservation.owner.username
  labelString += "\nResource:\n" + attachedResource.name
  calObject.title = labelString
  calObject.start = moment(reservation.start_date)
  calObject.reservation = reservation
  calObject.end = moment(reservation.end_date)
  return calObject
}


/****
* 
* Event hooks
*
****/


/**
A callback that will fire after a selection is made by the user on the calendar

http://fullcalendar.io/docs/selection/select_callback/

@param start
  A moment.js object indicating the beginning of a selection
@param end
  A moment.js object indicating the end of a selection
@param jsEvent
  Primitive JavaScript event object
@param view
  The calendar view object
**/
function didMakeSelection(start, end, jsEvent, view){
  Meteor.call('createReservation', attachedResource, start.toDate(), end.toDate(), function(error, result){
    errorHandle(error);
  })
}


/**
A callback triggered when the user clicks an event

http://fullcalendar.io/docs/mouse/eventClick/

@param event
  A full calendar event object holding the event information
@param jsEvent
  Primitive JavaScript event object
@param view
  The calendar view object
**/
function didClickEvent(event, jsEvent, view){
  //was the delete button clicked?
  if($(jsEvent.target).hasClass('fc-delete-button')){
    didDeleteEvent(event, jsEvent, view);
  }
  else{
    console.log("Event clicked:");
    console.log(event);
  }
}

/**
A callback triggered when the user deletes an event

@param event
  A full calendar event object holding the event information
@param jsEvent
  Primitive JavaScript event object
@param view
  The calendar view object
**/
function didDeleteEvent(event, jsEvent, view){
  Meteor.call('cancelReservation', event.reservation, function(error, result){
    errorHandle(error);
  });
}

/**
A callback triggered when the user drags an event to a different day and/or time.  The duration does not change.

http://fullcalendar.io/docs/event_ui/eventDrop/

@param event
  A full calendar event object holding the event information
@param delta
  A full calendar duration object representing the amount of time the event was moved to
@param revertFunc
  A function that reverts the event's start and end time to what they were before the drag occured
@param jsEvent
  Primitive JavaScript event object
@param ui
  Empty object (was jQuery UI object prior to version 2.1)
@param view
  The calendar view object
**/
function didMoveEvent(event, delta, revertFunc, jsEvent, ui, view){
  Meteor.call('changeReservationTime', event.reservation, event.start.toDate(), event.end.toDate(), function(error, result){
    errorHandle(error);
  });
}

/**
A callback triggered after resizing when the event has changed duration.

@param event
  A full calendar event object holding the event information
@param delta
  A full calendar duration object representing the amount of time the event was moved to
@param revertFunc
  A function that reverts the event's start and end time to what they were before the drag occured
@param jsEvent
  Primitive JavaScript event object
@param ui
  Empty object (was jQuery UI object prior to version 2.1)
@param view
  The calendar view object
**/
function didResizeEvent(event, delta, revertFunc, jsEvent, ui, view){
  Meteor.call('changeReservationTime', event.reservation, event.start.toDate(), event.end.toDate(), function(error, result){
    errorHandle(error);
  });
}


/****
*
* Event and View Rendering
*
****/


/**
Triggered while an event is being rendered by full calendar.

@param event
  A full calendar event object holding the event information
@param element
  The newly created jQuery element
@param view
  The calendar view object
**/
function calendarEventRendered(event, element, view){
  //we need to insert a delete button
  var deleteHtml = "<i class='fc-delete-button material-icons'>delete</i>"
  element.find('.fc-content').append(deleteHtml);
}

/**
Triggered when a new date range is rendered

@param view
  The calendar view object
@param element
  The newly created jQuery element for the container of the new view
**/
function viewRendered(view, element){
  if (attachedResource){
    listenForChanges(view.intervalStart, view.intervalEnd);
  }
}

/**
Get the fullcalendar view

@return
  The calendar view object
**/
function getCalendarView(){
  return $('#resourceCalendar').fullCalendar('getView');
}


/****
* 
* Helpers
*
****/

/**
Looks at start and end date (from session?) and returns how many days will be displayed on the calendar
**/
function daysToDisplay(){
  return 7
}

/**
Present errors to the user in a nice way
**/
function errorHandle(error){
  if (error){
    Materialize.toast(error.details, 3000);
  }
}
