ResourcesFilter = new FilterCollections(Resources, {
    template: 'search',
    name: 'filter-collections-resources', // should match publish name

    sort: {
        order: ['desc', 'asc'],
    },

    filters: {
        name: {title: 'Name'},
        tags: {title: 'Tags'},
        description: {title: 'Description'}
    }
});

Template.search.events({
    'input #search_entry': function (e) {
        // Store search entry in Session then run filters
        // Not using search methods (buggy)
        Session.set(searchEntryKey, e.target.value);
        runFilters();
    }
});

// Date picker initialization
Template.tagsFilter.rendered = function () {
    this.$('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15 // Creates a dropdown of 15 years to control year
    });
};


