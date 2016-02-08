var methods = {};



/**
  Query reservations given a resource

  @param resource
    A resource to find associated reservations
  @param startDate
    start date for query (JS date object)
  @param endDate
    end date for query (JS date object)
  @param returnQueryParams
    Returns the db query params instead of the processed data
**/
methods.queryReservations = function(resource, startDate, endDate, returnQueryParams){
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
  //we want to include the actual objects for some references
  for (var i = 0; i < reservationData.length; i++) {
    var reservation = reservationData[i]
    //TODO: send objects for all owners?
    reservation.owner = Meteor.users.findOne({_id:reservation.owner_id[0]});
    reservation.resource = resource;
  };
  return reservationData;
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
    throw new Meteor.Error('Error 401: Unauthorized', 'You are not authorized to perform that operation.');
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
  Create/enroll a new user account.
  Sends an email to the user linking to a page to set their password.
  **/
  methods.createAccount = function(username, email){
    if (!Meteor.userId()){
    //TODO: or not privileged
    throw new Meteor.Error('unauthorized', 'The user is not authorized to create a new user account.');
  }
  var accountId = Accounts.createUser({
    'username': username,
    'email': email
  });
  Accounts.sendEnrollmentEmail(accountId);
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
