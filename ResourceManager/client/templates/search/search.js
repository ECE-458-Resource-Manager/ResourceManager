ResourceFilter = new Meteor.FilterCollections(Resources, {
    name: 'resources_filter',
    template: 'resourcesList',
    filters: {
        name: {
            title: 'Name match',
            operator: ['$regex', 'i'],
            condition: '$and',
            searchable: true
        },
        tags: {
            title: 'Tags',
            operator: ['$all'],
            condition: '$and',
            searchable: true
        }
    }
});
