resourcesKey = 'resourcesKey';
canManageReservationKey = 'canManageReservationKey';

Template.reservation.rendered = function () {
    var reservation = this.data;

    if (reservation.incomplete) {
        $("#reservationStatus").text("Pending Reservation");
    } else {
        $("#reservationStatus").text("Approved Reservation");
    }
    
    $("#title").text(reservation.title);
    $("#description").text(reservation.description);

    Session.set(resourcesKey, reservation.resources);

    $("#startDate").text(reservation.start_date);
    $("#endDate").text(reservation.end_date);

    Meteor.call('canManageReservation', reservation, function (error, result) {
        Session.set(canManageReservationKey, result);
    });
};

Template.reservation.helpers({
    resources: function() {
        return Session.get(resourcesKey);
    },
    canManageReservation: function() {
        return Session.get(canManageReservationKey);
    }
});

