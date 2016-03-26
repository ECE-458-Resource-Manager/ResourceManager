selectedUserKey = 'selectedUser';

Template.editUser.rendered = function() {
	Session.set(selectedUserKey, this.data);
	updatePermissionCheckboxes();
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
		Meteor.call('addPermissionForUser', Session.get(selectedUserKey), permissionName, function(){
			updatePermissionCheckboxes();
		});
		template.$("#permissionNameInput")[0].value = "";
		return false;
	},

	"click .deletePermissionButton": function (event, template) {
		event.preventDefault();
		// console.log(event.target.parentElement.previousSibling.innerText);
		permissionName = event.target.parentElement.previousSibling.innerText; //this;
		Meteor.call('removePermissionForUser', Session.get(selectedUserKey), permissionName, function(){
			updatePermissionCheckboxes();
		});
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
	},

	"change #admin_checkbox": function (event, template) {
		event.preventDefault();
		permissionName = "admin";
		newState = event.target.checked;
		if(newState){
			Meteor.call('addPermissionForUser', Session.get(selectedUserKey), permissionName);
		}
		else{
			Meteor.call('removePermissionForUser', Session.get(selectedUserKey), permissionName);
		}
		return false;
	},

	"change #manage_users_checkbox": function (event, template) {
		event.preventDefault();
		permissionName = "manage-users";
		newState = event.target.checked;
		if(newState){
			Meteor.call('addPermissionForUser', Session.get(selectedUserKey), permissionName);
		}
		else{
			Meteor.call('removePermissionForUser', Session.get(selectedUserKey), permissionName);
		}
		return false;
	},

	"change #manage_resources_checkbox": function (event, template) {
		event.preventDefault();
		permissionName = "manage-resources";
		newState = event.target.checked;
		if(newState){
			Meteor.call('addPermissionForUser', Session.get(selectedUserKey), permissionName);
		}
		else{
			Meteor.call('removePermissionForUser', Session.get(selectedUserKey), permissionName);
		}
		return false;
	},

	"change #manage_reservations_checkbox": function (event, template) {
		event.preventDefault();
		permissionName = "manage-reservations";
		newState = event.target.checked;
		if(newState){
			Meteor.call('addPermissionForUser', Session.get(selectedUserKey), permissionName);
		}
		else{
			Meteor.call('removePermissionForUser', Session.get(selectedUserKey), permissionName);
		}
		return false;
	}
});

function updatePermissionCheckboxes() {
	userRoles = Roles.getRolesForUser(Meteor.users.findOne(Session.get(selectedUserKey)._id));
	$("#admin_checkbox")[0].checked = _.contains(userRoles, "admin");
	$("#manage_users_checkbox")[0].checked = _.contains(userRoles, "manage-users");
	$("#manage_resources_checkbox")[0].checked = _.contains(userRoles, "manage-resources");
	$("#manage_reservations_checkbox")[0].checked = _.contains(userRoles, "manage-reservations");
}

Template.editUser.events({
    'click .selected-permission': function (e, template) {
        template.$("#permissionNameInput")[0].value = e.target.innerText;
    },
});