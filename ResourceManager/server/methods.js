var methods = {};



/**
  Get a stream of reservations given a resource, constained by start and end date.

  @param resource
    A resource to find associated reservations
  @param startDate
    start date for query (JS date object)
  @param endDate
    end date for query (JS date object)
  @param returnQueryParams
    Returns the db query params instead of the processed data

  @return
    An array of objects formatted for use with full calendar
**/
methods.getReservationStream = function(resource, startDate, endDate, returnQueryParams){
  var params = {
    resource_id: resource._id,
    cancelled: false,
    start_date: {
      $gte: startDate
    },
    end_date: {
      $lte: endDate
    }
  };
  var reservations = Reservations.find(params);
  if (returnQueryParams){
    return params;
  }

  var reservationData = reservations.fetch();
  var calendarEventObjects = [];
  
  for (var i = 0; i < reservationData.length; i++) {
    var reservation = reservationData[i]
    calendarEventObjects.push(buildCalObject(reservation, resource));
  };
  return calendarEventObjects;
}

/**
  Create a reservation

  @param resource
    A single resource that the reservation will be associated with
  @param startDate
    New reservation start date (JS date object)
  @param endDate
    New reservation end date (JS date object)
**/
methods.createReservation = function(resource, startDate, endDate){
  if (!Meteor.userId()){
    //TODO: or not privileged
    throw new Meteor.Error(401, 'Error 401: Unauthorized', 'You are not authorized to perform that operation.');
  }
  else{
      Reservations.insert({
        owner_id: [Meteor.userId()],
        attending_user_id: [Meteor.userId()],
        resource_id: resource._id,
        start_date: startDate,
        end_date: endDate,
        cancelled: false
      })
  }
}

/**
  Change a reservation's start and/or end datetime

  @param reservation
    Reservations collection object
  @param startDate
    New reservation start date (JS date object)
  @param endDate
    New reservation end date (JS date object)
**/
methods.changeReservationTime = function(reservation, startDate, endDate){
  if (!Meteor.userId()){
    //TODO: or not privileged
    throw new Meteor.Error(401, 'Error 401: Unauthorized', 'You are not authorized to perform that operation.');
  }
  else{
    Reservations.update(reservation._id, {
      $set: {
        start_date: startDate,
        end_date: endDate
      }
    })
  }
}

/**
  Cancel a reservation

  @param reservation
    Reservation collection object
**/
methods.cancelReservation = function(reservation){
  if (!Meteor.userId()){
    //TODO: or not privileged
    throw new Meteor.Error(401, 'Error 401: Unauthorized', 'You are not authorized to perform that operation.');
  }
  else{
    Reservations.update(reservation._id, {
      $set: {
        cancelled: true
      }
    })
  }
}

/**
*
* Helpers
*
**/

/**
Build a calendar object for use with full calendar.

@param reservation
  Reservations collection object
**/

function buildCalObject(reservation, resource){
  /**
  * Format the reservation object
  **/
  //we want to include the actual objects for some references
  //TODO: send objects for all owners?
  reservation.owner = Meteor.users.findOne({_id:reservation.owner_id[0]});
  reservation.resource = resource;
  /**
  * Format the calendar object
  **/
  var calObject = {}
  var labelString = "Owner:\n" + reservation.owner.username
  labelString += "\nResource:\n" + resource.name
  calObject.title = labelString
  calObject.start = reservation.start_date
  calObject.reservation = reservation
  calObject.end = reservation.end_date
  return calObject
}

/**
Look through some array of objects and build an array of the object's IDs
**/
objectArrayToIdArray = function(objects){
  var objectIds = []
  for (var i = 0; i < objects.length; i++) {
    var object = objects[i]
    objectIds.push(object._id);
  };
  return objectIds;
}

//pass methods to Meteor.methods
Meteor.methods(methods);
