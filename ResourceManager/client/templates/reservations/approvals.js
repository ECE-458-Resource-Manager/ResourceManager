Template.approvals.helpers({
    reservationsToApprove: function() {
    	console.log(Meteor.user())
        return Reservations.find({});
    }
});