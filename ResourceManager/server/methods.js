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

/**
  Add a resource

  @param name
    Name for the resource
  @param description
    Description for the resource
  @param {array} tags
    Tags to associate with the resource, as a comma-separated array of strings
*/
methods.addResource = function(name, description, tags, apiSecret){
  if (!isAdmin(apiSecret)){
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }
  return Resources.insert({
    name: name,
    description: description,
    tags: tags
  });
}
externalizedMethods.addResource = [{name: "name", type: "String"},
                                   {name: "description", type: "String"},
                                   {name: "tags", type: "Array"}];


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

*/
methods.queryReservations = function(resource, startDate, endDate){
  return methods.queryReservationsWithListener(resource, startDate, endDate, false);
}
externalizedMethods.queryReservations = [{name: "resource", type: "String"}, 
                                         {name: "startDate", type: "Date"},
                                         {name: "endDate", type: "Date"}];

/**
  @ignore

  See queryReservations, this includes the option to return the query paramaters used by the calendar change listener.
*/
methods.queryReservationsWithListener = function(resource, startDate, endDate, returnQueryParams){
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
methods.createReservation = function(resource, startDate, endDate, apiSecret){
  var resourceId = getCollectionId(resource);
  var userId = currentUserOrWithKey(apiSecret, false);
  if (conflictingReservationCount(null, resourceId, startDate, endDate)){
    throw new Meteor.Error('overlapping', 'Reservations cannot overlap.');
  }
  else if (!userId){
    //TODO: or not privileged
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }
  else{
      return Reservations.insert({
        owner_id: [userId],
        attending_user_id: [userId],
        resource_id: resourceId,
        start_date: startDate,
        end_date: endDate,
        cancelled: false,
        reminder_sent: false
      });
  }
}
externalizedMethods.createReservation = [{name: "resource", type: "String"}, 
                                         {name: "startDate", type: "Date"},
                                         {name: "endDate", type: "Date"}];

/**
  Change a reservation's start and/or end datetime

  @param reservation
    Reservations collection object or ID
  @param {date} startDate
    New reservation start date
  @param {date} endDate
    New reservation end date
**/
methods.changeReservationTime = function(reservation, startDate, endDate, apiSecret){
  if (!reservation._id){
    reservation = Reservations.findOne({_id:reservation});
  }
  if (conflictingReservationCount(reservation._id, reservation.resource._id, startDate, endDate)){
    throw new Meteor.Error('overlapping', 'Reservations cannot overlap.');
  }
  if (!(isOwner(reservation, apiSecret) || isAdmin(apiSecret))){
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
    return "Reservation " + reservation._id + " time was changed successfully.";
  }
}
externalizedMethods.changeReservationTime = [{name: "reservation", type: "String"},
                                             {name: "startDate", type: "Date"},
                                             {name: "endDate", type: "Date"}];

/**
  Cancel a reservation

  @param reservation
    Reservation collection object or ID
**/
methods.cancelReservation = function(reservation, apiSecret){
  var reservationId = getCollectionId(reservation);

  if (!(isOwner(reservation, apiSecret) || isAdmin(apiSecret))){
    //TODO: expand privileges
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }
  else{
    Reservations.update(reservationId, {
      $set: {
        cancelled: true
      }
    })
    return "Reservation " + reservationId + " was successfully cancelled."
  }
}
externalizedMethods.cancelReservation = [{name: "reservation", type: "String"}];


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
methods.createAccount = function(username, email, apiSecret){
  if (!currentUserOrWithKey(apiSecret)){
    //TODO: or not privileged
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }
  var accountId = Accounts.createUser({
    'username': username,
    'email': email
  });
  Accounts.sendEnrollmentEmail(accountId);
}
externalizedMethods.createAccount = [{name: "username", type: "String"},
                                         {name: "email", type: "email"}];

/**
@ignore

Find the API secret for a user, creating a new one if needed.

@param forceNew
  Generates a new key
**/
methods.getApiSecret = function(forceNew){
  if (!Meteor.user().api_secret || forceNew){
    var UUID = Meteor.uuid();
    Meteor.users.update(Meteor.userId(), {
      $set: {
        api_secret: UUID
      }
    });
    return UUID;
  }
  else{
    return Meteor.user().api_secret;
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
  if (reservationId){
    params._id = {
      $ne: reservationId
    }
  }
  var conflictingReservations = Reservations.find(params);
  return conflictingReservations.count();
}

/**
@ignore

Returns the user belonging to the provided apiKey, or the current user if no apiKey provided

@param apiSecret
  apiSecret for lookup
@param needObj
  whether the entire user object should be returned
*/
function currentUserOrWithKey(apiSecret, needObj){
  if (apiSecret){
    if (needObj){
      return Meteor.users.findOne({api_secret:apiSecret});
    }
    else{
      return Meteor.users.findOne({api_secret:apiSecret})._id;
    }
  }
  else{
    if (needObj){
      return Meteor.user();
    }
    return Meteor.userId();
  }
}

function isAdmin(apiSecret){
  var currentUser = currentUserOrWithKey(apiSecret, true);
  return currentUser.username == 'admin';
}

function isOwner(reservation, apiSecret){
  var currentUser = currentUserOrWithKey(apiSecret, true);

  if (!reservation._id){
    var reservation = Reservations.findOne({_id: reservation});
  }
  var found = false;
  for (var i = 0; i < reservation.owner_id.length; i++) {
    var ownerId = reservation.owner_id[i];
    if (ownerId == currentUser._id){
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
