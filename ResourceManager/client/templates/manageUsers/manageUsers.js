Template.manageUsers.helpers({
    allUsers: function () {
        return Meteor.users.find();
    },
    groups: function () {
    	return Groups.find();
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

Template.addGroup.events({
	"submit form": function (event) {
		event.preventDefault();
		var name = event.target.groupName.value;

		Meteor.call("createGroup", name, function(error){
			if(error) {
				console.log(error);
			}else {
				console.log("created new group, " + name)
				// Clear form
				event.target.groupName.value = "";
			}
		});

		// Prevent default form submit
		return false;
	}
});

Template.manageUsers.rendered = function() {
	$('ul.tabs').tabs();
}