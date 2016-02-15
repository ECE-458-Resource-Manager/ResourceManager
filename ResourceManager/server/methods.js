/**
@namespace methods
**/
var methods = {};

/**
@ignore

Methods we've chosen to expose to the API
**/
var externalizedMethods = {};
methods.externalizedMethods = function(){ return externalizedMethods; }


/********************************************************************************
*****
*
* Resources
*
*****
********************************************************************************/

externalizedMethods.getResources = [{name: 'name', type: 'String'}];
methods.getResources = function(name){
  return name;
}


/********************************************************************************
*****
*
* Reservations
*
*****
********************************************************************************/


/**
  Query reservations, constrained by start (and optionally) end date

  @param {string} resource
    A resource to find associated reservations, either the object or ID
  @param {date} startDate
    Start date for query
  @param {date} endDate (optional)
    End date for query
  @private {bool} returnQueryParams
    Returns the db query params instead of the processed data

*/
methods.queryReservations = function(resource, startDate, endDate, returnQueryParams){
  var resourceId = getCollectionId(resource);

  var params = {
    resource_id: resourceId,
    cancelled: false,
    end_date: {
      $gt: startDate
    }
  };
  if (endDate){
    params.start_date = {
      $lt: endDate
    }
  }
  var reservations = Reservations.find(params);
  if (returnQueryParams){
    return params;
  }

  return reservations.fetch();
}
externalizedMethods.queryReservations = [{name: "resource", type: "String"}, 
                                         {name: "startDate", type: "Date"},
                                         {name: "endDate", type: "Date"}];


/**
  @ignore

  Get a stream of full calendar reservation objects given a resource, constained by start and end date.

  @param {string} resource
    A resource to find associated reservations, either the object or ID
  @param {date} startDate
    Start date for query
  @param {date} endDate
    End date for query

  @return - An array of objects formatted for use with full calendar
*/
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
    Resource collection object or ID
  @param {date} startDate
    New reservation start date
  @param {date} endDate
    New reservation end date
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
    Reservations collection object or ID
  @param {date} startDate
    New reservation start date
  @param {date} endDate
    New reservation end date
**/
methods.changeReservationTime = function(reservation, startDate, endDate){
  if (!reservation._id){
    reservation = Reservations.findOne({_id:reservation});
  }
  if (conflictingReservationCount(reservation._id, reservation.resource._id, startDate, endDate)){
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
    Reservation collection object or ID
**/
methods.cancelReservation = function(reservation){
  var reservationId = getCollectionId(reservation);

  if (!(isOwner(reservation) || isAdmin())){
    //TODO: expand privileges
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }
  else{
    Reservations.update(reservationId, {
      $set: {
        cancelled: true
      }
    })
  }
}


/********************************************************************************
*****
*
* Users
*
*****
********************************************************************************/



/**
Create/enroll a new user account.
Sends an email to the user linking to a page to set their password.

@param username
  Username for new user
@param email
  Email for new user
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

/**
@ignore

Find an apiKey for a user, creating a new one if needed.
**/
methods.getApiKey = function(){
  console.log(Meteor.user().api_key);
  if (!Meteor.user().api_key){
    console.log('updating');
    Meteor.users.update(Meteor.userId(), {
      $set: {
        api_key: Meteor.uuid()
      }
    }, function(error){
      return Meteor.user().api_key;
    });
  }
  else{
    return Meteor.user().api_key;
  }
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


/********************************************************************************
*****
*
* Helpers
*
*****
********************************************************************************/


/**
@ignore

Build a calendar object for use with full calendar.

@param reservation
  Reservations collection object
*/
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

/**
@ignore

Find the number of conflicting reservations given a resource and a start and end date, with an optional reservation to ignore.

@oaram reservationId
  Reservation ID to ignore as a conflict (optional)
@param resourceId
  Resource ID to check for conflicting reservations
@param {date} startDate
  Start date to check for conflicts
@param {date} endDate
  End date to check for conflicts
*/
function conflictingReservationCount(reservationId, resourceId, startDate, endDate){
  //check for a conflicting reservation
  var params = {
    resource_id: resourceId,
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
      $ne: reservationId
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
  if (!reservation._id){
    var reservation = Reservations.findOne({_id: reservation});
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
@ignore
Look through some array of objects and build an array of the object's IDs
*/
objectArrayToIdArray = function(objects){
  var objectIds = []
  for (var i = 0; i < objects.length; i++) {
    var object = objects[i]
    objectIds.push(object._id);
  };
  return objectIds;
}

/**
@ignore

Return the collection ID, whether given the ID or the object
*/
getCollectionId = function(item){
  if (item._id){
    return item._id;
  }
  return item;
}

//pass methods to Meteor.methods
Meteor.methods(methods);
