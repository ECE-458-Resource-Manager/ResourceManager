Meteor.publish('resources', function () {
    return Resources.find();
});

Meteor.publish('reservations', function () {
    return Reservations.find();
});