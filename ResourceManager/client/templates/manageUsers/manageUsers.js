Template.manageUsers.helpers({
    allUsers: function () {
        return Meteor.users.find();
    },
    groups: function () {
    	return Groups.find();
    }
});

Template.groupItem.helpers({
    groupMembers: function () {
    	foundIDs = this.member_ids;
    	foundMembers = Meteor.users.find({ _id: { $in: foundIDs } });
    	return foundMembers.map(function(memberObj){
        	return memberObj.username;
        });
    }
});

Template.addUser.events({
	"submit form": function (event) {
		event.preventDefault();
		var username = event.target.newUsername.value;
		var email = event.target.newUserEmail.value;

		Meteor.call("createAccount", username, email, function(error){
			if(error) {
				console.log(error);
			}else {
				console.log("created new user account, " + username + ", with email " + email)
				// Clear form
				event.target.newUsername.value = "";
				event.target.newUserEmail.value = "";
			}
		});

		// Prevent default form submit
		return false;
	}
});

Template.manageUsers.events({
	"click .createGroupButton": function (event, template) {
		event.preventDefault();
		groupName = template.$("#newGroupNameInput")[0].value;
		Meteor.call('createGroup', groupName);
		template.$("#newGroupNameInput")[0].value = "";
		return false;
	},
});

Template.manageUsers.rendered = function() {
	$('ul.tabs').tabs();
}