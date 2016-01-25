// If no admin user exists, create one on startup

Meteor.startup(function () {
	var admin = Meteor.users.findOne({username: "admin"});
	if (!admin) {
		Accounts.createUser({
			username: "admin",
			// email: "admin@test.com",
			password: "admin123",
		});
	}
});