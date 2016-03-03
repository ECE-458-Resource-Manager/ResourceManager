Meteor.publish('resources', function () {
	foundResources = Resources.find();
	return foundResources;
	// if (Meteor.call('hasPermission', "admin") || Meteor.call('hasPermission', "manage-resources")) {
	// 	return foundResources;
	// }
	// filteredResources = foundResources.filter(function(curResource) {
	// 	return Meteor.call('hasPermission', curResource.view_permission);
	// 	// return hasPermission(curResource.view_permission);
	// });
	// return filteredResources
});

Meteor.publish('reservations', function () {
	return Reservations.find();
});

// filter-collections publication for the search page
FilterCollections.publish(Resources, {
	name: 'filter-collections-resources'
});

Meteor.publish('allUsers', function(){
	var result = [];
	if (Roles.userIsInRole(this.userId, ['admin', 'manage-users'])) {
		return Meteor.users.find();
	}
	return null;
});

Meteor.publish('groups', function(){
	var result = [];
	if (Roles.userIsInRole(this.userId, ['admin', 'manage-users'])) {
		return Groups.find();
	}
	return null;
});