var resources;
var resourcesKey = 'resourcesKey';

Template.createReservation.rendered = function () {
    resources = this.data;
    Session.set(resourcesKey, resources);

    $('#description_input').val(resources[0].name + ' reservation');

    // Date picker initialization
    $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15 // Creates a dropdown of 15 years to control year
    });
};

Template.createReservation.helpers({
    resources: function () {
        return Session.get(resourcesKey);
    }
});

Template.createReservation.events({
    'click #create_reservation_btn': function (e) {
        var title = $('#title_input').val();
        if (!title) {
            Materialize.toast('A title is required', 4000);
            return;
        }

        var description = $('#description_input').val();
        if (!description) {
            Materialize.toast('A description is required', 4000);
            return;
        }

        // Verify duration
        var startDate = $('#start_date_input').val();
        var startTime = $('#start_time_input').val();
        if ((!startDate) || (!startTime)) {
            Materialize.toast('Invalid start date/time', 4000);
            return;
        }
        var startDateObj = new Date(startDate+ ' ' +startTime);

        if (startDateObj < new Date()) {
            Materialize.toast('Start date/time can\'t be in the past', 4000);
            return;
        }

        var endDate = $('#end_date_input').val();
        var endTime = $('#end_time_input').val();
        if (!endDate || !endTime) {
            Materialize.toast('Invalid end date/time', 4000);
            return;
        }
        var endDateObj = new Date(endDate+ ' ' +endTime);

        if (endDateObj < startDateObj) {
            Materialize.toast('End date/time must be greater than start date/time', 4000);
            return;
        }

        // Create reservation
        Meteor.call('createReservation', resources, startDateObj, endDateObj, title, description, function (error, result) {
            if (error) {
                Materialize.toast(error.message, 4000);
            } else {
                Materialize.toast('Reservation created successfully.',4000);
                Router.go('myReservations');
            }
        });
    }
});
