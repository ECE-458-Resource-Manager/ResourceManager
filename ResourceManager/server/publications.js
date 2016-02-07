Meteor.publish('resources', function () {
    return Resources.find();
});

Meteor.publish('reservations', function () {
    return Reservations.find();
});

// filter-collections publication for the search page
FilterCollections.publish(Resources, {
    name: 'filter-collections-resources'
});