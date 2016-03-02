selectedUserKey = 'selectedUser';

Template.editUser.rendered = function() {
	Session.set(selectedUserKey, this.data);
};

Template.editUser.helpers({
    userPermissions: function () {
        return Roles.getRolesForUser(this)
    },
    userGroups: function () {
    	return Groups.find({member_ids : this._id})
    }
});

Template.editUser.events({

	"click .addPermissionButton": function (event, template) {
		event.preventDefault();
		permissionName = template.$("#permissionNameInput")[0].value;
		Meteor.call('addPermissionForUser', Session.get(selectedUserKey), permissionName);
		template.$("#permissionNameInput")[0].value = "";
		return false;
	},

	"click .deletePermissionButton": function (event, template) {
		event.preventDefault();
		// console.log(event.target.parentElement.previousSibling.innerText);
		permissionName = event.target.parentElement.previousSibling.innerText; //this;
		Meteor.call('removePermissionForUser', Session.get(selectedUserKey), permissionName);
		return false;
	},

	"click .addGroupButton": function (event, template) {
		event.preventDefault();
		groupName = template.$("#joinGroupNameInput")[0].value;
		Meteor.call('addUserToGroup', Session.get(selectedUserKey)._id, groupName);
		template.$("#joinGroupNameInput")[0].value = "";
		return false;
	},

	"click .removeGroupButton": function (event, template) {
		event.preventDefault();
		// console.log(event.target.parentElement.previousSibling.innerText);
		groupName = event.target.parentElement.previousSibling.innerText; //this;
		Meteor.call('removeUserFromGroup', Session.get(selectedUserKey)._id, groupName);
		return false;
	}
});