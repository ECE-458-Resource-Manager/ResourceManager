Meteor.publish('resources', function () {
	foundResources = Resources.find().fetch();
	var userId = this.userId;
	if (hasPermissionID("admin", userId) || hasPermissionID("manage-resources", userId)) {
		return Resources.find();
	}
	filteredResources = _.filter(foundResources, function(curResource) {
		return (hasPermissionID(curResource.view_permission, userId) || !curResource.view_permission);
	});
	filteredIds = _.map(filteredResources, function(resource){
		return resource._id;
	});
	return Resources.find({_id: { $in: filteredIds }});

});

Meteor.publish('reservations', function () {
	return Reservations.find();
});

// filter-collections publication for the search page
FilterCollections.publish(Resources, {
	name: 'filter-collections-resources',
	callbacks: {
    afterPublish: function(publicationtype, cursor, handler){
    	if(publicationtype == 'results'){
	    	foundResources = cursor.fetch();
	    	if (hasPermissionID("admin", handler.userId) || hasPermissionID("manage-resources", handler.userId)) {
				return cursor;
			}
			filteredResources = _.filter(foundResources, function(curResource) {
				return (hasPermissionID(curResource.view_permission, handler.userId) || !curResource.view_permission);
			});
			filteredIds = _.map(filteredResources, function(resource){
				return resource._id;
			});
			newSelector = _.extend(cursor._cursorDescription.selector, {_id: { $in: filteredIds }});
			return Resources.find(newSelector);
		}
		return cursor;
    }
  }
});

Meteor.publish('allUsers', function(){
	if (Roles.userIsInRole(this.userId, ['admin', 'manage-users'])) {
		return Meteor.users.find();
	} else {
		return [];
	}
});

Meteor.publish('groups', function(){
	var result = [];
	if (Roles.userIsInRole(this.userId, ['admin', 'manage-users'])) {
		return Groups.find();
	}
	return null;
});

Meteor.publish(null, function (){
  return Meteor.roles.find({})
})