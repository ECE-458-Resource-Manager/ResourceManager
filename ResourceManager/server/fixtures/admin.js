// If no admin user exists, create one on startup

Meteor.startup(function () {
	var admin = Meteor.users.findOne({username: "admin"});
	if (!admin) {
		admin_id = Accounts.createUser({
			username: "admin",
			// email: "admin@test.com",
			password: "admin123",
		});
		Roles.addUsersToRoles(admin_id, ["admin"]);
	}
});