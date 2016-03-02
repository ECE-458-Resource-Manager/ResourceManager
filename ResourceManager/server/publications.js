Meteor.publish('resources', function () {
	return Resources.find();
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