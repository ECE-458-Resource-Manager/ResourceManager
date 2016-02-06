ResourcesFilter = new FilterCollections(Resources, {
    template: 'search',
    name: 'filter-collections-resources', // should match publish name
    sort: {
        order: ['desc', 'asc'],
        defaults: ['name','asc']
    },
    callbacks: {
        afterResults: function (cursor) {
            console.log('Results here!')
            //var alteredResults = cursor.fetch();
            //return alteredResults;
        }
    }
});

Template.search.events({
    'click .sort-button': function () {
        ResourcesFilter.sort.clear(true);
        console.log('Clicked sort');
    }
});