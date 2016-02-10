var methods = {};


/**
  Query reservations, constrained by start (and optionally) end date

  @param resource
    A resource to find associated reservations
  @param startDate
    start date for query (JS date object)
  @param endDate (optional)
    end date for query (JS date object)
  @param returnQueryParams
    Returns the db query params instead of the processed data

**/
methods.queryReservations = function(resource, startDate, endDate, returnQueryParams){
  var params = {
    resource_id: resource._id,
    cancelled: false,
    start_date: {
      $gt: startDate
    }
  };
  if (endDate){
    params.end_date = {
      $lt: endDate
    }
  }
  var reservations = Reservations.find(params);
  if (returnQueryParams){
    return params;
  }

  return reservations.fetch();
}


/**
  Get a stream of reservations given a resource, constained by start and end date.

  @param resource
    A resource to find associated reservations
  @param startDate
    start date for query (JS date object)
  @param endDate
    end date for query (JS date object)

  @return
    An array of objects formatted for use with full calendar
**/
methods.getReservationStream = function(resource, startDate, endDate){

  var reservationData = methods.queryReservations(resource, startDate, endDate);
  var calendarEventObjects = [];
  
  for (var i = 0; i < reservationData.length; i++) {
    var reservation = reservationData[i]
    calendarEventObjects.push(buildCalObject(reservation));
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
  if (conflictingReservationCount(null, resource, startDate, endDate)){
    throw new Meteor.Error('overlapping', 'Reservations cannot overlap.');
  }
  else if (!Meteor.userId()){
    //TODO: or not privileged
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }
  else{
      Reservations.insert({
        owner_id: [Meteor.userId()],
        attending_user_id: [Meteor.userId()],
        resource_id: resource._id,
        start_date: startDate,
        end_date: endDate,
        cancelled: false,
        reminder_sent: false
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
  if (conflictingReservationCount(reservation, reservation.resource, startDate, endDate)){
    throw new Meteor.Error('overlapping', 'Reservations cannot overlap.');
  }
  if (!(isOwner(reservation) || isAdmin())){
    //TODO: expand privileges
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
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
  if (!(isOwner(reservation) || isAdmin())){
    //TODO: expand privileges
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
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
Create/enroll a new user account.
Sends an email to the user linking to a page to set their password.
**/
methods.createAccount = function(username, email){
  if (!Meteor.userId()){
    //TODO: or not privileged
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }
  var accountId = Accounts.createUser({
    'username': username,
    'email': email
  });
  Accounts.sendEnrollmentEmail(accountId);
}

methods.getAllTags = function(){
  if (!Meteor.userId()){
    //TODO: or not privileged
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }
  var tagArrays = Resources.find({}, {fields: {tags: 1}}).map(function (obj) {
    return obj.tags;
  });
  var tags = _.uniq([].concat.apply([], tagArrays), false); // flatten tag arrays and get unique values
  return tags;
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

function buildCalObject(reservation){
  var calObject = {}
  var labelString = "Owner:\n" + reservation.owner.username
  labelString += "\nResource:\n" + reservation.resource.name
  calObject.title = labelString
  calObject.start = reservation.start_date
  calObject.reservation = reservation
  calObject.end = reservation.end_date
  return calObject
}

function conflictingReservationCount(reservation, resource, startDate, endDate){
  //check for a conflicting reservation
  var params = {
    resource_id: resource._id,
    cancelled: false,
    start_date: {
      $lt: endDate
    },
    end_date: {
      $gt: startDate
    }
  };
  if (reservation){
    params._id = {
      $ne: reservation._id
    }
  }
  var conflictingReservations = Reservations.find(params);
  return conflictingReservations.count();
}

function isAdmin(){
  if (!Meteor.user()){
    return false;
  }
  return Meteor.user().username == 'admin';
}

function isOwner(reservation){
  if (!Meteor.user()){
    return false;
  }
  var found = false;
  for (var i = 0; i < reservation.owner_id.length; i++) {
    var ownerId = reservation.owner_id[i];
    if (ownerId == Meteor.userId()){
      found = true;
    }
  };
  return found;
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
