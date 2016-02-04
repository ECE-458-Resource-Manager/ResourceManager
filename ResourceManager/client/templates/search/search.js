ResourceFilter = new FilterCollections(Resources, {
    name: 'resources_filter',
    template: 'search',
    filters: {
        name: {
            title: 'Name',
            operator: ['$regex', 'i'],
            condition: '$and',
            searchable: 'required'
        },
        tags: {
            title: 'Tags',
            operator: ['$regex', 'i'],
            condition: '$and',
            searchable: 'optional'
        }

    }
});
