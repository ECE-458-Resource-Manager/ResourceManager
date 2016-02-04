Meteor.publish('resources', function () {
    return Resources.find();
});


FilterCollections.publish(Resources, {
    name: 'resources_filter'
});
