Template.manageUsers.events({
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