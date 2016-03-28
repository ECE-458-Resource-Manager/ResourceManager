resourcesKey = 'resourcesKey';
canManageReservationKey = 'canManageReservationKey';
reservationTitleKey = 'reservationTitleKey';
reservationDescriptionKey = 'reservationDescriptionKey';

var reservation;

Template.reservation.rendered = function () {
    reservation = this.data;
    console.log(reservation);

    if (reservation.incomplete) {
        $("#reservationStatus").text("Pending Reservation");
    } else {
        $("#reservationStatus").text("Approved Reservation");
    }

    $("#owner_name").text(reservation.owner.username);
    $("#title").text(reservation.title);
    $("#description").text(reservation.description);
    $("#startDate").text(reservation.start_date);
    $("#endDate").text(reservation.end_date);

    Session.set(resourcesKey, reservation.resources);

    Meteor.call('canManageReservation', reservation, function (error, result) {
        Session.set(canManageReservationKey, result);
    });

    // Initialize modals
    $('.modal-trigger').leanModal();
};

Template.reservation.events({
    'change #reservation_title_entry': function (e) {
        Session.set(reservationTitleKey, e.target.value);
    },
    'click #save_reservation_title': function (e) {
        Meteor.call('changeReservationTitle', reservation, Session.get(reservationTitleKey), function (error, result) {
            if (error) {
                Materialize.toast(error.message, 4000);
            } else {
                Meteor._reload.reload();
            }
        });
    },
    'change #reservation_description_entry': function (e) {
        Session.set(reservationDescriptionKey, e.target.value);
    },
    'click #save_reservation_description': function (e) {
        Meteor.call('changeReservationDescription', reservation, Session.get(reservationDescriptionKey), function (error, result) {
            if (error) {
                Materialize.toast(error.message, 4000);
            } else {
                Meteor._reload.reload();
            }
        });
    },
    'click #approve_reservation': function (e) {
         Meteor.call('approveReservation', reservation, function(error, result) {
            if (error) {
                Materialize.toast(error.message, 4000);
            } else {
                Meteor._reload.reload();
            }
         });
    }
});

Template.reservation.helpers({
    resources: function () {
        return Session.get(resourcesKey);
    },
    canManageReservation: function () {
        return Session.get(canManageReservationKey);
    }
});

