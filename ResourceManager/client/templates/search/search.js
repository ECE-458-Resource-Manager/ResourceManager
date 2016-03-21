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
    'change #start_date': function (e) {
        Session.set(startDateKey, e.target.value);
        filterResources();
    },
    'change #end_date': function (e) {
        Session.set(endDateKey, e.target.value);
        filterResources();
    },
    'input #start_time': function (e) {
        Session.set(startTimeKey, e.target.value);
        filterResources();
    },
    'input #end_time': function (e) {
        Session.set(endTimeKey, e.target.value);
        filterResources();
    },
    'input #search_entry': function (e) {
        Session.set(searchEntryKey, e.target.value);
        filterResources();
    },
    'click #create_reservation': function (e) {
        var resources = Session.get(selectedResourcesKey);
        var newLocation = '/calendar/';
        for (var i = 0; i < resources.length; i++) {
            newLocation += resources[i]._id
            if (i != resources.length-1){
                newLocation += ","
            }
        };
        window.location.href = newLocation;
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
    },
    selectedResources: function () {
        return Session.get(selectedResourcesKey);
    }
});
