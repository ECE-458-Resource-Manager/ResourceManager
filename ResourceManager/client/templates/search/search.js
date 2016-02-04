ResourceFilter = new FilterCollections(Resources, {
    name: 'resources_filter',
    template: 'search',
    sort: {
        order: ['desc', 'asc'],
        defaults: [
            ['name', 'desc']
        ]
    },
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

    },
    pager: {
        options: [3, 6, 9, 12, 15],
        itemsPerPage: 3,
        currentPage: 1,
        showPages: 3,
    }
});
