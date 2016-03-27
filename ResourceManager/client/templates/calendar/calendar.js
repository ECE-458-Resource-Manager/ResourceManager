var debug = false;                      //debug flag for showing dummy events
var attachedResources;                  //resources attached to the calendar
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
    timezone: 'local',
    //TODO: dummy static events!
    events: events
  })
  attachedResources = this.data
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
  Meteor.call('queryReservationsWithListener', attachedResources, startDate.toDate(), endDate.toDate(), true, function(error, result){
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
    setTimeout(function() { initializing = false }, 500);
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
  if (attachedResources){
    //console.log("Attempting to get calendar events (client-sie)  for resources:");
    //console.log(attachedResources);
    Meteor.call('getReservationStream', attachedResources, start.toDate(), end.toDate(), function(error, result){
      errorHandle(error);
      //initialize dates as moments, can't send moments via server
      for (var i = 0; i < result.length; i++) {
        result[i].start = moment(result[i].start)
        result[i].end = moment(result[i].end)
        //event customization
        var FADED = result[i].reservation.incomplete ? '_FADED' : '';
        if (result[i].reservation.owner._id == Meteor.userId()){
          result[i].color = COLOR_PALETTE['BLUE_THEME_COLOR_HEX_STRING'+FADED];
        }
        else{
          result[i].color = COLOR_PALETTE['SECONDARY_THEME_COLOR_HEX_STRING'+FADED];
        }
      };
      callback(result);
    });
  }
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
  //compound reservation requires title
  MaterializeModal.form({
    title: "Reservation Info:",
    bodyTemplate: "reservationForm",
    reservationTitle: Meteor.user().username + "'s Reservation - " + start.format('ddd, MMM Do YYYY, h:mm a'),
    callback: function(error, response){
      if (response.submit){
        createReservation(start, end, response.form['reservation-title'], response.form['reservation-description']);
      }
    }
  });
}

function createReservation(start, end, title, description){
  Meteor.call('createReservation', attachedResources, start.toDate(), end.toDate(), title, description, function(error, result){
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
    shouldDeleteEvent(event, jsEvent, view);
  }
  else{
    window.location = '/reservation/'+event.reservation._id;
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
function shouldDeleteEvent(event, jsEvent, view){
  MaterializeModal.message({
    title: 'Confirm',
    submitLabel: 'Yes',
    closeLabel: 'Cancel',
    message: 'Are you sure you want to delete?',
    callback: function(error, response){
      if (response.submit){
        Meteor.call('cancelReservation', event.reservation, function(error, result){
          errorHandle(error);
        });
      }
    }
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
    if (error){
      revertFunc();
      errorHandle(error);
    }
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
  if (delta > 0){
    MaterializeModal.confirm({
      title: "Confirm reservation extension",
      message: "Extending this reservation will cause a new reservation to be created for the additional time.",
      callback: function(error, response) {
        if (response.submit) {
          changeReservationTime(event, revertFunc);
        } else {
          revertFunc();
        }
      }
    });
  }
  else{
    changeReservationTime(event, revertFunc);
  }
}

function changeReservationTime(event, revertFunc){
  Meteor.call('changeReservationTime', event.reservation, event.start.toDate(), event.end.toDate(), function(error, result){
    if (error){
      errorHandle(error);
      revertFunc();
    }
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
  var deleteHtml = "<i class='fc-delete-button material-icons'>close</i>"
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
  if (attachedResources){
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
    Materialize.toast(error.reason, 3000);
  }
}
