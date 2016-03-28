resourcesKey = 'resourcesKey';
canManageReservationKey = 'canManageReservationKey';
reservationTitleKey = 'reservationTitleKey';
reservationDescriptionKey = 'reservationDescriptionKey';

var reservation;

Template.reservation.rendered = function () {
    reservation = this.data;

    if (reservation.incomplete) {
        $("#reservationStatus").text("Pending Reservation");
    } else {
        $("#reservationStatus").text("Approved Reservation");
    }

    $("#owner_name").text(reservation.owner.username);
    $("#title").text(reservation.title);
    $("#description").text(reservation.description);

    $("#start_date").text(reservation.start_date);
    $("#end_date").text(reservation.end_date);

    Session.set(resourcesKey, reservation.resources);

    Meteor.call('canManageReservation', reservation, function (error, result) {
        Session.set(canManageReservationKey, result);
    });

    // Initialize modals
    $('.modal-trigger').leanModal();

    // Date picker initialization
    this.$('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15 // Creates a dropdown of 15 years to control year
    });

    // Initialize tooltips
    $('.tooltipped').tooltip({delay: 50});

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
    'click #save_duration': function (e) {
        var startDate = $('#start_date_input').val();
        var startTime = $('#start_time_input').val();

        var startDateObj = validateStartDateTime(startDate, startTime);
        if (!startDateObj) return;

        var endDate = $('#end_date_input').val();
        var endTime = $('#end_time_input').val();

        var endDateObj = validateEndDateTime(endDate, endTime, startDateObj);
        if (!endDateObj) return;

        Meteor.call('changeReservationTime', reservation, startDateObj, endDateObj, function (error, result) {
            if (error) {
                Materialize.toast(error.message, 4000);
            } else {
                Meteor._reload.reload();
            }
        });
    },
    'click #extend_reservation_btn': function(e) {
        var resourceIds = reservation.resources[0]._id;
        for (var i=1; i < reservation.resources.length; i++) {
            resourceIds = resourceIds.concat(',',reservation.resources[i]._id);
        }
        Router.go('/createReservation/'+resourceIds);
    },

    'click #cancel_reservation_btn': function(e) {
        Meteor.call('cancelReservation', reservation, function (error, result) {
            if (error) {
                Materialize.toast(error.message, 4000);
            } else {
                Materialize.toast('Reservation cancelled successfully.',4000);
                Router.go('myReservations');
            }
        });
    },

    // TODO: Move to Sam's approval page
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


var validateEndDateTime = function (endDate, endTime, newStartDateObj) {
    if (!validateDateTime('End', endDate, endTime)) return false;

    var dateObj = new Date(endDate + ' ' + endTime);

    if (!(dateObj <= reservation.end_date)) {
        Materialize.toast('The new end date/time must be less than or equal to the old one', 4000);
        return false;
    }

    if (!(dateObj > newStartDateObj)) {
        Materialize.toast('The end date/time must be greater than the start date/time', 4000);
        return false;
    }

    return dateObj;
};

var validateStartDateTime = function (date, time) {
    if (!validateDateTime('Start', date, time)) return false;

    var dateObj = new Date(date + ' ' + time);

    if (!(dateObj >= reservation.start_date)) {
        Materialize.toast('The new start date/time must be greater than or equal to the old one', 4000);
        return false;
    }

    if (!(dateObj < reservation.end_date)) {
        Materialize.toast('The new start date/time must be less than the old end date/time', 4000);
        return false;
    }

    return dateObj;
};

var validateDateTime = function (type, date, time) {
    if (!date) {
        Materialize.toast(type + ' date required', 4000);
        return false;
    }

    if (!time) {
        Materialize.toast(type + ' time required', 4000);
        return false;
    }

    return true;
};

