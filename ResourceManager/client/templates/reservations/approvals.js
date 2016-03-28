Template.approvals.helpers({
    reservationsToApprove: function() {
    	console.log(Meteor.user())

        var userID = Meteor.user()._id;

        if(Roles.userIsInRole(userID, ["admin", "manage-reservations"])){
        	return Reservations.find({incomplete: true});
        }

    	var allPermissions = Roles.getRolesForUser(userID);
    	var params = {
        	approvers: {$in: allPermissions},
        	incomplete: true
    	}
   		
    	return Reservations.find(params);
    }
});