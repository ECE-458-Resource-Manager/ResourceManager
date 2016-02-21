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
    // Note how filterResources() isn't called explicitly
    // It is invoked automatically when data it depends on is changed

    'change #start_date': function (e) {
        Session.set(startDateKey, e.target.value);
    },
    'change #end_date': function (e) {
        Session.set(endDateKey, e.target.value);
    },
    'input #start_time': function (e) {
        Session.set(startTimeKey, e.target.value);
    },
    'input #end_time': function (e) {
        Session.set(endTimeKey, e.target.value);
    },
    'input #search_entry': function (e) {
        Session.set(searchEntryKey, e.target.value);
    }
});

// Date picker initialization
Template.search.rendered = function () {
    this.$('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15 // Creates a dropdown of 15 years to control year
    });
};

Template.search.helpers({
    filteredFcResults: function () {
        return Session.get(filteredFcResultsKey);
    }
});
