ResourcesFilter = new FilterCollections(Resources, {
    template: 'search',
    name: 'filter-collections-resources', // should match publish name
    sort: {
        order: ['desc', 'asc'],
        defaults: ['name','asc']
    }
});