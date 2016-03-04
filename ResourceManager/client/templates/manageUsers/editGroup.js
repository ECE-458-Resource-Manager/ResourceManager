selectedGroupKey = 'selectedGroup';

Template.editGroup.rendered = function() {
	Session.set(selectedGroupKey, this.data);
};

Template.editGroup.helpers({
    groupPermissions: function () {
        return Groups.findOne({name: this.name}).roles;
    },
    groupMembers: function () {
    	foundIDs = Groups.findOne({name: this.name}).member_ids;
    	foundMembers = Meteor.users.find({ _id: { $in: foundIDs } });
    	return foundMembers.map(function(memberObj){
        	return memberObj.username;
        });
    }
});

Template.editGroup.events({

	"click .addPermissionButton": function (event, template) {
		event.preventDefault();
		permissionName = template.$("#permissionNameInput")[0].value;
		Meteor.call('addPermissionForGroup', Session.get(selectedGroupKey).name, permissionName);
		template.$("#permissionNameInput")[0].value = "";
		return false;
	},

	"click .deletePermissionButton": function (event, template) {
		event.preventDefault();
		// console.log(event.target.parentElement.previousSibling.innerText);
		permissionName = event.target.parentElement.previousSibling.innerText; //this;
		Meteor.call('removePermissionForGroup', Session.get(selectedGroupKey).name, permissionName);
		return false;
	},

	"click .addMemberButton": function (event, template) {
		event.preventDefault();
		newMemberName = template.$("#newMemberNameInput")[0].value;
		newMemberID = Meteor.users.findOne({username: newMemberName})._id;
		Meteor.call('addUserToGroup', newMemberID, Session.get(selectedGroupKey).name);
		template.$("#newMemberNameInput")[0].value = "";
		return false;
	},

	"click .removeMemberButton": function (event, template) {
		event.preventDefault();
		// console.log(event.target.parentElement.previousSibling.innerText);
		memberName = event.target.parentElement.previousSibling.innerText; //this;
		memberID = Meteor.users.findOne({username: memberName})._id;
		Meteor.call('removeUserFromGroup', memberID, Session.get(selectedGroupKey).name);
		return false;
	}
});