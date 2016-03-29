Template.approvals.helpers({
    reservationsToApprove: function() {
    	console.log(Meteor.user())

        var userID = Meteor.user()._id;

        if(Roles.userIsInRole(userID, ["admin", "manage-reservations"])){
        	return Reservations.find({incomplete: true, cancelled: false});
        }

    	var allPermissions = Roles.getRolesForUser(userID);
    	var params = {
        	approvers: {$in: allPermissions},
        	incomplete: true,
        	cancelled: false
    	}
   		
    	return Reservations.find(params);
    }
});

Template.reservationApprovalItem.events({
	"click .approveButton": function (event, template) {
		event.preventDefault();

		console.log(this);
		console.log(this.approvers);

		// TODO: Check if need to notify about other reservations being cancelled
		Meteor.call('approveReservation', this._id);
		return false;
	},

	"click .denyButton": function (event, template) {
		event.preventDefault();

		// TODO: Notify user about reason for cancellation
		Meteor.call('denyReservation', this._id);
		return false;
	},
});