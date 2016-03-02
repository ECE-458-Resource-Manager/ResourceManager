Template.userItem.helpers({
    userPermissions: function () {
        return Roles.getRolesForUser(this)
    },
    userGroups: function () {
        foundGroups = Groups.find({member_ids : this._id});
        return foundGroups.map(function(group){
        	return group.name;
        });
    }
});