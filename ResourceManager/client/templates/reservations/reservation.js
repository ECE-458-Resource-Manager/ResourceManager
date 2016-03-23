reservationsKey = 'reservationsKey';

Template.reservation.rendered = function () {
    var reservation = this.data;

    if (reservation.incomplete) {
        $("#reservationStatus").text("Pending Reservation");
    } else {
        $("#reservationStatus").text("Approved Reservation");
    }
    
    $("#title").text(reservation.title);
    $("#description").text(reservation.description);

    Session.set(reservationsKey, reservation.resources);

    $("#startDate").text(reservation.start_date);
    $("#endDate").text(reservation.end_date);

};

Template.reservation.helpers({
    resources: function() {
        return Session.get(reservationsKey);
    }
});

