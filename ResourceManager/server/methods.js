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
methods.addResource = function(name, description, viewPermission, reservePermission, approvePermission, tags, apiSecret){
  if (!isAdmin(apiSecret) || hasPermission("manage-resources")){
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }
  return Resources.insert({
    name: name,
    description: description,
    view_permission: viewPermission,
    reserve_permission: reservePermission,
    approve_permission: [approvePermission],
    tags: tags
  });
}
externalizedMethods.addResource = [{name: "name", type: "String"},
                                   {name: "description", type: "String"},
                                   {name: "viewPermission", type: "String"},
                                   {name: "reservePermission", type: "String"},
                                   {name: "approvePermission", type: "String"},
                                   {name: "tags", type: "Array"}];

/**
  Modify a resource

  @param {string} resource
    Resource collection object or ID to modify 
  @param name
    Name for the resource
  @param description
    Description for the resource
  @param {array} tags
    Tags to associate with the resource, as a comma-separated array of strings
*/
methods.modifyResource = function(resource, name, description, viewPermission, reservePermission, approvePermission, tags, apiSecret){
  if (!(isAdmin(apiSecret) || hasPermission("manage-resources"))){
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }
  var resourceId = getCollectionId(resource);
  return Resources.update(
    {_id: resourceId},
    { $set:{
      _id: resourceId,
      name: name,
      description: description,
      view_permission: viewPermission,
      reserve_permission: reservePermission,
      approve_permission: [approvePermission],
      tags: tags
    }},
  );
}
externalizedMethods.modifyResource = [{name: "resource", type: "String"},
                                     {name: "name", type: "String"},
                                     {name: "description", type: "String"},
                                     {name: "viewPermission", type: "String"},
                                     {name: "reservePermission", type: "String"},
                                     {name: "approvePermission", type: "String"},
                                     {name: "tags", type: "Array"}];


/**
  Delete a resource

  @param {string} resource
    Resource collection object or ID to delete
*/
methods.removeResource = function(resource, apiSecret){
  if (!(isAdmin(apiSecret) || hasPermission("manage-resources"))){
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }
  var resourceId = getCollectionId(resource);
  return Resources.remove({_id: resourceId});
}
externalizedMethods.removeResource = [{name: "resource", type: "String"}];



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
    A comma separated listing of resource IDs to find associated reservations
  @param {date} startDate
    Start date for query
  @param {date} endDate (optional)
    End date for query

*/
methods.queryReservations = function(resources, startDate, endDate){
  return methods.queryReservationsWithListener(resources, startDate, endDate, false);
}
externalizedMethods.queryReservations = [{name: "resources", type: "String"}, 
                                         {name: "startDate", type: "Date"},
                                         {name: "endDate", type: "Date"}];

/**
  @ignore

  See queryReservations, this includes the option to return the query paramaters used by the calendar change listener.
*/
methods.queryReservationsWithListener = function(resources, startDate, endDate, returnQueryParams){
  var resourceIds = getCollectionIds(resources);

  var params = {
    resource_ids: {$in: resourceIds},
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
methods.getReservationStream = function(resources, startDate, endDate){

  var reservationData = methods.queryReservations(resources, startDate, endDate);
  var calendarEventObjects = [];

  for (var i = 0; i < reservationData.length; i++) {
    var reservation = reservationData[i]
    //console.log("Have knowledge of this res (server-side): ");
    //console.log(reservation);
    calendarEventObjects.push(buildCalObject(reservation));
  };
  return calendarEventObjects;
}

/**
  Create a reservation

  @param resources
    Resource objects or IDs, as array or CSV
  @param {date} startDate
    New reservation start date
  @param {date} endDate
    New reservation end date
**/
methods.createReservation = function(resources, startDate, endDate, title, description, apiSecret){
  var resourceIds = getCollectionIds(resources);
  var userId = currentUserOrWithKey(apiSecret, false);
  //console.log("________________________CREATING RESERVATION______________________");
  //console.log("This reservation contains " + resourceIds.length + " resources");
  //console.log("All resources in this reservation (server-side): " + resourceIds);
  var conflictCheck = conflictingReservationCheck(null, resourceIds, startDate, endDate)
  if (conflictCheck != ''){
    throw new Meteor.Error('overlapping', conflictCheck);
  }
  else if (!userId){
    //TODO: or not privileged
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }


  var approverGroup =  [];
  var needsApproval = false;
  //Check if any resources requires approval, if so return 'incomplete' reservation
  for (var i = 0; i < resourceIds.length; i++) {
    //console.log("Attempting to check if the following resource needs approval");
    var resourceId = resourceIds[i];
    var currentResource = Resources.findOne(resourceId);
    console.log(currentResource);
    //console.log("------------------------------------------------------------");
    if (currentResource.approve_permission != null){
      needsApproval = true;
      for(var j = 0; j < currentResource.approve_permission.length; j++) {
          var currentApprovePermission = currentResource.approve_permission[j];
          if(approverGroup.indexOf(currentApprovePermission) == -1) {
              approverGroup.push(currentApprovePermission);
              //console.log("Reservation needs approval: " + currentApprovePermission);
          }
      }
    }
  }
  //console.log("_________________________________________________________________________________________________");
  
  
  if (!(hasPermission("admin", apiSecret) || hasPermission("manage-reservations", apiSecret) || hasPermission(currentResource.reserve_permission, apiSecret))){
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }
  else{
      return Reservations.insert({
        owner_id: [userId],
        attending_user_id: [userId],
        resource_ids: resourceIds,
        start_date: startDate,
        end_date: endDate,
        cancelled: false,
        reminder_sent: false,
        title: title,
        description: description,
        incomplete: needsApproval,
        approvers: approverGroup
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
  if (conflictingReservationCount(reservation._id, reservation.resource_ids, startDate, endDate)){
    throw new Meteor.Error('overlapping', 'Reservations cannot overlap.');
  }

  if (!methods.canManageReservation(reservation, apiSecret)) {
      throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }

  if (!isOwner(reservation, apiSecret)) {
      return changeReservationTimeHelper(reservation, startDate, endDate);
  }

  // is owner
  if (isReduction(startDate, endDate, reservation.start_date, reservation.end_date)) {
      return changeReservationTimeHelper(reservation, startDate, endDate);
  } else if (isExtension(startDate, endDate, reservation.start_date, reservation.end_date)) {
      methods.createReservation(reservation.resource_ids, reservation.end_date, endDate, reservation.title, reservation.description)
  } else {
      throw new Meteor.Error('unauthorized', 'Extending a reservation is done by changing the end date/time, not the start.');
  }
};

externalizedMethods.changeReservationTime = [{name: "reservation", type: "String"},
                                             {name: "startDate", type: "Date"},
                                             {name: "endDate", type: "Date"}];

function changeReservationTimeHelper(reservation, startDate, endDate) {
    return Reservations.update(reservation._id, {
        $set: {
            start_date: startDate,
            end_date: endDate
        }
    });
}

function isReduction(newStartDate, newEndDate, oldStartDate, oldEndDate) {
    return (oldStartDate <= newStartDate) || (newEndDate <= oldEndDate);
}

function isExtension(newStartDate, newEndDate, oldStartDate, oldEndDate) {
    return (oldStartDate == newStartDate) && (oldEndDate < newEndDate);
}

/**
  Cancel a reservation

  @param reservation
    Reservation collection object or ID
**/
methods.cancelReservation = function(reservation, apiSecret){
  var reservationId = getCollectionId(reservation);

  if (!methods.canManageReservation(reservation, apiSecret)){
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
externalizedMethods.cancelReservation = [{name: "reservation", type: "String"}];


/**
 * Updates a reservation's title
 * @param reservation Reservation collection object or id
 * @param title New title
 */
methods.changeReservationTitle = function(reservation, title, apiSecret) {
  if (!reservation._id){
    reservation = Reservations.findOne({_id:reservation});
  }

  if (!(methods.canManageReservation(reservation,apiSecret))){
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  } else{
    return Reservations.update(reservation._id, {
      $set: {
        title: title
      }
    });
  }
};

/**
 * Updates a reservation's description
 * @param reservation Reservation collection object or id
 * @param description New description
 */
methods.changeReservationDescription = function(reservation, description, apiSecret) {
  if (!reservation._id){
    reservation = Reservations.findOne({_id:reservation});
  }

  if (!(methods.canManageReservation(reservation,apiSecret))){
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  } else{
    return Reservations.update(reservation._id, {
      $set: {
        description: description
      }
    });
  }
};

/**
 * Check whether the current user can manage the given reservation
 * @param reservation Reservation collection object or id
 */
methods.canManageReservation = function(reservation, apiSecret) {
  if (!reservation._id){
    reservation = Reservations.findOne({_id:reservation});
  }

  return isOwner(reservation, apiSecret) || isAdmin(apiSecret) || hasPermission("manage-reservations", apiSecret);
};


/**
 * Get incomplete reservations for user
 */
methods.getIncompleteReservationsForUser = function(apiSecret) {
  return methods.getReservationsForUser(true, apiSecret);
};

externalizedMethods.getIncompleteReservationsForUser = [];

/**
 * Get complete reservations for user
 */
methods.getCompleteReservationsForUser = function(apiSecret) {
  return methods.getReservationsForUser(false, apiSecret);
};

externalizedMethods.getCompleteReservationsForUser = [];

/**
 * Get reservations for user
 * @param isIncomplete set true to return incomplete reservations or false to return complete reservations
 */
methods.getReservationsForUser = function(isIncomplete, apiSecret){
  var userId = currentUserOrWithKey(apiSecret, false);

  if (!userId) {
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  } else {
    var params = {
      owner_id: userId,
      cancelled: false,
      incomplete: isIncomplete
    };
    return Reservations.find(params).fetch();
  }
};


methods.getReservationsForApprover = function(isIncomplete, apiSecret) {
    var userID = currentUserOrWithKey(apiSecret, false);
    var allPermissions = Roles.getRolesForUser(userID);
    var params = {
        approvers: {$in: allPermissions},
        incomplete: isIncomplete
    }
   
    return Reservations.find(params).fetch();
}

/**
 * Send approval for a particular reservation
 */
methods.approveReservation = function(reservation, apiSecret) {
  return approveOrDenyReservation(reservation, true, apiSecret);
}

/**
* Deny a particular reservation
*/
methods.denyReservation = function(reservation, apiSecret){
  return approveOrDenyReservation(reservation, false, apiSecret);
}

var approveOrDenyReservation = function(reservation, approve, apiSecret){
  var userID = currentUserOrWithKey(apiSecret, false);
  if (!reservation._id){
      reservation = Reservations.findOne({_id:reservation});
  }
  var allMyPermissions = Roles.getRolesForUser(userID);
  var approvalsNeeded = reservation.approvers;
  var isNotApprover = true;
  for( var i = 0; i < allMyPermissions.length; i++) {
      var index = approvalsNeeded.indexOf(allMyPermissions[i]);
      if(index > -1) {
          isNotApprover = false;
          if (approve){
            approvalsNeeded.splice(index, 1);
            var conflicts = conflictingReservationsNoValids(reservation._id, reservation.resource_ids, reservation.start_date, reservation.end_date);
            //console.log("Number of conflicts: " + conflicts.length);
            for(var n = 0; n < conflicts.length; n++) {
                //console.log("Cancel" + conflicts[n].title);
                approveOrDenyReservation(conflicts[n], false);
            }
          }
      } else if (allMyPermissions[i] == 'admin' || allMyPermissions[i] == 'manage-reservations'){
        isNotApprover = false;
          if (approve){
            approvalsNeeded.splice(0);
            var conflicts = conflictingReservationsNoValids(reservation._id, reservation.resource_ids, reservation.start_date, reservation.end_date);
            //console.log("Number of conflicts: " + conflicts.length);
            for(var n = 0; n < conflicts.length; n++) {
                //console.log("Cancel" + conflicts[n].title);
                approveOrDenyReservation(conflicts[n], false);
            }
          }
      }
  }
  var isIncomplete = !(typeof approvalsNeeded === undefined) && (approvalsNeeded.length > 0);
  if(isNotApprover) {
      //ERROR: user is not approver
      throw new Meteor.Error('unauthorized', 'You are not an approver of this reservation.');
  }
  if (approve){
    return Reservations.update(reservation._id, {
      $set: {
          approvers: approvalsNeeded,
          incomplete: isIncomplete
      }
    });
  }
  else{
    //send an email about the denial
    var recipient = "nobody@resourcereserve.xyz";
    if(reservation.owner.emails) {
        recipient = reservation.owner.emails[0].address;
    }
    Email.send({
      to: recipient,
      from: 'noreply@resourcereserve.xyz',
      subject: 'Your reservation '+reservation.title+' was denied.',
      text: 'Your reservation request '+reservation.title+' was denied.\n You requested this reservation from '+moment(reservation.start_date).format("ddd, MMM Do YYYY, h:mm a")+' to '+moment(reservation.end_date).format("ddd, MMM Do YYYY, h:mm a")+'.'
    });
    return Reservations.update(reservation._id, {
      $set: {
          cancelled: true
      }
    });    
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
methods.createAccount = function(username, email, apiSecret){
  if (!currentUserOrWithKey(apiSecret)){
    //TODO: or not privileged
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }

  if (!(hasPermission("admin", apiSecret) || hasPermission("manage-users", apiSecret))){
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
Create a new group.
Creates a new group for shared user permissions.

@param groupName
  Name for new group
**/
methods.createGroup = function(groupName, apiSecret){
  if (!currentUserOrWithKey(apiSecret)){
    //TODO: or not privileged
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }

  if (!(hasPermission("admin", apiSecret) || hasPermission("manage-users", apiSecret))){
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }

  return Groups.insert({
    name: groupName,
    roles: [groupName],
    member_ids: []
  });
}
externalizedMethods.createGroup = [{name: "groupName", type: "String"}];

/**
Add a new permission string to a user

@param user_id
  User to apply the permission to
@param permissionName
  Name for new permission
**/
methods.addPermissionForUser = function(user_id, permissionName, apiSecret){
  if (!currentUserOrWithKey(apiSecret)){
    //TODO: or not privileged
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }

  if (!(hasPermission("admin", apiSecret) || hasPermission("manage-users", apiSecret))){
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }

  Roles.addUsersToRoles(user_id, permissionName);
  return true;
}
externalizedMethods.addPermissionForUser = [{name: "user_id", type: "String"},
                                            {name: "permissionName", type: "String"}];

/**
Remove a permission string from a user

@param user_id
  User to remove the permission from
@param permissionName
  Name for permission to remove
**/
methods.removePermissionForUser = function(user_id, permissionName, apiSecret){
  if (!currentUserOrWithKey(apiSecret)){
    //TODO: or not privileged
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }

  if (!(hasPermission("admin", apiSecret) || hasPermission("manage-users", apiSecret))){
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }

  Roles.removeUsersFromRoles(user_id, permissionName);
  return true;
}
externalizedMethods.removePermissionForUser = [{name: "user_id", type: "String"},
                                               {name: "permissionName", type: "String"}];

/**
Add a user to a specified group

@param user_id
  User to be added to a group
@param groupName
  Name of group to add user to
**/
methods.addUserToGroup = function(user_id, groupName, apiSecret){
  if (!currentUserOrWithKey(apiSecret)){
    //TODO: or not privileged
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }

  if (!(hasPermission("admin", apiSecret) || hasPermission("manage-users", apiSecret))){
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }

  foundGroup = Groups.findOne({name: groupName});
  if (!foundGroup){
    throw new Meteor.Error('invalid group name', 'No group exists with that name.');
  }

  Groups.update(
    { name: groupName },
    { $push: { member_ids: user_id } }
  );
  return true;
}
externalizedMethods.addUserToGroup = [{name: "user_id", type: "String"},
                                      {name: "groupName", type: "String"}];

/**
Remove a user from a specified group

@param user_id
  User to be removed from a group
@param groupName
  Name of group to remove user from
**/
methods.removeUserFromGroup = function(user_id, groupName, apiSecret){
  if (!currentUserOrWithKey(apiSecret)){
    //TODO: or not privileged
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }

  if (!(hasPermission("admin", apiSecret) || hasPermission("manage-users", apiSecret))){
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }

  foundGroup = Groups.findOne({name: groupName});
  if (!foundGroup){
    throw new Meteor.Error('invalid group name', 'No group exists with that name.');
  }

  Groups.update(
    { name: groupName },
    { $pull: { member_ids: user_id } }
  );
  return true;
}
externalizedMethods.removeUserFromGroup = [{name: "user_id", type: "String"},
                                           {name: "groupName", type: "String"}];

/**
Adds a permission to a group

@param groupName
  Name of group to add permission to
@param permissionName
  Name of permission to be added to the group
**/
methods.addPermissionForGroup = function(groupName, permissionName, apiSecret){
  if (!currentUserOrWithKey(apiSecret)){
    //TODO: or not privileged
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }

  if (!(hasPermission("admin", apiSecret) || hasPermission("manage-users", apiSecret))){
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }

  foundGroup = Groups.findOne({name: groupName});
  if (!foundGroup){
    throw new Meteor.Error('invalid group name', 'No group exists with that name.');
  }

  Groups.update(
    { name: groupName },
    { $push: { roles: permissionName } }
  );
  return true;
}
externalizedMethods.addPermissionForGroup = [{name: "groupName", type: "String"},
                                                {name: "permissionName", type: "String"}];

/**
Adds a permission to a group

@param groupName
  Name of group to remove permission from
@param permissionName
  Name of permission to be removed from the group
**/
methods.removePermissionForGroup = function(groupName, permissionName, apiSecret){
  if (!currentUserOrWithKey(apiSecret)){
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }

  if (!(hasPermission("admin", apiSecret) || hasPermission("manage-users", apiSecret))){
    throw new Meteor.Error('unauthorized', 'You are not authorized to perform that operation.');
  }

  foundGroup = Groups.findOne({name: groupName});
  if (!foundGroup){
    throw new Meteor.Error('invalid group name', 'No group exists with that name.');
  }

  Groups.update(
    { name: groupName },
    { $pull: { roles: permissionName } }
  );
  return true;
}
externalizedMethods.removePermissionForGroup = [{name: "groupName", type: "String"},
                                                {name: "permissionName", type: "String"}];

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


// TODO (allan): Find better way of doing oauth that doesn't involve assigning passwords to each NetId user
// Password constant for all NetId users
var netIdUserPassword = 'viCI0wBz534Vy41rw2WPzlExJn2EAFAtEeN4GoCb';

/**
 * Synchronously gets the user's NetId from the Duke Oauth server and returns credentials for the client to use for signing in.
 * The call to the Duke Oauth server must be done on server side to avoid the CORS 'Access-Control-Allow-Origin' error)
 * @param accessToken Oauth Access token obtained from Duke server
 * @returns {{email: *, password: string}}
 */
methods.getNetIdSignInCredentials = function(accessToken){
  var result = HTTP.call('GET', 'https://oauth.oit.duke.edu/oauth/resource.php?access_token=' + accessToken, {});
  var netIdEmail = JSON.parse(result.content).eppn;

  if (!Accounts.findUserByEmail(netIdEmail)) {
    Accounts.createUser({
      username: netIdEmail,
      email: netIdEmail,
      password: netIdUserPassword,
      profile: {}
    });
  }

  return {email: netIdEmail, password: netIdUserPassword};
};

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
  if (reservation.description){
    labelString = "Description: " + reservation.description + "\n\n" + labelString;
  }
  if (reservation.title){
    labelString = "Title: " + reservation.title + "\n" + labelString;
  }
  labelString += "\nResources:\n"
  for (var i = 0; i < reservation.resources.length; i++) {
    var resource = reservation.resources[i];
    labelString += resource.name + '\n';
  };
  calObject.title = labelString
  calObject.start = reservation.start_date
  calObject.reservation = reservation
  calObject.end = reservation.end_date
  calObject.incomplete = reservation.incomplete
  return calObject
}

/**
@ignore

Find the conflicting reservations given a resource and a start and end date, with an optional reservation to ignore.
This is default behavior and does not count 

@oaram reservationId
  Reservation ID to ignore as a conflict (optional)
@param resourceIds
  Resource IDs to check for conflicting reservations
@param {date} startDate
  Start date to check for conflicts
@param {date} endDate
  End date to check for conflicts
*/
function conflictingReservations(reservationId, resourceIds, startDate, endDate){
  return conflictingReservationCheckWithMessage(reservationId, resourceIds, startDate, endDate, false, true);
}

function conflictingReservationsNoValids(reservationId, resourceIds, startDate, endDate){
  return conflictingReservationCheckWithMessage(reservationId, resourceIds, startDate, endDate, false, false);
}

/**
Additional conflicting reservation method for returning conflict message, ReservationCount returns number of conflicts
*/
function conflictingReservationCheck(reservationId, resourceIds, startDate, endDate){
  return conflictingReservationCheckWithMessage(reservationId, resourceIds, startDate, endDate, true, true);
}

/**
Core conflict method which both above methods use, one returns count of conflicts the other returns the conflict message
*/
function conflictingReservationCheckWithMessage(reservationId, resourceIds, startDate, endDate, shouldReturnMessage, omitValids){
  //check for a conflicting reservation
  var params = {
    resource_ids: {$in: resourceIds},
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
  var conflictMessage = "Reservations cannot overlap."
  var conflictingReservations = Reservations.find(params).fetch();
  for (var i = conflictingReservations.length - 1; i >= 0; i--) {
    var reservation = conflictingReservations[i];
    if (reservation.incomplete){
      var validOversubscription = true;
      for (var j = resourceIds.length - 1; j >= 0; j--) {
        var resource = Resources.findOne(resourceIds[j]);
        //oversubscription is not valid if unrestricted resources exist in both conflicting and current reservation
        if ((reservation.resource_ids.indexOf(resourceIds[j]) != -1) && (!resource.approve_permission || !resource.approve_permission.length)){
          conflictMessage = "One or more unrestricted resources you requested are part of a pending reservation and are on hold.  Please try again later."
          validOversubscription = false;
        }
      };
      if (validOversubscription && omitValids){
        conflictingReservations.splice(i, 1);
      }
    }
  };
  if (shouldReturnMessage){
    return conflictingReservations.length ? conflictMessage : "";
  }
  return conflictingReservations;
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
    return Meteor.user()._id;
  }
}

function isAdmin(apiSecret){
  return hasPermission("admin", apiSecret);
  // var currentUser = currentUserOrWithKey(apiSecret, true);
  // return currentUser.username == 'admin';
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

hasPermission = function(permissionName, apiSecret){
  var currentUser = currentUserOrWithKey(apiSecret, false);
  if (Roles.userIsInRole(currentUser, permissionName)){
    return true;
  }
  userGroups = Groups.find({member_ids : currentUser}).fetch();
  for (i = 0; i < userGroups.length; i++) { 
    var curGroupRoles = userGroups[i].roles;
    if (curGroupRoles.indexOf(permissionName) > -1){
      return true;
    }
  }
  return false;
}

hasPermissionID = function(permissionName, user_id){
  console.log("checking permission: " + permissionName + " for id: " + user_id);
  if (Roles.userIsInRole(user_id, permissionName)){
    console.log("Allowed. User has correct permission.")
    return true;
  }
  userGroups = Groups.find({member_ids : user_id}).fetch();
  for (i = 0; i < userGroups.length; i++) { 
    var curGroupRoles = userGroups[i].roles;
    if (curGroupRoles.indexOf(permissionName) > -1){
      console.log("Allowed. User is a member of a group with correct permission.")
      return true;
    }
  }
  console.log("Denied.")
  return false;
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
  if (item) {
    if(item._id){
      return item._id;
    }
  }
  return item;
}

/**
@ignore

Return the collection IDs, whether given the IDs, the objects, or CSV
*/
getCollectionIds = function(items){
  //see if we are dealing with a single string (CSV) via API
  if (typeof items === 'string'){
    items = items.split(',');
  }
  var newItems = [];
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    newItems.push(getCollectionId(item));
  };
  return newItems;
}


//pass methods to Meteor.methods
Meteor.methods(methods);
