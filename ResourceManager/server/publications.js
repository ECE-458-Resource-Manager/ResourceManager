Meteor.publish('resources', function () {
    return Resources.find();
});

Meteor.FilterCollections.publish(Resources, {
    name: 'resources_filter'
});
