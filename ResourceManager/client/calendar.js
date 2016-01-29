Template.calendar.helpers({
  options: function() {
    return {
      defaultView: 'agendaWeek',
      header: {
        left:     'agendaDay,agendaWeek',
        center:   'title',
        right:    'today prev,next'
      },
      firstDay: 1,
      selectable: true,
      editable: true,
      select: didMakeSelection,
      eventClick: didClickEvent,
      eventDrop: didMoveEvent,
      eventResize: didResizeEvent,
      //TODO: define color pallete globally!
      eventColor: 'rgb(39, 170, 158)',
      //TODO: dummy static events!
      events: [
        {
          title : 'dummy event',
          start : '2016-01-28T12:30:00'
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
    }
  }
});


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
  console.log("Selection made " + start + " : " + end);
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
  console.log("Event clicked:");
  console.log(event);
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
  console.log("Event moved");
  console.log(event);
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
  console.log("Event resized");
  console.log(event);
}
