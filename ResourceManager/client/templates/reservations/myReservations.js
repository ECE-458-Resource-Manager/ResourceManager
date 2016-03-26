incompleteReservationsKey = 'incompleteReservationsKey';
completeReservationsKey = 'completeReservationsKey';

Template.myReservations.helpers({
    incompleteReservations: function() {
        return Session.get(incompleteReservationsKey);
    },
    completeReservations: function() {
        return Session.get(completeReservationsKey);
    }
});

Template.myReservations.rendered = function() {
    // Do asynchronous loading of user's reservations
    Meteor.call('getIncompleteReservationsForUser', function (error, result) {
        Session.set(incompleteReservationsKey, result);
    });

    Meteor.call('getCompleteReservationsForUser', function (error, result) {
        Session.set(completeReservationsKey, result);
    });

    // Initialize tabs
    $('ul.tabs').tabs();
};
